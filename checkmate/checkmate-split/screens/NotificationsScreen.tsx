import React, { useState } from 'react';
import { StyleSheet, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [friendReq, setFriendReq] = useState(true);
  const [paymentRecv, setPaymentRecv] = useState(true);
  const [claim, setClaim] = useState(false);
  const [requestPay, setRequestPay] = useState(true);
  const [friendAccept, setFriendAccept] = useState(true);
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Notifications" onBack={navigation.goBack} />
      <View style={styles.row}>
        <Text>Friend Requests</Text>
        <Switch value={friendReq} onValueChange={setFriendReq} />
      </View>
      <View style={styles.row}>
        <Text>Payment Received</Text>
        <Switch value={paymentRecv} onValueChange={setPaymentRecv} />
      </View>
      <View style={styles.row}>
        <Text>Claim Notifications</Text>
        <Switch value={claim} onValueChange={setClaim} />
      </View>
      <View style={styles.row}>
        <Text>Requested to Pay</Text>
        <Switch value={requestPay} onValueChange={setRequestPay} />
      </View>
      <View style={styles.row}>
        <Text>Friend Acceptances</Text>
        <Switch value={friendAccept} onValueChange={setFriendAccept} />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
