const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Moov } = require('@moovio/sdk');
const { randomUUID } = require('crypto');

if (!admin.apps.length) {
  admin.initializeApp();
  // Strip undefined values so Firestore writes don't fail
  admin.firestore().settings({ ignoreUndefinedProperties: true });
}

const MOOV_PUBLIC = functions.config().moov?.public;
const MOOV_SECRET = functions.config().moov?.secret;
console.log('Moov env', { hasPublic: !!MOOV_PUBLIC, hasSecret: !!MOOV_SECRET });
const ORIGIN = 'https://app.checkmate.ai';
const client = new Moov({
  serverURL: 'https://api.moov.io',
  xMoovVersion: 'v2024.01.00',
  security: { username: MOOV_PUBLIC, password: MOOV_SECRET },
});

async function waitForWallet(accountID) {
  for (let i = 0; i < 5; i++) {
    const res = await client.wallets.list({ accountID });
    const arr = res.result ?? res;
    const id = arr[0]?.walletID;
    if (id) return id;
    await new Promise(r => setTimeout(r, 1000));
  }
  return undefined;
}

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
    // Create an individual account with wallet capability
    const userSnap = await admin.firestore().collection('users').doc(uid).get();
    const first = userSnap.data()?.first || 'CheckMate';
    const last = userSnap.data()?.last || uid;
// generate a TOS token (origin must be provided to satisfy API requirements)
const tokenRes = await client.accounts.getTermsOfServiceToken(
  { origin: ORIGIN },
  { headers: { origin: ORIGIN } },
);
const token = tokenRes.result?.token || tokenRes.token;
if (!token) throw new Error('missing terms of service token');

const addr = data?.address;
const profile = {
  individual: {
    name: { firstName: first, lastName: last },
    ...(addr && { address: addr }),
    ...(data?.dob && { dob: data.dob }),
    ...(data?.email && { email: data.email }),
    ...(data?.phone && { phone: data.phone }),
    ...(data?.ssn && { ssn: data.ssn }),
  },
};

    const account = await client.accounts.create({
      accountType: 'individual',
      profile,
      termsOfService: { token },
      capabilities: ['wallet'],
    });
    const accountID = account.result?.accountID || account.accountID;
    const walletId = await waitForWallet(accountID);
    await ref.set({ accountId: accountID, ...(walletId && { walletId }) });
    if (walletId) {
      return { walletId };
    }
    return { walletPending: true };
  } catch (err) {
    console.error(err);
    const msg = err && err.message ? err.message : String(err);
    throw new functions.https.HttpsError(
      'internal',
      `failed to create wallet: ${msg}`,
    );
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
    const { walletId, accountId } = snap.data();
    const res = await client.wallets.get({ accountID: accountId, walletID: walletId });
    return { balance: res.availableBalance?.value || 0 };
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
    const { walletId, accountId } = snap.data();
    const transfer = await client.transfers.create({
      xIdempotencyKey: randomUUID(),
      accountID: accountId,
      createTransfer: {
        source: { paymentMethodID: walletId },
        destination: { paymentMethodID: destWallet },
        amount: { currency: 'USD', value: amount },
      },
    });
    return { transferID: transfer.transferID };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to send payment');
  }
});

exports.completeMoovKYC = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const uid = context.auth.uid;
  const ref = admin.firestore().collection('moovWallets').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'no account');
  }
  const { accountId } = snap.data();
  try {
    const addr = data.address;
    await client.accounts.update({
      accountID: accountId,
      profile: {
        individual: {
          ...(addr && { address: addr }),
          ...(data.dob && { dob: data.dob }),
          ...(data.email && { email: data.email }),
          ...(data.phone && { phone: data.phone }),
          ...(data.ssn && { ssn: data.ssn }),
        },
      },
    });
    return { submitted: true };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to submit info');
  }
});

exports.checkWalletStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const uid = context.auth.uid;
  const snap = await admin.firestore().collection('moovWallets').doc(uid).get();
  if (!snap.exists) return { pending: true };
  const { accountId } = snap.data();
  const id = await waitForWallet(accountId);
  if (id) {
    await snap.ref.update({ walletId: id });
    return { walletId: id };
  }
  return { pending: true };
});
