const functions = require('firebase-functions');
const fetch = require('node-fetch');
const FormData = require('form-data');
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}



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
  const size = Buffer.byteLength(image, 'base64');
  if (size > 20 * 1024 * 1024) {
    throw new functions.https.HttpsError('invalid-argument', 'Image too large');
  }

  try {
    const form = new FormData();
    form.append('file', Buffer.from(image, 'base64'), { filename: 'receipt.jpg' });
    form.append('extractLineItems', 'true');
    form.append('extractTime', 'false');
    form.append('refresh', 'false');
    form.append('incognito', 'false');
    const response = await fetch('https://api.taggun.io/api/receipt/v1/verbose/file', {
      method: 'POST',
      headers: {
        apikey: TAGGUN_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    const text = await response.text();
    if (!response.ok) {
      functions.logger.error('TagGun request failed', {
        status: response.status,
        body: text,
      });
      throw new functions.https.HttpsError('internal', 'TagGun request failed', {
        status: response.status,
      });
    }

    const result = JSON.parse(text);
    const lineItems = [];
    if (result.entities && Array.isArray(result.entities.productLineItems)) {
      for (const item of result.entities.productLineItems) {
        lineItems.push({
          description: item.data?.name?.data || item.text || '',
          amount: { data: item.data?.totalPrice?.data },
        });
      }
    }
    if (result.taxAmount && result.taxAmount.data != null) {
      lineItems.push({ description: 'Tax', amount: { data: result.taxAmount.data } });
    }
    result.lineItems = lineItems;
    return { success: true, data: result };
  } catch (err) {
    console.error(err);
    const msg = err && err.message ? err.message : String(err);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to scan receipt: ${msg}`,
      {
        uid: context.auth.uid,
      }
    );
  }
});
