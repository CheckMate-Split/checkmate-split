import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  receipt: any;
  onPress: () => void;
}

export default function ReceiptCard({ receipt, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{receipt.name || receipt.data?.merchantName || 'Receipt'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: spacing.m,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.m,
  },
  title: {
    fontWeight: 'bold',
  },
});

