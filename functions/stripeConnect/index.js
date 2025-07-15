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
