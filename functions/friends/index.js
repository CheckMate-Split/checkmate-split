const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.sendFriendRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const to = (data.to || '').trim();
  if (!to) {
    throw new functions.https.HttpsError('invalid-argument', 'missing recipient');
  }
  const from = context.auth.uid;
  await db
    .collection('users')
    .doc(to)
    .collection('friendRequests')
    .doc(from)
    .set({ from, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  await db
    .collection('users')
    .doc(to)
    .collection('notifications')
    .add({
      type: 'friendRequest',
      from,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

  const toDoc = await db.collection('users').doc(to).get();
  const token = toDoc.data()?.fcmToken;
  if (token) {
    await admin.messaging().send({
      token,
      notification: {
        title: 'New Friend Request',
        body: 'You have a new friend request',
      },
      data: { type: 'friendRequest', from },
    });
  }
  return { success: true };
});

exports.respondFriendRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const from = (data.from || '').trim();
  const accept = !!data.accept;
  if (!from) {
    throw new functions.https.HttpsError('invalid-argument', 'missing requester');
  }
  const to = context.auth.uid;
  const reqRef = db.collection('users').doc(to).collection('friendRequests').doc(from);
  await reqRef.delete();
  if (accept) {
    await db.collection('users').doc(to).collection('friends').doc(from).set({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
    await db.collection('users').doc(from).collection('friends').doc(to).set({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  return { success: true };
});

exports.createGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const name = (data.name || '').trim();
  const members = Array.isArray(data.members) ? data.members : [];
  if (!name || members.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'missing group info');
  }
  const owner = context.auth.uid;
  if (!members.includes(owner)) members.push(owner);
  const groupRef = await db.collection('groups').add({
    name,
    owner,
    members,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await Promise.all(
    members.map(uid =>
      db.collection('users').doc(uid).collection('groups').doc(groupRef.id).set({ groupId: groupRef.id })
    )
  );
  return { id: groupRef.id };
});

exports.registerFcmToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const token = (data.token || '').trim();
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'missing token');
  }
  await db.collection('users').doc(context.auth.uid).update({ fcmToken: token });
  return { success: true };
});
