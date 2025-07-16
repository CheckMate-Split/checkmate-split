import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import OutlineButton from '../components/OutlineButton';
import { colors, spacing } from '../constants';

export type ManageReceiptParams = {
  ManageReceipt: { receipt: any };
};

export default function ManageReceiptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ManageReceiptParams, 'ManageReceipt'>>();
  const { receipt } = route.params;

  const created = receipt.createdAt
    ? new Date(receipt.createdAt.seconds
        ? receipt.createdAt.seconds * 1000
        : receipt.createdAt)
    : new Date();

  const people = [{ id: 'me', name: 'You', status: 'Paid' }];

  const renderPerson = (p: any) => (
    <View key={p.id} style={styles.personRow}>
      <View style={styles.avatar} />
      <Text style={styles.personName}>{p.name}</Text>
      <View
        style={[styles.tag, p.status === 'Paid' ? styles.tagPaid : p.status === 'Viewed' ? styles.tagViewed : styles.tagUnpaid]}
      >
        <Text style={styles.tagText}>{p.status === 'Paid' ? 'Paid' : p.status === 'Viewed' ? 'Viewed' : 'Not Paid'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title={receipt.name || 'Receipt'} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subheader}>{`shared on ${created.toLocaleDateString()}`}</Text>
        {receipt.description ? <Text style={styles.desc}>{receipt.description}</Text> : null}
        {people.map(renderPerson)}
      </ScrollView>
      <View style={styles.footer}>
        <OutlineButton
          title="Share QR"
          onPress={() => {}}
          style={styles.shareButton}
          icon="qr-code"
        />
        <OutlineButton
          title="Share Link"
          onPress={() => {}}
          style={styles.shareButton}
          icon="link-outline"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  subheader: { color: '#666', marginTop: spacing.s },
  desc: { marginTop: spacing.s },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: spacing.m,
  },
  personName: { flex: 1 },
  tag: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s / 2,
    borderRadius: 12,
  },
  tagText: { color: '#fff', fontSize: 12 },
  tagUnpaid: { backgroundColor: '#999' },
  tagViewed: { backgroundColor: '#f88' },
  tagPaid: { backgroundColor: '#4c9a4c' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.m,
  },
  shareButton: { flex: 1, marginHorizontal: spacing.s / 2 },
});
