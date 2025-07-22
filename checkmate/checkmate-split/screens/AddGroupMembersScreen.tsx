import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import { db, auth, functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

type Params = { AddGroupMembers: { id: string } };

export default function AddGroupMembersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'AddGroupMembers'>>();
  const { id } = route.params;
  const [friends, setFriends] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'friends'),
      snap => setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const sendInvites = async () => {
    try {
      const fn = httpsCallable(functions, 'sendGroupInvite');
      const list = Object.keys(selected).filter(k => selected[k]);
      await Promise.all(list.map(uid => fn({ groupId: id, to: uid })));
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text>{item.name || item.id}</Text>
      <Checkbox
        value={!!selected[item.id]}
        onValueChange={v => setSelected({ ...selected, [item.id]: v })}
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
      <Button title="Send Invites" onPress={sendInvites} style={styles.button} />
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
  empty: { textAlign: 'center', marginTop: spacing.l },
  button: { marginTop: spacing.l },
});
