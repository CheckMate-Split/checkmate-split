import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import DateInput from '../components/DateInput';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants';
import { db, storage } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

export type CreateParams = {
  CreateReceipt: {
    data?: any;
    image?: string;
    manual?: boolean;
    edit?: boolean;
    receipt?: any;
  };
};

export default function CreateReceiptScreen() {
  const route = useRoute<RouteProp<CreateParams, 'CreateReceipt'>>();
  const navigation = useNavigation<any>();
  const { data = {}, image = '', manual, edit, receipt } = route.params;
  const manualMode = edit || manual !== false;
  const [name, setName] = useState(receipt?.name || '');
  const [description, setDescription] = useState(receipt?.description || '');
  const [items, setItems] = useState<{ name: string; price: string; shared: boolean }[]>(
    receipt?.data?.lineItems?.map((i: any) => ({
      name: i.description,
      price: String(i.amount?.data ?? ''),
      shared: !!i.shared,
    })) ||
      (
        data?.lineItems ||
        data?.entities?.productLineItems ||
        data?.lineAmounts ||
        []
      ).map((i: any) => ({
        name: i.description || i.text?.data || i.data?.name?.data || '',
        price: String(
          i.amount?.data ?? i.data?.totalPrice?.data ?? i.data ?? ''
        ),
        shared: false,
      }))
  );
  const [date, setDate] = useState(
    receipt?.date
      ? new Date(receipt.date)
      : new Date(data?.date?.data || Date.now())
  );
  const valid = name && items.every(i => i.name && i.price);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const parsedItems = manualMode
        ? items.map(i => ({
            description: i.name,
            amount: { data: parseFloat(i.price) },
            shared: i.shared,
            responsible: user.uid,
          }))
        : (data?.lineItems || []).map((item: any) => ({
            description:
              item.description ||
              item.text?.data ||
              item.data?.name?.data ||
              '',
            amount: { data: item.amount?.data ?? item.data?.totalPrice?.data },
            responsible: user.uid,
            shared: false,
          }));
      let id = receipt?.id;
      let imageUrl = receipt?.imageUrl || '';
      const sanitizedData = {
        description,
        lineItems: parsedItems,
        totalAmount: data?.totalAmount?.data ?? null,
        taxAmount: data?.taxAmount?.data ?? null,
      };

      if (edit && id) {
        await updateDoc(doc(db, 'receipts', id), {
          name,
          description,
          date: date.toISOString(),
          data: sanitizedData,
        });
      } else {
        const docRef = await addDoc(collection(db, 'receipts'), {
          name,
          description,
          date: date.toISOString(),
          payer: user.uid,
          data: sanitizedData,
          createdAt: serverTimestamp(),
        });
        id = docRef.id;
        if (image) {
          const imgRef = ref(storage, `receipts/${id}.jpg`);
          const dataUrl = `data:image/jpeg;base64,${image}`;
          const blob = await (await fetch(dataUrl)).blob();
          await uploadBytes(imgRef, blob);
          imageUrl = await getDownloadURL(imgRef);
          await updateDoc(docRef, { imageUrl });
        }
      }
      const localReceipt = {
        id,
        name,
        description,
        data: sanitizedData,
        createdAt: receipt?.createdAt || new Date().toISOString(),
        imageUrl,
      };
      navigation.navigate('ClaimItems', { receipt: localReceipt });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!receipt?.id) return;
    Alert.alert('End Request', "Payments won't be reversed. Continue?", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'receipts', receipt.id));
            navigation.goBack();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const title = edit ? 'Edit Receipt' : 'Create Receipt';

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title={title} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {manualMode ? (
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
              onPress={() => setItems([...items, { name: '', price: '', shared: false }])}
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
        <View style={styles.footer}>
          <Button title="Save" onPress={handleSave} disabled={!valid} style={styles.saveButton} />
          {edit && (
            <OutlineButton
              title="End Request"
              onPress={handleDelete}
              style={[styles.saveButton, styles.endButton]}
              textColor={colors.pinkRed}
              borderColor={colors.pinkRed}
            />
          )}
        </View>
      </ScrollView>
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
    width: '100%',
  },
  // Inputs inside the line item row should not have extra top margin so that
  // they align vertically. The name input also uses slightly less width now
  // that the checkbox has been removed.
  // Give the name field slightly less width so the price field and remove
  // button can fit on one line without overflowing.
  itemName: {
    flex: 1,
    flexBasis: '60%',
    marginRight: spacing.s / 2,
    marginTop: 0,
  },
  itemPrice: { width: 80, marginRight: spacing.s / 2, marginTop: 0 },
  // Make the remove button square so the "X" is centered and fully visible.
  // By overriding the input padding we ensure the width and height match.
  removeButton: {
    // Match the height of the inputs by stretching vertically and use
    // aspectRatio to keep the button square. This avoids hard-coding the
    // height so it stays in sync if the input style changes.
    alignSelf: 'stretch',
    aspectRatio: 1,
    paddingVertical: 0,
    paddingHorizontal: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  footer: {
    padding: spacing.m,
    alignItems: 'center',
  },
  saveButton: { width: '90%', alignSelf: 'center' },
  endButton: {
    marginTop: spacing.m,
    alignSelf: 'center',
    width: '90%',
  },
  datePicker: { marginTop: spacing.m },
});

