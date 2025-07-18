const { scanReceipt } = require('./receiptScan');
const {
  createStripeConnectLink,
  createSetupIntent,
  listPaymentMethods,
  getBalance,
  getConnectStatus,
  createPaymentIntent,
} = require('./stripeConnect');
const { checkUsername } = require('./username');

exports.scanReceipt = scanReceipt;
exports.createStripeConnectLink = createStripeConnectLink;
exports.createSetupIntent = createSetupIntent;
exports.listPaymentMethods = listPaymentMethods;
exports.getBalance = getBalance;
exports.getConnectStatus = getConnectStatus;
exports.createPaymentIntent = createPaymentIntent;
exports.checkUsername = checkUsername;
