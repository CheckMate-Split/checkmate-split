import React, { useState } from 'react';
import { StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import TermsDrawer from '../components/TermsDrawer';
import DateInput from '../components/DateInput';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { useConnectLink } from '../connectLink';

export default function KYCFormScreen() {
  const navigation = useNavigation<any>();
  const { refresh } = useConnectLink();
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('US');
  const [postal, setPostal] = useState('');
  const [dob, setDob] = useState(new Date());
  const [ssn, setSsn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const formValid =
    street.trim().length >= 3 &&
    city.trim().length > 0 &&
    /^[A-Za-z]{2}$/.test(state.trim()) &&
    /^\d{5}$/.test(postal) &&
    phoneDigits.length === 10 &&
    /^\d{4}$/.test(ssn) &&
    email.trim().length > 0 &&
    dob.getTime() <= Date.now();

  const submit = async () => {
    const info = {
      address: {
        addressLine1: street,
        city,
        stateOrProvince: state,
        postalCode: postal,
        country,
      },
      dob: {
        day: dob.getDate(),
        month: dob.getMonth() + 1,
        year: dob.getFullYear(),
      },
      ssn,
      phone: { number: phone.replace(/\D/g, ''), countryCode: '1' },
      email,
    };
    setShowTerms(false);
    const id = await refresh(info);
    if (id) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Verify Identity" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.form} scrollIndicatorInsets={{ right: -spacing.m }}>
        <Text style={styles.label}>Street</Text>
        <TextInput style={styles.input} value={street} onChangeText={setStreet} />
        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />
        <Text style={styles.label}>State</Text>
        <TextInput style={styles.input} value={state} onChangeText={setState} />
        <Text style={styles.label}>Country</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />
        <Text style={styles.label}>Postal Code</Text>
        <TextInput style={styles.input} value={postal} onChangeText={setPostal} keyboardType="number-pad" />
        <Text style={styles.label}>Date of Birth</Text>
        <DateInput value={dob} onChange={setDob} />
        <Text style={styles.label}>SSN (last 4)</Text>
        <TextInput style={styles.input} value={ssn} onChangeText={setSsn} keyboardType="number-pad" />
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Create Wallet" onPress={() => setShowTerms(true)} disabled={!formValid} />
      </View>
      <TermsDrawer visible={showTerms} onAccept={submit} onClose={() => setShowTerms(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  form: { paddingBottom: spacing.xl },
  label: { fontWeight: '600', marginBottom: spacing.s / 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: spacing.m, marginBottom: spacing.m },
  footer: { paddingVertical: spacing.s, alignItems: 'center' },
});
