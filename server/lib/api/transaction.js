const logger = require('../logger');
const request = require('request');
const config = require('../../config');
const db = require('../db');

const API_URL = `http://${config.bcoin_http}:${config.bcoin['http-port']}`;
const MAX_TXS = config.api.max_txs;

module.exports = function transactionAPI(router) {
  // Txs by txid
  router.get('/tx/:txid', (req, res) => {
    // Get max block height for calculating confirmations
    const height = db.blocks.bestHeight();
    const txid = req.params.txid || '';

    return db.txs.getTxById(txid, (err, tx) => {
      if (err || !tx) {
        logger.log('error',
          `/tx/:tid getTxById: ${err ? err.err : ''}`);
        return res.status(404).send();
      }

      return res.send({
        txid: tx.hash,
        version: tx.version,
        time: tx.ps,
        blocktime: tx.ps,
        locktime: tx.locktime,
        blockhash: tx.block,
        fees: tx.fee / 1e8,
        size: tx.size,
        confirmations: (height - tx.height) + 1,
        valueOut: tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
        vin: tx.inputs.map(input => ({
          addr: input.address,
          value: input.value / 1e8,
        })),
        vout: tx.outputs.map(output => ({
          scriptPubKey: {
            addresses: [output.address],
          },
          value: output.value / 1e8,
        })),
        isCoinBase: tx.inputs[0].prevout.hash === '0000000000000000000000000000000000000000000000000000000000000000',
      });
    });
  });

  // /txs is overloaded. Next ver separate concerns
  // query by block
  // query by address
  router.get('/txs', (req, res) => {
    const pageNum    = parseInt(req.query.pageNum, 10)  || 0;
    const height     = db.blocks.bestHeight();
    // get txs for blockhash, start with best height to calc confirmations
    if (req.query.block) {
      return db.txs.getTxCountByBlock(req.query.block, (err, count) => {
        if (err) {
          logger.log('error',
            `getTxByBlock ${err}`);
          return res.status(404).send();
        }
        const totalPages = Math.ceil(count / MAX_TXS);

        return db.txs.getTxByBlock(req.query.block, pageNum, MAX_TXS, (error, txs) => {
          if (error) {
            logger.log('error',
              `getTxByBlock ${error}`);
            return res.status(404).send();
          }

          return res.send({
            pagesTotal: totalPages,
            txs: txs.map(tx => ({
              txid: tx.hash,
              fees: tx.fee / 1e8,
              size: tx.size,
              confirmations: (height - tx.height) + 1,
              valueOut: tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
              vin: tx.inputs.map(input => ({
                scriptSig: {
                  asm: input.script,
                },
                addr: input.address,
                value: input.value / 1e8,
              })),
              vout: tx.outputs.map(output => ({
                scriptPubKey: {
                  asm: output.script,
                  addresses: [output.address],
                },
                value: output.value / 1e8,
              })),
              isCoinBase: tx.inputs[0].prevout.hash === '0000000000000000000000000000000000000000000000000000000000000000',
            })),
          });
        });
      });
    } else if (req.query.address) {
      // Get txs by address, start with best height to calc confirmations
      const addr = req.query.address || '';

      return db.txs.getTxCountByAddress(addr, (err, count) => {
        if (err) {
          logger.log('error',
            `getTxByBlock ${err}`);
          return res.status(404).send();
        }
        const totalPages = Math.ceil(count / MAX_TXS);

        return db.txs.getTxByAddress(addr, pageNum, MAX_TXS, (error, txs) => {
          if (error) {
            logger.log('error',
              `getTxByBlock ${error}`);
            return res.status(404).send();
          }
          return res.send({
            pagesTotal: totalPages,
            txs: txs.map(tx => ({
              txid: tx.hash,
              fees: tx.fee / 1e8,
              size: tx.size,
              confirmations: (height - tx.height) + 1,
              valueOut: tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
              vin: tx.inputs.map(input => ({
                scriptSig: {
                  asm: input.script,
                },
                addr: input.address,
                value: input.value / 1e8,
              })),
              vout: tx.outputs.map(output => ({
                scriptPubKey: {
                  asm: output.script,
                  addresses: [output.address],
                },
                value: output.value / 1e8,
              })),
              isCoinBase: tx.inputs[0].prevout.hash === '0000000000000000000000000000000000000000000000000000000000000000',
            })),
          });
        });
      });
    }
    // Get last n txs
    return db.txs.getTopTransactions((err, txs) => {
      if (err) {
        logger.log('err',
          `/txs getTopTransactions ${err}`);
        return res.status(404).send(err);
      }
      return res.send(txs.map(tx => ({
        txid: tx.hash,
        fees: tx.fee / 1e8,
        size: tx.size,
        confirmations: (height - tx.height) + 1,
        valueOut: tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e8,
        vin: tx.inputs.map(input => ({
          scriptSig: {
            asm: input.script,
          },
          addr: input.address,
          value: input.value / 1e8,
        })),
        vout: tx.outputs.map(output => ({
          scriptPubKey: {
            asm: output.script,
            addresses: [output.address],
          },
          value: output.value / 1e8,
        })),
        isCoinBase: tx.inputs[0].prevout.hash === '0000000000000000000000000000000000000000000000000000000000000000',
      })),
      );
    });
  });

  router.get('/rawtx/:txid', (req, res) => res.send(req.params.txid));

  router.post('/tx/send', (req, res) => {
    const rawtx = req.body.rawtx || '';
    request.post({
      url: `${API_URL}/broadcast`,
      body: { tx: rawtx },
      json: true,
    }, (err, localRes, body) => {
      if (err) {
        logger.log('error',
          `${err}`);
        return res.status(404).send(err);
      }

      return res.json(true);
    });
  });
};
