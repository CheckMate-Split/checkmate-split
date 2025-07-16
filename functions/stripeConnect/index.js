const functions = require('firebase-functions');
const Stripe = require('stripe');

// Use Firebase config to store Stripe secret key if set
const STRIPE_SECRET_KEY = functions.config().stripe?.secret;
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

exports.createStripeConnectLink = functions.https.onCall(async (data, context) => {
  try {
    const account = await stripe.accounts.create({ type: 'express' });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
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

exports.getBalance = functions.https.onCall(async () => {
  try {
    const bal = await stripe.balance.retrieve();
    const amount = bal.available[0] ? bal.available[0].amount : 0;
    return { balance: amount };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'failed to retrieve balance');
  }
});
