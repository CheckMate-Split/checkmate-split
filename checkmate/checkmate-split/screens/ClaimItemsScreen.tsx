import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import SplitDrawer from '../components/SplitDrawer';
import { colors, spacing } from '../constants';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export type ClaimItemsParams = {
  ClaimItems: { receipt: any; fromManage?: boolean; uid?: string };
};

interface Item {
  description: string;
  amount: { data: number };
  shared?: boolean;
  responsible?: string;
  __index: number;
}

export default function ClaimItemsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ClaimItemsParams, 'ClaimItems'>>();
  const { receipt, fromManage, uid } = route.params;
  const userId = uid || auth.currentUser?.uid || '';
  const payer = receipt.payer;

  const withIndex: Item[] = (receipt.data?.lineItems || []).map((i: any, idx: number) => ({
    ...i,
    __index: idx,
  }));

  const joinable = withIndex.filter(i => i.shared);
  const initialUnclaimed = withIndex.filter(
    i => !i.shared && ((i.responsible || payer) === payer)
  );
  const initialClaimed = withIndex.filter(
    i => !i.shared && (i.responsible || payer) === userId
  );
  const others = withIndex.filter(
    i =>
      !i.shared &&
      (i.responsible || payer) !== userId &&
      (i.responsible || payer) !== payer
  );
  const [unclaimed, setUnclaimed] = useState<Item[]>(initialUnclaimed);
  const [availableSplits, setAvailableSplits] = useState<Item[]>(joinable);
  const [claimed, setClaimed] = useState<Item[]>(initialClaimed);
  const [shared, setShared] = useState<Item[]>([]);
  const [split, setSplit] = useState<{ item: Item; percent: number }[]>([]);

  const [drawerItem, setDrawerItem] = useState<Item | null>(null);
  const [drawerMode, setDrawerMode] = useState<'claim' | 'join'>('claim');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const claim = (item: Item) => {
    setUnclaimed(unclaimed.filter(i => i !== item));
    setClaimed([...claimed, item]);
  };

  const unclaim = (item: Item) => {
    setClaimed(claimed.filter(i => i !== item));
    setUnclaimed([...unclaimed, item]);
  };

  const splitEqually = (item: Item) => {
    setUnclaimed(unclaimed.filter(i => i !== item));
    setShared([...shared, item]);
  };

  const claimPortion = (item: Item, percent: number) => {
    setUnclaimed(unclaimed.filter(i => i !== item));
    setSplit([...split, { item, percent }]);
  };

  const joinPortion = (item: Item, percent: number) => {
    setAvailableSplits(availableSplits.filter(i => i !== item));
    setSplit([...split, { item, percent }]);
  };

  const joinEqual = (item: Item) => {
    setAvailableSplits(availableSplits.filter(i => i !== item));
    setShared([...shared, item]);
  };

  const unclaimSplit = (entry: { item: Item; percent: number }) => {
    const remaining = split.filter(s => s !== entry);
    setSplit(remaining);
    const stillClaimed = remaining.some(s => s.item === entry.item);
    if (stillClaimed) {
      setAvailableSplits([...availableSplits, entry.item]);
    } else {
      setAvailableSplits(availableSplits.filter(i => i !== entry.item));
      setUnclaimed([...unclaimed, entry.item]);
    }
  };

  const openDrawer = (item: Item, mode: 'claim' | 'join' = 'claim') => {
    setDrawerItem(item);
    setDrawerMode(mode);
    setDrawerVisible(true);
  };

  const renderRow = (item: Item, actions: React.ReactNode) => (
    <View key={item.description} style={styles.itemRow}>
      <Text style={styles.itemText}>
        {item.description} - ${Number(item.amount?.data || 0).toFixed(2)}
      </Text>
      <View style={styles.actionRow}>{actions}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Claim Items" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {unclaimed.length > 0 && (
          <View>
            <Text style={styles.section}>Unclaimed</Text>
            {unclaimed.map(i =>
              renderRow(
                i,
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => claim(i)} style={styles.smallBtn}>
                    <Text style={styles.btnText}>Claim</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openDrawer(i)} style={styles.smallBtn}>
                    <Text style={styles.btnText}>Split</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        )}
        {availableSplits.length > 0 && (
          <View>
            <Text style={styles.section}>Split</Text>
            {availableSplits.map(i =>
              renderRow(
                i,
                <TouchableOpacity onPress={() => openDrawer(i, 'join')} style={styles.smallBtn}>
                  <Text style={styles.btnText}>Join Split</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
        {claimed.length > 0 && (
          <View>
            <Text style={styles.section}>Claimed By Me</Text>
            {claimed.map(i =>
              renderRow(
                i,
                <TouchableOpacity onPress={() => unclaim(i)} style={styles.smallBtn}>
                  <Text style={styles.btnText}>Unclaim</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
        {shared.length > 0 && (
          <View>
            <Text style={styles.section}>Shared</Text>
            {shared.map(i => renderRow(i, null))}
          </View>
        )}
        {split.length > 0 && (
          <View>
            <Text style={styles.section}>My Splits</Text>
            {split.map(s =>
              renderRow(
                s.item,
                <View style={styles.buttonRow}>
                  <Text style={styles.percent}>{s.percent}%</Text>
                  <TouchableOpacity onPress={() => unclaimSplit(s)} style={styles.smallBtn}>
                    <Text style={styles.btnText}>Unclaim</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        )}
        {others.length > 0 && (
          <View>
            <Text style={styles.section}>Others</Text>
            {others.map(i => renderRow(i, null))}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Confirm"
          onPress={async () => {
            try {
              const updated = [...withIndex];
              claimed.forEach(it => {
                updated[it.__index] = { ...updated[it.__index], responsible: userId };
              });
              unclaimed.forEach(it => {
                updated[it.__index] = { ...updated[it.__index], responsible: payer };
              });
              await updateDoc(doc(db, 'receipts', receipt.id), {
                'data.lineItems': updated.map(({ __index, ...rest }) => rest),
                participants: Array.from(
                  new Set([...(receipt.participants || []), userId])
                ),
              });
              const newReceipt = {
                ...receipt,
                data: { ...receipt.data, lineItems: updated.map(({ __index, ...rest }) => rest) },
                participants: Array.from(
                  new Set([...(receipt.participants || []), userId])
                ),
              };
              if (fromManage) {
                navigation.navigate('ManageReceipt', { receipt: newReceipt });
              } else {
                navigation.navigate('ManageReceipt', { receipt: newReceipt, fromCreate: true });
              }
            } catch (e) {
              console.error(e);
              if (fromManage) navigation.goBack();
              else navigation.navigate('ManageReceipt', { receipt, fromCreate: true });
            }
          }}
        />
      </View>
      <SplitDrawer
        visible={drawerVisible}
        onSplitEqual={() => {
          if (!drawerItem) return;
          if (drawerMode === 'join') joinEqual(drawerItem);
          else splitEqually(drawerItem);
          setDrawerVisible(false);
        }}
        onClaimPortion={pct => {
          if (!drawerItem) return;
          if (drawerMode === 'join') joinPortion(drawerItem, pct);
          else claimPortion(drawerItem, pct);
          setDrawerVisible(false);
        }}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  section: { marginTop: spacing.m, fontWeight: '600', fontSize: 28 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: { flex: 0.75, fontSize: 20 },
  actionRow: { flexDirection: 'row' },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 16,
    marginLeft: spacing.s / 2,
  },
  btnText: { color: colors.primary, fontWeight: '500' },
  percent: {
    fontWeight: '600',
    marginLeft: spacing.s,
    marginRight: spacing.m,
    fontSize: 20,
    alignSelf: 'center',
  },
  footer: { padding: spacing.m },
});
