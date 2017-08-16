const Block = require('../../models/block.js');
const logger = require('../logger');
const config = require('../../config');

// move to config
const MAX_BLOCKS = 200;
const blockTemplate = new Block();

function getBlocks(params, options, limit, cb) {
  const defaultOptions = { _id: 0 };

  Object.assign(defaultOptions, options);

  if (!Number.isInteger(limit)) {
    limit = MAX_BLOCKS;
  }

  if (limit > MAX_BLOCKS) {
    limit = MAX_BLOCKS;
  }

  Block.find(
    params,
    defaultOptions,
    (err, blocks) => {
      if (err) {
        logger.log('error',
          `getBlocks: ${err}`);
        return cb(err);
      }
      if (blocks.length > 0) {
        return cb(null, blocks);
      }
      return cb(null, [blockTemplate]);
    })
    .sort({ height: -1 })
    .limit(limit);
}

function getBlock(params, options, limit, cb) {
  getBlocks(params, options, limit, (err, blocks) => {
    if (err) {
      logger.log('error',
        `getBlock: ${err}`);
      return cb(err);
    }
    if (blocks.length > 0) {
      return cb(null, blocks[0]);
    }
    return cb(null, blockTemplate);
  });
}

module.exports = {
  getBlock,
  getBlocks,
};
