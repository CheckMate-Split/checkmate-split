import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import OutlineButton from './OutlineButton';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  visible: boolean;
  mode: 'scan' | 'upload';
  onRetry: () => void;
  onManual: () => void;
  onClose: () => void;
}

export default function BottomDrawer({
  visible,
  mode,
  onRetry,
  onManual,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.content}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.message}>We can't read that reciept</Text>
          <Button
            title={mode === 'scan' ? 'Try a New Scan' : 'Try a New Upload'}
            onPress={() => {
              onClose();
              onRetry();
            }}
            style={styles.button}
          />
          <OutlineButton
            title="Enter Manually"
            onPress={() => {
              onClose();
              onManual();
            }}
            style={styles.button}
          />
          <OutlineButton
            title="Cancel"
            onPress={onClose}
            style={styles.cancelButton}
            textColor={colors.pinkRed}
            borderColor={colors.pinkRed}
          />
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
  message: {
    marginTop: spacing.s,
    marginBottom: spacing.l * 1.5,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  close: {
    position: 'absolute',
    right: spacing.m,
    top: spacing.s,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
  cancelButton: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
});
