const express        = require('express');
const config         = require('../../config');

const app = express();
const api = express.Router();

app.set('json spaces', config.api.json_spaces);

//  Pass express to register the routes
const AddressAPI     = require('./address')(api);
const BlockAPI       = require('./block')(api);
const CurrencyAPI    = require('./currency')(api);
const StatusAPI      = require('./status')(api);
const TransactionAPI = require('./transaction')(api);
const MessageAPI     = require('./message')(api);

app.use('/api', api);

// 404
app.use((req, res) => {
  res.status(404).send({
    status: 404,
    url: req.originalUrl,
    error: 'Not found',
  });
});

module.exports = app;
