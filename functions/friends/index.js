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
    .doc(from)
    .collection('sentRequests')
    .doc(to)
    .set({ to, createdAt: admin.firestore.FieldValue.serverTimestamp() });
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
  const allow = toDoc.data()?.notificationSettings?.friendReq !== false;
  if (token && allow) {
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
  await db.collection('users').doc(from).collection('sentRequests').doc(to).delete();
  if (accept) {
    await db.collection('users').doc(to).collection('friends').doc(from).set({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
    await db.collection('users').doc(from).collection('friends').doc(to).set({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
    const fromDoc = await db.collection('users').doc(from).get();
    const token = fromDoc.data()?.fcmToken;
    const allow = fromDoc.data()?.notificationSettings?.friendAccept !== false;
    if (token && allow) {
      await admin.messaging().send({
        token,
        notification: {
          title: 'Friend Request Accepted',
          body: 'Your friend request was accepted',
        },
        data: { type: 'friendAccept', uid: to },
      });
    }
  }
  return { success: true };
});

exports.withdrawFriendRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const to = (data.to || '').trim();
  if (!to) {
    throw new functions.https.HttpsError('invalid-argument', 'missing recipient');
  }
  const from = context.auth.uid;
  await db.collection('users').doc(to).collection('friendRequests').doc(from).delete();
  await db.collection('users').doc(from).collection('sentRequests').doc(to).delete();
  return { success: true };
});

exports.createGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const name = (data.name || '').trim();
  const description = (data.description || '').trim();
  const members = Array.isArray(data.members) ? data.members : [];
  if (!name) {
    throw new functions.https.HttpsError('invalid-argument', 'missing group info');
  }
  const owner = context.auth.uid;
  if (!members.includes(owner)) members.push(owner);
  const groupRef = await db.collection('groups').add({
    name,
    description,
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

exports.sendGroupInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const groupId = (data.groupId || '').trim();
  const to = (data.to || '').trim();
  if (!groupId || !to) {
    throw new functions.https.HttpsError('invalid-argument', 'missing info');
  }
  const from = context.auth.uid;
  const invite = { from, createdAt: admin.firestore.FieldValue.serverTimestamp() };
  await db.collection('groups').doc(groupId).collection('invites').doc(to).set(invite);
  await db.collection('users').doc(to).collection('groupInvites').doc(groupId).set({ from, groupId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  const toDoc = await db.collection('users').doc(to).get();
  const token = toDoc.data()?.fcmToken;
  const allow = toDoc.data()?.notificationSettings?.groupInvite !== false;
  if (token && allow) {
    await admin.messaging().send({
      token,
      notification: {
        title: 'Group Invite',
        body: 'You have been invited to join a group',
      },
      data: { type: 'groupInvite', groupId },
    });
  }
  return { success: true };
});

exports.respondGroupInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const groupId = (data.groupId || '').trim();
  const accept = !!data.accept;
  const uid = context.auth.uid;
  if (!groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'missing info');
  }
  await db.collection('groups').doc(groupId).collection('invites').doc(uid).delete();
  await db.collection('users').doc(uid).collection('groupInvites').doc(groupId).delete();
  if (accept) {
    await db.collection('groups').doc(groupId).update({ members: admin.firestore.FieldValue.arrayUnion(uid) });
    await db.collection('users').doc(uid).collection('groups').doc(groupId).set({ groupId });
  }
  return { success: true };
});

exports.withdrawGroupInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const groupId = (data.groupId || '').trim();
  const to = (data.to || '').trim();
  if (!groupId || !to) {
    throw new functions.https.HttpsError('invalid-argument', 'missing info');
  }
  await db.collection('groups').doc(groupId).collection('invites').doc(to).delete();
  await db.collection('users').doc(to).collection('groupInvites').doc(groupId).delete();
  return { success: true };
});

exports.updateGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const id = (data.id || '').trim();
  const name = (data.name || '').trim();
  const description = (data.description || '').trim();
  if (!id || !name) {
    throw new functions.https.HttpsError('invalid-argument', 'missing info');
  }
  const ref = db.collection('groups').doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'group not found');
  }
  if (snap.data().owner !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'only owner can edit');
  }
  await ref.update({ name, description });
  return { success: true };
});

exports.deleteGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const id = (data.id || '').trim();
  if (!id) {
    throw new functions.https.HttpsError('invalid-argument', 'missing group id');
  }
  const ref = db.collection('groups').doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'group not found');
  }
  const group = snap.data();
  if (group.owner !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'only owner can delete');
  }
  const members = group.members || [];
  await Promise.all(
    members.map(uid =>
      db.collection('users').doc(uid).collection('groups').doc(id).delete()
    )
  );
  await ref.delete();
  return { success: true };
});

exports.leaveGroup = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'user not authenticated');
  }
  const groupId = (data.groupId || '').trim();
  if (!groupId) {
    throw new functions.https.HttpsError('invalid-argument', 'missing group id');
  }
  const uid = context.auth.uid;
  const ref = db.collection('groups').doc(groupId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'group not found');
  }
  const group = snap.data();
  if (group.owner === uid) {
    throw new functions.https.HttpsError('failed-precondition', 'owner cannot leave');
  }
  await ref.update({ members: admin.firestore.FieldValue.arrayRemove(uid) });
  await db.collection('users').doc(uid).collection('groups').doc(groupId).delete();
  return { success: true };
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
