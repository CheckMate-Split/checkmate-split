import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  receipt: any;
  onPress: () => void;
}

export default function ReceiptCard({ receipt, onPress }: Props) {
  const total = receipt.data?.totalAmount?.data ?? receipt.data?.total?.data;
  const paid = receipt.data?.amountToPay?.data ?? receipt.data?.amountPaid?.data;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{receipt.name || receipt.data?.merchantName || 'Receipt'}</Text>
      {total !== undefined && <Text>Total: {total}</Text>}
      {paid !== undefined && <Text>Paid: {paid}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: spacing.m,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: spacing.m,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
});

