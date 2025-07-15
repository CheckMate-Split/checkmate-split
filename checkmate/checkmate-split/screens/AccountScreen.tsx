import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';
import Button from '../components/Button';
import Text from '../components/Text';

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [username, setUsername] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const pick = await ImagePicker.launchImageLibraryAsync();
    if (pick.canceled) return;
    setPhoto(pick.assets[0].uri);
  };
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Account" onBack={navigation.goBack} />
      <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrapper}>
        <Image
          source={photo ? { uri: photo } : require('../assets/icon.png')}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <View style={styles.form}>
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
      </View>
      <Button
        title="Save"
        onPress={() => navigation.goBack()}
        disabled={!first || !last || !username}
        style={styles.saveButton}
      />
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
    flex: 1,
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
  saveButton: { width: '90%', alignSelf: 'center' },
});
