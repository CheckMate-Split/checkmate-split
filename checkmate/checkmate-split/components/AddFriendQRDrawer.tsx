import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddFriendQRDrawer({ visible, onClose }: Props) {
  const uid = auth.currentUser?.uid || '';
  const link = `checkmate://add-friend?uid=${uid}`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.content}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>My QR Code</Text>
          <View style={styles.qrWrapper}>
            <QRCode value={link} size={220} />
          </View>
          <TouchableOpacity
            style={styles.share}
            onPress={() => Share.share({ message: link })}
          >
            <Ionicons name="share" size={28} color={colors.primary} />
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  share: {
    padding: spacing.s,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
});
