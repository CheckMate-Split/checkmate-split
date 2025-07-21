import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import Button from './Button';
import OutlineButton from './OutlineButton';
import { colors, spacing } from '../constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, functions, auth } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';

interface Props {
  uid: string | null;
  visible: boolean;
  groupOwner?: boolean;
  onClose: () => void;
}

export default function MemberDrawer({ uid, visible, groupOwner, onClose }: Props) {
  const [user, setUser] = useState<any>(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (active) setUser(snap.exists() ? snap.data() : null);
        const fSnap = await getDoc(doc(db, 'users', auth.currentUser!.uid, 'friends', uid));
        if (active) setIsFriend(fSnap.exists());
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [uid]);

  const sendRequest = async () => {
    try {
      const fn = httpsCallable(functions, 'sendFriendRequest');
      await fn({ to: uid });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromGroup = async () => {
    // Placeholder for group removal logic
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          {user ? (
            <>
              <Text style={styles.name}>{user.first} {user.last}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              {isFriend ? (
                <Text style={styles.friendText}>{`${user.first} is your friend on Checkmate`}</Text>
              ) : (
                <Button title="Add Friend" onPress={sendRequest} style={styles.button} />
              )}
              {groupOwner && uid !== auth.currentUser?.uid && (
                <OutlineButton title="Remove from Group" onPress={removeFromGroup} style={styles.button} />
              )}
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: colors.background,
    padding: spacing.l,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    right: spacing.m,
    top: spacing.s,
  },
  name: { fontSize: 24, fontWeight: 'bold' },
  username: { marginBottom: spacing.m },
  friendText: { marginTop: spacing.m },
  button: { alignSelf: 'stretch', marginTop: spacing.m },
});
