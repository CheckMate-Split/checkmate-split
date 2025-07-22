import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';
import Button from '../components/Button';
import Text from '../components/Text';
import { auth, db, storage, functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
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


  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    if (!emailValid) {
      setError('Please enter a valid email.');
      setSaving(false);
      return;
    }
    const uname = username.trim();
    if (!uname) {
      setError('Username is required.');
      setSaving(false);
      return;
    }
    try {
      const fn = httpsCallable(functions, 'checkUsername');
      const res: any = await fn({ username: uname });
      if (!res.data?.available) {
        setError('Username already taken');
        setSaving(false);
        return;
      }

      let photoURL = photo || null;
      if (photo && !photo.startsWith('https://')) {
        try {
          const response = await fetch(photo);
          const blob = await response.blob();
          const storageRef = ref(storage, `avatars/${user.uid}`);
          await uploadBytes(storageRef, blob);
          photoURL = await getDownloadURL(storageRef);
        } catch (err) {
          console.error('upload failed', err);
          setError('Failed to upload image');
          setSaving(false);
          return;
        }
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
    } catch (e) {
      console.error(e);
      setError('Failed to save changes');
    }
    setSaving(false);
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
      <ScrollView
        contentContainerStyle={styles.form}
        scrollIndicatorInsets={{ right: -spacing.m }}
      >
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
          autoCapitalize="none"
          autoCorrect={false}
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Save"
          onPress={handleSave}
          disabled={!first || !last || !username || !emailValid || saving}
          loading={saving}
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
    paddingBottom: spacing.xl,
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
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.background,
    alignItems: 'center',
    marginTop: 'auto',
  },
  error: {
    color: 'red',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  saveButton: { width: '90%', alignSelf: 'center' },
});
