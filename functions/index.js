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
  completeMoovKYC,
  checkWalletStatus,
} = require('./moov');
const { checkUsername } = require('./username');
const {
  sendFriendRequest,
  respondFriendRequest,
  withdrawFriendRequest,
  createGroup,
  sendGroupInvite,
  respondGroupInvite,
  withdrawGroupInvite,
  registerFcmToken,
} = require('./friends');

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
exports.withdrawFriendRequest = withdrawFriendRequest;
exports.createGroup = createGroup;
exports.sendGroupInvite = sendGroupInvite;
exports.respondGroupInvite = respondGroupInvite;
exports.withdrawGroupInvite = withdrawGroupInvite;
exports.createMoovWallet = createMoovWallet;
exports.getMoovBalance = getMoovBalance;
exports.createMoovPayment = createMoovPayment;
exports.completeMoovKYC = completeMoovKYC;
exports.checkWalletStatus = checkWalletStatus;
exports.registerFcmToken = registerFcmToken;
