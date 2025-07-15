import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';
import { db, storage } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

export type CreateParams = {
  CreateReceipt: { data: any; image: string; manual?: boolean };
};

export default function CreateReceiptScreen() {
  const route = useRoute<RouteProp<CreateParams, 'CreateReceipt'>>();
  const navigation = useNavigation<any>();
  const { data, image, manual } = route.params;
  const [name, setName] = useState('');
  const [items, setItems] = useState<{ name: string; price: string; shared: boolean }[]>([]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const parsedItems = manual
        ? items.map(i => ({
            description: i.name,
            amount: { data: parseFloat(i.price) },
            shared: i.shared,
            responsible: user.uid,
          }))
        : (data?.lineItems || []).map((item: any) => ({
            ...item,
            responsible: user.uid,
          }));
      const docRef = await addDoc(collection(db, 'receipts'), {
        name,
        payer: user.uid,
        data: { ...data, lineItems: parsedItems },
        createdAt: serverTimestamp(),
      });
      if (image) {
        await uploadString(
          ref(storage, `receipts/${docRef.id}.jpg`),
          image,
          'base64'
        );
      }
      navigation.navigate('Receipt', { id: docRef.id, receipt: { id: docRef.id, name, data } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Create Receipt" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {manual ? (
          <>
            <Text style={styles.label}>Receipt Name</Text>
            <TextInput
              placeholder="Receipt Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Text style={[styles.label, { marginTop: spacing.l }]}>Line Items</Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <TextInput
                  placeholder="Name"
                  value={item.name}
                  onChangeText={t => {
                    const copy = [...items];
                    copy[idx].name = t;
                    setItems(copy);
                  }}
                  style={[styles.input, styles.itemName]}
                />
                <TextInput
                  placeholder="Price"
                  value={item.price}
                  onChangeText={t => {
                    const copy = [...items];
                    copy[idx].price = t;
                    setItems(copy);
                  }}
                  keyboardType="numeric"
                  style={[styles.input, styles.itemPrice]}
                />
                <Switch
                  value={item.shared}
                  onValueChange={v => {
                    const copy = [...items];
                    copy[idx].shared = v;
                    setItems(copy);
                  }}
                />
              </View>
            ))}
            <OutlineButton
              title="Add Item"
              onPress={() => setItems([...items, { name: '', price: '', shared: true }])}
              style={{ marginTop: spacing.m }}
            />
          </>
        ) : (
          <>
            {(data?.lineItems || []).map((item: any, idx: number) => (
              <Text key={idx}>{item.description} - {item.amount?.data}</Text>
            ))}
            <Text style={styles.label}>Receipt Name</Text>
            <TextInput
              placeholder="Receipt Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Save" onPress={handleSave} disabled={!name} style={styles.saveButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  label: { marginTop: spacing.m, fontWeight: '500' },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.m,
    marginTop: spacing.m,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  itemName: { flex: 1, marginRight: spacing.s / 2 },
  itemPrice: { width: 80, marginRight: spacing.s / 2 },
  footer: {
    padding: spacing.m,
    alignItems: 'center',
  },
  saveButton: { width: '90%', alignSelf: 'center' },
});

