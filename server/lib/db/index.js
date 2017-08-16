const mongoose = require('mongoose');
const logger   = require('../logger');
const Blocks   = require('./blocks');

mongoose.connection.on('error', (err) => {
  logger.log('error',
    `Failed to connect to Mongo Database
    ${err}`);
});

module.exports = {
  connect:    mongoose.connect,
  connection: mongoose.connection,
  Blocks,
};
