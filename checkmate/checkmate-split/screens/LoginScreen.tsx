import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, Platform, Image, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [step, setStep] = useState<'start' | 'password' | 'signin'>('start');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const emailValid = /\S+@\S+\.\S+/.test(email.trim());
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'GOOGLE_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params as any;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch(console.error);
    }
  }, [response]);

  const handleEmailContinue = () => {
    setStep('password');
  };

  const handleCreate = async () => {
    if (password !== confirm || password.length === 0) {
      Alert.alert('Error', 'Passwords must match.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleApple = async () => {
    try {
      const res = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: res.identityToken ?? '' });
      await signInWithCredential(auth, credential);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Image source={require('../assets/logo-full.jpeg')} style={styles.logo} resizeMode="contain" />
        {step === 'start' && (
          <>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.desc}>Use Checkmate to split the bill and pay your part.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Button
              title="Continue with Email"
              onPress={handleEmailContinue}
              disabled={!emailValid}
              style={styles.button}
            />
            {Platform.OS === 'ios' && (
              <OutlineButton
                title="Continue with Apple"
                icon="logo-apple"
                onPress={handleApple}
                style={styles.button}
              />
            )}
            <OutlineButton
              title="Continue with Google"
              icon="logo-google"
              onPress={() => promptAsync()}
              style={styles.button}
            />
            <TouchableOpacity onPress={() => setStep('signin')}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 'password' && (
          <>
            <Text style={styles.welcome}>Create Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm Password"
              secureTextEntry
              style={styles.input}
            />
            <Button
              title="Create Account"
              onPress={handleCreate}
              disabled={!password || password !== confirm}
              style={styles.button}
            />
            <TouchableOpacity onPress={() => setStep('start')}>
              <Text style={styles.link}>Back</Text>
            </TouchableOpacity>
          </>
        )}
        {step === 'signin' && (
          <>
            <Text style={styles.welcome}>Login</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
            />
            <Button
              title="Sign In"
              onPress={handleSignIn}
              disabled={!emailValid || !password}
              style={styles.button}
            />
            <TouchableOpacity onPress={() => setStep('start')}>
              <Text style={styles.link}>Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.l,
    alignItems: 'stretch',
  },
  logo: {
    width: '100%',
    height: 80,
    marginBottom: spacing.l,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  desc: {
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.l,
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
  button: {
    marginTop: spacing.s,
  },
  link: {
    marginTop: spacing.m,
    color: colors.primary,
    textAlign: 'center',
  },
});
