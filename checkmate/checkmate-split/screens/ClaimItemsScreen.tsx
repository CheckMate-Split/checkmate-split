import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import SplitDrawer from '../components/SplitDrawer';
import { colors, spacing } from '../constants';

export type ClaimItemsParams = {
  ClaimItems: { receipt: any };
};

interface Item {
  description: string;
  amount: { data: number };
}

export default function ClaimItemsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ClaimItemsParams, 'ClaimItems'>>();
  const { receipt } = route.params;
  const initial = receipt.data?.lineItems || [];

  const [unclaimed, setUnclaimed] = useState<Item[]>(initial);
  const [claimed, setClaimed] = useState<Item[]>([]);
  const [shared, setShared] = useState<Item[]>([]);
  const [split, setSplit] = useState<{ item: Item; percent: number }[]>([]);

  const [drawerItem, setDrawerItem] = useState<Item | null>(null);
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

  const openDrawer = (item: Item) => {
    setDrawerItem(item);
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
            <Text style={styles.section}>Split</Text>
            {split.map(s =>
              renderRow(
                s.item,
                <Text style={styles.percent}>{s.percent}%</Text>
              )
            )}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Confirm"
          onPress={() => navigation.navigate('ManageReceipt', { receipt })}
        />
      </View>
      <SplitDrawer
        visible={drawerVisible}
        onSplitEqual={() => {
          if (drawerItem) splitEqually(drawerItem);
          setDrawerVisible(false);
        }}
        onClaimPortion={pct => {
          if (drawerItem) claimPortion(drawerItem, pct);
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
  section: { marginTop: spacing.m, fontWeight: '600', fontSize: 32 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.s,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: { flex: 1, fontSize: 24 },
  actionRow: { flexDirection: 'row' },
  buttonRow: { flexDirection: 'row' },
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
  percent: { fontWeight: '600', marginLeft: spacing.s },
  footer: { padding: spacing.m },
});
