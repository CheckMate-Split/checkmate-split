import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import OutlineButton from './OutlineButton';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsDrawer({ visible, onAccept, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Moov Terms of Service</Text>
          <Text style={styles.body}>
            By creating a wallet you agree to the Moov Terms of Service.
          </Text>
          <Button title="Accept & Create Wallet" onPress={onAccept} style={styles.button} />
          <OutlineButton title="Cancel" onPress={onClose} style={styles.button} />
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
  close: { position: 'absolute', right: spacing.m, top: spacing.s },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: spacing.m },
  body: { textAlign: 'center', marginBottom: spacing.m },
  button: { alignSelf: 'stretch', marginTop: spacing.m },
});
