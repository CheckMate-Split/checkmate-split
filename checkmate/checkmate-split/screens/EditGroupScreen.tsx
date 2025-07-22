import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import { db, functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

type Params = { EditGroup: { id: string } };

export default function EditGroupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'EditGroup'>>();
  const { id } = route.params;
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'groups', id));
      if (snap.exists()) {
        const g = snap.data();
        setName(g.name || '');
        setDesc(g.description || '');
      }
    };
    load();
  }, [id]);

  const save = async () => {
    try {
      const fn = httpsCallable(functions, 'updateGroup');
      await fn({ id, name, description: desc });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async () => {
    try {
      const fn = httpsCallable(functions, 'deleteGroup');
      await fn({ id });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Edit Group" onBack={navigation.goBack} />
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        placeholder="Group Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        style={styles.input}
      />
      <Button title="Save" onPress={save} style={styles.button} disabled={!name} />
      <OutlineButton
        title="Delete Group"
        onPress={remove}
        style={styles.deleteButton}
        textColor={colors.pinkRed}
        borderColor={colors.pinkRed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: spacing.m, marginBottom: spacing.m },
  label: { fontWeight: '600', marginBottom: spacing.s },
  button: { marginTop: spacing.l },
  deleteButton: { marginTop: spacing.m },
});
