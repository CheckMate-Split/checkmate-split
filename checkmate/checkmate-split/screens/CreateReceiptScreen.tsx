import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import Button from '../components/Button';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { auth, db, storage } from '../firebaseConfig';

export type CreateParams = {
  CreateReceipt: { data: any; image: string };
};

export default function CreateReceiptScreen() {
  const route = useRoute<RouteProp<CreateParams, 'CreateReceipt'>>();
  const navigation = useNavigation();
  const { data, image } = route.params;
  const [name, setName] = useState('');

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = await addDoc(collection(db, 'receipts'), {
        name,
        payer: auth.currentUser.uid,
        data,
        createdAt: serverTimestamp(),
      });
      await uploadString(ref(storage, `receipts/${docRef.id}.jpg`), image, 'base64');
      navigation.navigate('Receipt', { id: docRef.id, receipt: { id: docRef.id, name, data } });
    } catch (e) {
      console.error(e);
    }
  };

  const lineItems = data?.lineItems || [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {lineItems.length > 0 ? (
          lineItems.map((item: any, idx: number) => (
            <Text key={idx}>{item.description} - {item.amount?.data}</Text>
          ))
        ) : (
          <Text>{JSON.stringify(data, null, 2)}</Text>
        )}
        <TextInput
          placeholder="Receipt Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Save" onPress={handleSave} disabled={!name} style={styles.saveButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.m,
    marginTop: spacing.m,
  },
  footer: {
    padding: spacing.m,
    alignItems: 'center',
  },
  saveButton: { width: '80%' },
});

