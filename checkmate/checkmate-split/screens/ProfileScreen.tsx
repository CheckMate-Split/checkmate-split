import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import MenuItem from '../components/MenuItem';
import Button from '../components/Button';
import { colors, spacing } from '../constants';
import { firestore, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [venmoHandle, setVenmoHandle] = useState('');
  const [cashAppHandle, setCashAppHandle] = useState('');

  useEffect(() => {
    fetchHandles();
  }, []);

  const fetchHandles = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setVenmoHandle(data.venmoHandle || '');
          setCashAppHandle(data.cashAppHandle || '');
        }
      }
    } catch (e) {
      console.error('Error fetching handles:', e);
    }
  };

  const saveHandles = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(
          doc(firestore, 'users', user.uid),
          {
            venmoHandle: venmoHandle.trim(),
            cashAppHandle: cashAppHandle.trim(),
          },
          { merge: true }
        );
        Alert.alert('Success', 'Handles updated!');
      }
    } catch (e) {
      console.error('Error saving handles:', e);
      Alert.alert('Error', 'Failed to save handles.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.avatar} />
      <PageHeader title="Profile" />
      <MenuItem
        title="Account"
        icon="person"
        onPress={() => navigation.navigate('Account')}
      />
      <MenuItem
        title="Payment Methods"
        icon="card"
        onPress={() => navigation.navigate('PaymentMethods')}
      />
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Venmo Handle"
          value={venmoHandle}
          onChangeText={setVenmoHandle}
        />
        <TextInput
          style={styles.input}
          placeholder="Cash App Handle"
          value={cashAppHandle}
          onChangeText={setCashAppHandle}
        />
        <Button title="Save Payment Handles" onPress={saveHandles} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ccc',
    alignSelf: 'center',
    marginTop: spacing.l,
  },
  form: {
    marginTop: spacing.l,
    paddingHorizontal: spacing.m,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: spacing.m,
  },
});
