import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Button from '../components/Button';
import { db, functions, auth } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export default function AddFriendSearchScreen() {
  const navigation = useNavigation<any>();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }
    const q = query(
      collection(db, 'users'),
      where('username', '>=', term),
      where('username', '<=', term + '\uf8ff')
    );
    const unsub = onSnapshot(q, snap => {
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [term]);

  const sendRequest = async (uid: string) => {
    try {
      const fn = httpsCallable(functions, 'sendFriendRequest');
      await fn({ to: uid });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.name}>{item.first} {item.last}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      {item.id !== auth.currentUser?.uid && (
        <Button title="Add" onPress={() => sendRequest(item.id)} style={styles.addButton} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Add Friend" onBack={navigation.goBack} />
      <TextInput
        placeholder="Username"
        value={term}
        onChangeText={setTerm}
        style={styles.input}
      />
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={results.length === 0 && styles.empty}
        ListEmptyComponent={<Text style={styles.emptyText}>no results</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: spacing.m, marginBottom: spacing.m },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.s },
  name: { fontSize: 18 },
  username: { color: '#666' },
  addButton: { marginLeft: spacing.m },
  empty: { flexGrow: 1, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#666' },
});
