import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import OutlineButton from './OutlineButton';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  visible: boolean;
  name: string;
  paid: boolean;
  onTogglePaid: () => void;
  onEdit: () => void;
  onClose: () => void;
}

export default function PersonActionDrawer({
  visible,
  name,
  paid,
  onTogglePaid,
  onEdit,
  onClose,
}: Props) {
  const confirmPaid = () => {
    Alert.alert(paid ? 'Mark Unpaid' : 'Mark Paid', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: paid ? 'Unpaid' : 'Paid', onPress: onTogglePaid },
    ]);
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
          <Button
            title={paid ? 'Mark Unpaid' : 'Mark Paid'}
            onPress={confirmPaid}
            style={styles.button}
          />
          <OutlineButton title="Edit Items" onPress={onEdit} style={styles.button} />
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
  button: { alignSelf: 'stretch', marginTop: spacing.m },
});
