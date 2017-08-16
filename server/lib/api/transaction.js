const Block  = require('../../models/block.js');
const Transaction = require('../../models/transaction');
const logger = require('../logger');
const request = require('request');
const config = require('../../config');

const MAX_TXS = 10;
const MAX_BLOCKS = 1;

// Shoe horned in. Not dry, also in blocks. Make db api later
function getBlock(params, options, limit, cb) {
  const defaultOptions = { _id: 0 };

  if (!Number.isInteger(limit)) {
    limit = MAX_BLOCKS;
  }

  Object.assign(defaultOptions, options);

  Block.find(
    params,
    defaultOptions,
    cb)
    .sort({ height: -1 })
    .limit(limit);
}


function getTransactions(params, options, cb) {
  const defaultOptions = { _id: 0 };

  Object.assign(defaultOptions, options);

  Transaction.find(
    params,
    defaultOptions,
    cb)
    .sort({ height: 1 })
    .limit(MAX_TXS);
}

module.exports = function transactionAPI(router) {
  router.get('/tx/:txid', (req, res) => {
    getBlock(
      {},
      { height: 1 },
      1,
      (err, block) => {
        if (err) {
          res.status(404).send();
          logger.log('err', err);
        }
        if (block[0]) {
          const height = block[0].height;

          request(`http://${config.bcoin_http}:${config.bcoin['http-port']}/tx/${req.params.txid}`, (err, localRes, body) => {
            if (err) {
              logger.log('error',
                `${err}`);
            }
            try {
              body = JSON.parse(body);
            } catch (e) {
              logger.log('error',
                `${err}`);
              res.status(404).send();
              return;
            }
            if (!body || !body.hash) {
              logger.log('error',
                'No results found');
              res.status(404).send();
              return;
            }
            res.send({
              txid: body.hash,
              version: body.version,
              time: body.ps,
              blocktime: body.ps,
              locktime: body.locktime,
              blockhash: body.block,
              fees: body.fee / 1e8,
              confirmations: height - body.height + 1,
              valueOut: body.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
              vin: body.inputs.map(input => ({
                addr: input.coin ? input.coin.address : '',
                value: input.coin ? input.coin.value / 1e8 : 0,
              })),
              vout: body.outputs.map(output => ({
                scriptPubKey: {
                  addresses: [output.address],
                },
                value: output.value / 1e8,
              })),
              isCoinbase: body.inputs[0].prevout.hash === '0000000000000000000000000000000000000000000000000000000000000000',
            });
          });
        }
      });
  });

  // That callback hell
  router.get('/txs', (req, res) => {
    const pageNum    = parseInt(req.query.pageNum)  || 0;
    const rangeStart = pageNum * MAX_TXS;
    const rangeEnd   = rangeStart + MAX_TXS;

    if (req.query.block) {
      getBlock(
        {},
        { height: 1 },
        1,
        (err, block) => {
          if (err) {
            res.status(404).send();
            logger.log('err', err);
          }
          if (block[0]) {
            const height = block[0].height;
            request(`http://${config.bcoin_http}:${config.bcoin['http-port']}/block/${req.query.block}`, (err, localRes, body) => {
              if (err) {
                logger.log('error',
                  `${err}`);
              }
              try {
                body = JSON.parse(body);
              } catch (e) {
                logger.log('error',
                  `${err}`);
                res.status(404).send();
              }
              if (!body.txs.length) {
                logger.log('error',
                  `${'No tx results'}`);
                res.status(404).send();
              }
              const totalPages = Math.ceil(body.txs.length / MAX_TXS);
              body.txs = body.txs.slice(rangeStart, rangeEnd);

              res.send({
                pagesTotal: totalPages,
                txs: body.txs.map(tx => ({
                  txid: tx.hash,
                  fees: tx.fee / 1e8,
                  confirmations: height - body.height + 1,
                  valueOut: tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
                  vin: tx.inputs.map(input => ({
                    addr: input.coin ? input.coin.address : '',
                    value: input.coin ? input.coin.value / 1e8 : 0,
                  })),
                  vout: tx.outputs.map(output => ({
                    scriptPubKey: {
                      addresses: [output.address],
                    },
                    value: output.value / 1e8,
                  })),
                  output: tx.outputs,
                })),
              });
            });
          }
        });
    } else if (req.query.address) {
      getBlock(
        {},
        { height: 1 },
        1,
        (err, block) => {
          if (err) {
            res.status(404).send();
            logger.log('err', err);
          }
          if (block[0]) {
            const height = block[0].height;
            request(`http://${config.bcoin_http}:${config.bcoin['http-port']}/tx/address/${req.query.address}`, (err, localRes, body) => {
              if (err) {
                logger.log('error',
                  `${err}`);
              }
              try {
                body = JSON.parse(body);
              } catch (e) {
                logger.log('error',
                  `${err}`);
              }
              res.send({
                pagesTotal: 1,
                txs: body.map(tx => ({
                  txid: tx.hash,
                  fees: tx.fee / 1e8,
                  confirmations: height - tx.height +  1,
                  valueOut: tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
                  vin: tx.inputs.map(input => ({
                    addr: input.coin ? input.coin.address : '',
                    value: input.coin ? input.coin.value / 1e8 : 0,
                  })),
                  vout: tx.outputs.map(output => ({
                    scriptPubKey: {
                      addresses: [output.address],
                    },
                    value: output.value / 1e8,
                  })),
                  output: tx.outputs,
                })),
              });
            });
          }
        });
    } else {
      getTransactions(
        {},
        {},
        (err, txs) => {
          if (err) {
            res.status(404).send();
          }
          res.json({
            pagesTotal: 1,
            txs: txs.map(tx => ({
              txid: tx.hash,
              version: tx.version,
              locktime: tx.locktime,
              vin: tx.inputs.map(input => ({
                coinbase: input.script,
                sequence: input.sequence,
                n: 0,
              })),
              vout: tx.outputs.map(output => ({
                value: output.value,
                n: 0,
                scriptPubKey: {
                  hex: '',
                  asm: '',
                  addresses: [output.address],
                  type: output.type,
                },
                spentTxid: '',
                spentIndex: 0,
                spentHeight: 0,
              })),
            })),
          });
        },
      );
    }
  });

  router.get('/rawtx/:txid', (req, res) => {
    res.send(req.params.txid);
  });

  router.post('/tx/send', (req, res) => {
    const rawtx = req.body.rawtx || '';
    request.post({
      url: `http://${config.bcoin_http}:${config.bcoin['http-port']}/broadcast`,
      body: {"tx": rawtx },
      json: true,
    }, (err, localRes, body) => {
      if (err) {
        logger.log('error',
          `${err}`);
        res.status(400).send(err);
        return;
      }

      res.json(true);
    });
  });
};
