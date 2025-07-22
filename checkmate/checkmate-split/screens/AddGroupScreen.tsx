import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import { db, auth, functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export default function AddGroupScreen() {
  const navigation = useNavigation<any>();
  const [friends, setFriends] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'friends'),
      snap => setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  const create = async () => {
    try {
      const members = Object.keys(selected).filter(k => selected[k]);
      if (name) {
        const fn = httpsCallable(functions, 'createGroup');
        await fn({ name, members });
        navigation.goBack();
      }
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
      <PageHeader title="New Group" onBack={navigation.goBack} />
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        placeholder="Group Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Text style={styles.section}>Add Friends</Text>
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>no friends</Text>}
      />
      <Button title="Create" onPress={create} style={styles.button} disabled={!name} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: spacing.m, marginBottom: spacing.m },
  label: { fontWeight: '600', marginBottom: spacing.s },
  section: { fontSize: 18, fontWeight: '600', marginBottom: spacing.s },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.s },
  empty: { textAlign: 'center', marginTop: spacing.l },
  button: { marginTop: spacing.l },
});
