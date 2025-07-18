const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Log when the module is loaded to confirm deployment and project info
functions.logger.info('loading receiptScan module', {
  project: process.env.GCLOUD_PROJECT,
  region: process.env.FUNCTION_REGION,
});

// Callable function to proxy requests to TagGun API for receipt scanning
const TAGGUN_KEY = '9eb1290f9f204bfca1c477905c74e0df';

exports.scanReceipt = functions.https.onCall(async (data, context) => {
  // Log invocation details to help troubleshoot issues with authentication
  functions.logger.info('scanReceipt invoked', {
    hasAuth: !!context.auth,
    uid: context.auth ? context.auth.uid : null,
  });

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in', {
      auth: context.auth || null,
    });
  }

  const image = data.image;
  if (!image) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing image data');
  }

  try {
    const response = await fetch('https://api.taggun.io/api/receipt/v1/verbose/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: TAGGUN_KEY,
      },
      body: JSON.stringify({
        file: image,
        filename: 'receipt.jpg',
        incognito: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`TagGun error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', 'Failed to scan receipt', {
      uid: context.auth.uid,
    });
  }
});
