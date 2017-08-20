const Message = require('bitcore-message');
const util    = require('../util');
// Copied from previous source
function verifyMessage(req, res) {
  const address   = req.body.address || req.query.address;
  const signature = req.body.signature || req.query.signature;
  const message   = req.body.message || req.query.message;

  if (!util.isBitcoinAddress(address)) {
    return res.status(400).send({
      error: 'Invalid bitcoin address',
    });
  }

  if (!address || !signature || !message) {
    return res.json({
      message: 'Missing parameters (expected "address", "signature" and "message")',
      code: 1,
    });
  }
  let valid;
  try {
    valid = new Message(message).verify(address, signature);
  } catch (err) {
    return res.json({
      message: `Unexpected error: ${err.message}`,
      code: 1,
    });
  }
  return res.json({ result: valid });
}

module.exports = function messageAPI(router) {
  router.get('/messages/verify', (req, res) => {
    verifyMessage(req, res);
  });

  router.post('/messages/verify', (req, res) => {
    verifyMessage(req, res);
  });

  router.get('/utils/estimatefee', (req, res) => res.send('estimate fees'));
};
