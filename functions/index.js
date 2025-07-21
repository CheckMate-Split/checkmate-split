const { scanReceipt } = require('./receiptScan');
const {
  createStripeConnectLink,
  createSetupIntent,
  listPaymentMethods,
  getBalance,
  getConnectStatus,
  createPaymentIntent,
} = require('./stripeConnect');
const {
  createMoovWallet,
  getMoovBalance,
  createMoovPayment,
} = require('./moov');
const { checkUsername } = require('./username');
const { sendFriendRequest, respondFriendRequest, createGroup } = require('./friends');

exports.parseReciept = scanReceipt;
exports.createStripeConnectLink = createStripeConnectLink;
exports.createSetupIntent = createSetupIntent;
exports.listPaymentMethods = listPaymentMethods;
exports.getBalance = getBalance;
exports.getConnectStatus = getConnectStatus;
exports.createPaymentIntent = createPaymentIntent;
exports.checkUsername = checkUsername;
exports.sendFriendRequest = sendFriendRequest;
exports.respondFriendRequest = respondFriendRequest;
exports.createGroup = createGroup;
exports.createMoovWallet = createMoovWallet;
exports.getMoovBalance = getMoovBalance;
exports.createMoovPayment = createMoovPayment;
