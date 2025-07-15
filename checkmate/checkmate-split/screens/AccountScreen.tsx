import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';
import Button from '../components/Button';

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [username, setUsername] = useState('');
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Account" onBack={navigation.goBack} />
      <View style={styles.form}>
        <TextInput
          placeholder="First Name"
          value={first}
          onChangeText={setFirst}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={last}
          onChangeText={setLast}
          style={styles.input}
        />
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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  saveButton: { width: '90%', alignSelf: 'center' },
});
