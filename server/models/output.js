const mongoose = require('mongoose');

const Schema   = mongoose.Schema;

const OutputSchema = new Schema({
  address: { type: String, default: '' },
  script:  { type: String, default: '' },
  value:   { type: Number, default: 0 },
  type:    { type: String, default: '' },
});

const Output = mongoose.model('Output', OutputSchema);

module.exports = Output;
