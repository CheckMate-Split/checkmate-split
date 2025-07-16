import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import MenuItem from '../components/MenuItem';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { functions } from '../firebaseConfig';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const [balance] = useState<number>(0);
  const [methods, setMethods] = useState([
    { id: '1', brand: 'Visa', last4: '4242' },
    { id: '2', brand: 'Mastercard', last4: '4444' },
  ]);

  const handleAddMethod = () => {
    // Placeholder for adding a payment method
  };

  const handleConnectAch = async () => {
    try {
      const createLink = httpsCallable(functions, 'createStripeConnectLink');
      const res: any = await createLink({});
      if (res?.data?.url) {
        Linking.openURL(res.data.url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderMethod = ({ item }: { item: typeof methods[0] }) => (
    <MenuItem
      title={`${item.brand} **** ${item.last4}`}
      icon="card"
      onPress={() => {}}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      <PageHeader title="Payments & Balance" onBack={navigation.goBack} />
      <FlatList
        data={methods}
        keyExtractor={(item) => item.id}
        renderItem={renderMethod}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Add Payment Method" onPress={handleAddMethod} />
            <OutlineButton
              title="Connect ACH"
              onPress={handleConnectAch}
              style={styles.button}
            />
          </View>
        }
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
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.l,
  },
  footer: {
    marginTop: spacing.l,
  },
  button: {
    marginTop: spacing.m,
  },
});
