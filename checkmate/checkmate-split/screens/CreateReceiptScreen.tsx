import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import Checkbox from '../components/Checkbox';
import DateInput from '../components/DateInput';
import { Ionicons } from '@expo/vector-icons';
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
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<{ name: string; price: string; shared: boolean }[]>([]);
  const [date, setDate] = useState(new Date());
  const valid = name && items.every(i => i.name && i.price);

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
        description,
        date: date.toISOString(),
        payer: user.uid,
        data: { ...data, description, lineItems: parsedItems },
        createdAt: serverTimestamp(),
      });
      if (image) {
        await uploadString(
          ref(storage, `receipts/${docRef.id}.jpg`),
          image,
          'base64'
        );
      }
      navigation.navigate('Receipt', {
        id: docRef.id,
        receipt: { id: docRef.id, name, description, data: { ...data, description, lineItems: parsedItems } },
      });
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
            <Text style={styles.sectionHeader}>Receipt Info</Text>
            <Text style={styles.label}>Receipt Name</Text>
            <TextInput
              placeholder="Receipt Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Text style={styles.label}>Receipt Description</Text>
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
            <Text style={styles.label}>Date</Text>
            <DateInput value={date} onChange={setDate} style={styles.datePicker} />
            <Text style={[styles.sectionHeader, { marginTop: spacing.l }]}>Line Items</Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemContainer}>
                <Text style={styles.label}>{`Item ${idx + 1}`}</Text>
                <View style={styles.itemRow}>
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
                    placeholder="0.00"
                    value={item.price}
                    onChangeText={t => {
                      const copy = [...items];
                      copy[idx].price = t;
                      setItems(copy);
                    }}
                    keyboardType="numeric"
                    style={[styles.input, styles.itemPrice]}
                  />
                  <Checkbox
                    value={item.shared}
                    onValueChange={v => {
                      const copy = [...items];
                      copy[idx].shared = v;
                      setItems(copy);
                    }}
                    style={styles.checkboxBox}
                  />
                  <TouchableOpacity
                    onPress={() => setItems(items.filter((_, i) => i !== idx))}
                    style={[styles.input, styles.removeButton]}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
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
        <Button title="Save" onPress={handleSave} disabled={!valid} style={styles.saveButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  label: { marginTop: spacing.m, fontWeight: '500' },
  sectionHeader: {
    marginTop: spacing.l,
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.m,
    marginTop: spacing.m,
  },
  itemContainer: { marginTop: spacing.m },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  itemName: { flex: 1, marginRight: spacing.s / 2 },
  itemPrice: { width: 80, marginRight: spacing.s / 2 },
  checkboxBox: { marginRight: spacing.s / 2, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  removeButton: { width: 40, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  footer: {
    padding: spacing.m,
    alignItems: 'center',
  },
  saveButton: { width: '90%', alignSelf: 'center' },
  datePicker: { marginTop: spacing.m },
});

