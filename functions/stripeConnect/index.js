const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

if (!admin.apps.length) {
  admin.initializeApp();
}

// Use Firebase config to store Stripe secret key if set
const STRIPE_SECRET_KEY = functions.config().stripe?.secret;
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

exports.createStripeConnectLink = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
    }
    const uid = context.auth.uid;
    const ref = admin.firestore().collection('stripeAccounts').doc(uid);
    let accountId;
    const existing = await ref.get();
    if (existing.exists) {
      accountId = existing.data().accountId;
    }
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        business_type: 'individual',
        business_profile: {
          product_description: 'using checkmate app to split payments',
        },
      });
      accountId = account.id;
      await ref.set({ accountId }, { merge: true });
    }
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: data.refreshUrl || functions.config().stripe.refresh_url || 'https://example.com/reauth',
      return_url: data.returnUrl || functions.config().stripe.return_url || 'https://example.com/return',
      type: 'account_onboarding',
    });
    return { url: accountLink.url };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to create account link');
  }
});

exports.createSetupIntent = functions.https.onCall(async (data, context) => {
  try {
    const customer = await stripe.customers.create();
    const setupIntent = await stripe.setupIntents.create({ customer: customer.id });
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' }
    );
    return {
      clientSecret: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customerId: customer.id,
    };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to create setup intent');
  }
});

exports.listPaymentMethods = functions.https.onCall(async (data, context) => {
  try {
    const { customerId } = data;
    if (!customerId) {
      throw new functions.https.HttpsError('invalid-argument', 'missing customerId');
    }
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return methods.data.map((m) => ({ id: m.id, brand: m.card.brand, last4: m.card.last4 }));
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to list payment methods');
  }
});

exports.getBalance = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
    }
    const uid = context.auth.uid;
    const doc = await admin.firestore().collection('stripeAccounts').doc(uid).get();
    if (!doc.exists) {
      return { balance: 0 };
    }
    const accountId = doc.data().accountId;
    const bal = await stripe.balance.retrieve({ stripeAccount: accountId });
    const amount = bal.available[0] ? bal.available[0].amount : 0;
    return { balance: amount };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to retrieve balance');
  }
});

exports.getConnectStatus = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
    }
    const uid = context.auth.uid;
    const doc = await admin.firestore().collection('stripeAccounts').doc(uid).get();
    if (!doc.exists) {
      return { connected: false };
    }
    const accountId = doc.data().accountId;
    const account = await stripe.accounts.retrieve(accountId);
    const connected = account.charges_enabled || account.payouts_enabled;
    return { connected };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to check connect status');
  }
});
