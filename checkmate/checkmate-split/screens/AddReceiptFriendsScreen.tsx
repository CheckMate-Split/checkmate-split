import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Checkbox from '../components/Checkbox';
import PersonCard from '../components/PersonCard';
import Button from '../components/Button';
import { db, auth, functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

type Params = { AddReceiptFriends: { id: string } };

export default function AddReceiptFriendsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'AddReceiptFriends'>>();
  const { id } = route.params;
  const [friends, setFriends] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'friends'),
      snap => setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const addFriends = async () => {
    try {
      const fn = httpsCallable(functions, 'addReceiptFriends');
      const list = Object.keys(selected).filter(k => selected[k]);
      await fn({ receiptId: id, members: list });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <PersonCard user={item} />
      <Checkbox
        value={!!selected[item.id]}
        onValueChange={v => setSelected({ ...selected, [item.id]: v })}
        style={styles.check}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Add Friends" onBack={navigation.goBack} />
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>no friends</Text>}
      />
      <Button title="Add to Receipt" onPress={addFriends} style={styles.button} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  check: { marginLeft: spacing.m },
  empty: { textAlign: 'center', marginTop: spacing.l },
  button: { marginTop: spacing.l },
});
