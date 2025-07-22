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

const DEMO_FULL_SSN = '123456789';

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
  const [errors, setErrors] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postal: '',
    dob: '',
    ssn: '',
    phone: '',
    email: '',
  });

  const phoneDigits = phone.replace(/\D/g, '');
  const validate = () => {
    const newErrors: any = {};
    if (street.trim().length < 3) newErrors.street = 'Street must be at least 3 characters';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!/^[A-Za-z]{2}$/.test(state.trim())) newErrors.state = 'State must be 2 letters';
    if (!/^[A-Za-z]{2}$/.test(country.trim())) newErrors.country = 'Country code must be 2 letters';
    if (!/^\d{5}$/.test(postal)) newErrors.postal = 'Postal code must be 5 digits';
    if (dob.getTime() > Date.now()) newErrors.dob = 'DOB cannot be in the future';
    if (!/^\d{4}$|^\d{9}$/.test(ssn)) newErrors.ssn = 'Enter 4 or 9 digits';
    if (phoneDigits.length !== 10) newErrors.phone = 'Phone must be 10 digits';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) newErrors.email = 'Enter a valid email';
    setErrors({
      street: newErrors.street || '',
      city: newErrors.city || '',
      state: newErrors.state || '',
      country: newErrors.country || '',
      postal: newErrors.postal || '',
      dob: newErrors.dob || '',
      ssn: newErrors.ssn || '',
      phone: newErrors.phone || '',
      email: newErrors.email || '',
    });
    return Object.keys(newErrors).length === 0;
  };
  const basicValid =
    street.trim().length >= 3 &&
    city.trim().length > 0 &&
    /^[A-Za-z]{2}$/.test(state.trim()) &&
    /^[A-Za-z]{2}$/.test(country.trim()) &&
    /^\d{5}$/.test(postal) &&
    phoneDigits.length === 10 &&
    /^\d{4}$|^\d{9}$/.test(ssn) &&
    email.trim().length > 0 &&
    dob.getTime() <= Date.now();
  const formValid = basicValid && Object.values(errors).every((e) => !e);

  const submit = async () => {
    if (!validate()) return;
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
      ssnFull: DEMO_FULL_SSN,
      ssnLast4: DEMO_FULL_SSN.slice(-4),
      phone: { number: phone.replace(/\D/g, ''), countryCode: '1' },
      email,
    };
    console.log('submit KYC info', info);
    setShowTerms(false);
    const id = await refresh(info);
    if (id) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Verify Identity" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.form} scrollIndicatorInsets={{ right: -spacing.m }}>
        <Text style={styles.label}>Street</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={(t) => {
            setStreet(t);
            validate();
          }}
          onBlur={validate}
        />
        {errors.street ? <Text style={styles.error}>{errors.street}</Text> : null}
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={(t) => {
            setCity(t);
            validate();
          }}
          onBlur={validate}
        />
        {errors.city ? <Text style={styles.error}>{errors.city}</Text> : null}
        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={state}
          onChangeText={(t) => {
            setState(t);
            validate();
          }}
          onBlur={validate}
        />
        {errors.state ? <Text style={styles.error}>{errors.state}</Text> : null}
        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={(t) => {
            setCountry(t);
            validate();
          }}
          onBlur={validate}
        />
        {errors.country ? <Text style={styles.error}>{errors.country}</Text> : null}
        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          value={postal}
          onChangeText={(t) => {
            setPostal(t);
            validate();
          }}
          keyboardType="number-pad"
          onBlur={validate}
        />
        {errors.postal ? <Text style={styles.error}>{errors.postal}</Text> : null}
        <Text style={styles.label}>Date of Birth</Text>
        <DateInput value={dob} onChange={(d) => { setDob(d); validate(); }} />
        {errors.dob ? <Text style={styles.error}>{errors.dob}</Text> : null}
        <Text style={styles.label}>SSN (last 4)</Text>
        <TextInput
          style={styles.input}
          value={ssn}
          onChangeText={(t) => {
            setSsn(t);
            validate();
          }}
          keyboardType="number-pad"
          onBlur={validate}
        />
        {errors.ssn ? <Text style={styles.error}>{errors.ssn}</Text> : null}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            validate();
          }}
          keyboardType="phone-pad"
          onBlur={validate}
        />
        {errors.phone ? <Text style={styles.error}>{errors.phone}</Text> : null}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            validate();
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          onBlur={validate}
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
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
  error: { color: 'red', marginTop: -spacing.s / 2, marginBottom: spacing.m },
  footer: { paddingVertical: spacing.s, alignItems: 'center' },
});
