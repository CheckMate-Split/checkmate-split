const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.checkUsername = functions.https.onCall(async (data, context) => {
  const username = (data.username || '').trim();
  if (!username) {
    throw new functions.https.HttpsError('invalid-argument', 'missing username');
  }
  const snap = await admin
    .firestore()
    .collection('users')
    .where('username', '==', username)
    .limit(1)
    .get();
  const uid = context.auth ? context.auth.uid : undefined;
  const available = snap.empty || snap.docs[0].id === uid;
  return { available };
});
