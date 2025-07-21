const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Moov } = require('@moovio/sdk');

if (!admin.apps.length) {
  admin.initializeApp();
}

const MOOV_PUBLIC = functions.config().moov?.public;
const MOOV_SECRET = functions.config().moov?.secret;
const client = new Moov({
  serverURL: 'https://api.moov.io',
  xMoovVersion: 'v2024.01.00',
  security: { username: MOOV_PUBLIC, password: MOOV_SECRET },
});

exports.createMoovWallet = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const uid = context.auth.uid;
  try {
    const ref = admin.firestore().collection('moovWallets').doc(uid);
    const doc = await ref.get();
    if (doc.exists) {
      return { walletId: doc.data().walletId };
    }
    const wallet = await client.wallets.createWallet({ name: uid });
    await ref.set({ walletId: wallet.walletID });
    return { walletId: wallet.walletID };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to create wallet');
  }
});

exports.getMoovBalance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const uid = context.auth.uid;
  try {
    const snap = await admin.firestore().collection('moovWallets').doc(uid).get();
    if (!snap.exists) return { balance: 0 };
    const walletId = snap.data().walletId;
    const bal = await client.wallets.getBalance(walletId);
    return { balance: bal.available?.value || 0 };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to fetch balance');
  }
});

exports.createMoovPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const { amount, destWallet } = data;
  if (!amount || !destWallet) {
    throw new functions.https.HttpsError('invalid-argument', 'missing payment info');
  }
  const uid = context.auth.uid;
  try {
    const snap = await admin.firestore().collection('moovWallets').doc(uid).get();
    if (!snap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'no wallet');
    }
    const walletId = snap.data().walletId;
    const payment = await client.payments.createPayment({
      source: { walletID: walletId },
      destination: { walletID: destWallet },
      amount: { currency: 'USD', value: amount },
    });
    return { paymentID: payment.paymentID };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to send payment');
  }
});
