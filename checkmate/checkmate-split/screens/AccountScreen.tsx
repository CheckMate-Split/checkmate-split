import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';
import Button from '../components/Button';
import Text from '../components/Text';
import { auth, db, storage } from '../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initial = route.params?.initial;
  const user = auth.currentUser;
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [venmo, setVenmo] = useState('');
  const [cashapp, setCashapp] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setFirst(d.first || '');
        setLast(d.last || '');
        setUsername(d.username || '');
        setEmail(d.email || user.email || '');
        setVenmo(d.venmo || '');
        setCashapp(d.cashapp || '');
        setPhoto(d.photo || null);
      }
    };
    load();
  }, [user]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const pick = await ImagePicker.launchImageLibraryAsync();
    if (pick.canceled) return;
    setPhoto(pick.assets[0].uri);
  };

  const usernameAvailable = async (name: string) => {
    const q = query(collection(db, 'users'), where('username', '==', name));
    const snap = await getDocs(q);
    return snap.empty || (snap.docs.length === 1 && snap.docs[0].id === user?.uid);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!emailValid) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    const uname = username.trim();
    if (!uname) {
      Alert.alert('Invalid Username', 'Please choose a username.');
      return;
    }
    if (!(await usernameAvailable(uname))) {
      alert('Username already taken');
      return;
    }
    let photoURL = photo || null;
    if (photo && !photo.startsWith('https://')) {
      const blob = await fetch(photo).then((r) => r.blob());
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, blob);
      photoURL = await getDownloadURL(storageRef);
    }
    if (photoURL !== photo) {
      setPhoto(photoURL);
    }
    if (photoURL && user.photoURL !== photoURL) {
      await updateProfile(user, { photoURL });
    }
    await setDoc(
      doc(db, 'users', user.uid),
      {
        first,
        last,
        username: uname,
        email,
        venmo,
        cashapp,
        photo: photoURL,
      },
      { merge: true }
    );
    if (initial) {
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Account" onBack={initial ? undefined : navigation.goBack} />
      <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrapper}>
        <Image
          source={photo ? { uri: photo } : require('../assets/icon.png')}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          placeholder="First Name"
          value={first}
          onChangeText={setFirst}
          style={styles.input}
        />
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          placeholder="Last Name"
          value={last}
          onChangeText={setLast}
          style={styles.input}
        />
        <Text style={styles.label}>Username</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!initial}
          style={styles.input}
        />
        <Text style={styles.label}>Venmo Username (optional)</Text>
        <TextInput
          placeholder="Venmo"
          value={venmo}
          onChangeText={setVenmo}
          style={styles.input}
        />
        <Text style={styles.label}>Cash App Username (optional)</Text>
        <TextInput
          placeholder="Cash App"
          value={cashapp}
          onChangeText={setCashapp}
          style={styles.input}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Save"
          onPress={handleSave}
          disabled={!first || !last || !username || !emailValid}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  form: {
    paddingBottom: spacing.l,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: spacing.l,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  label: {
    marginBottom: spacing.s / 2,
    fontWeight: '500',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  footer: {
    padding: spacing.m,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  saveButton: { width: '90%', alignSelf: 'center' },
});
