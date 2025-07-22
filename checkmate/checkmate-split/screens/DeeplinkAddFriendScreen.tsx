import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { functions } from '../firebaseConfig';

export type DeeplinkParams = {
  DeeplinkAddFriend: { uid: string };
};

export default function DeeplinkAddFriendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DeeplinkParams, 'DeeplinkAddFriend'>>();
  const { uid } = route.params;

  const sendRequest = async () => {
    try {
      const fn = httpsCallable(functions, 'sendFriendRequest');
      await fn({ to: uid });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Add Friend" onBack={navigation.goBack} />
      <View style={styles.content}>
        <Text style={styles.text}>{`Send friend request to ${uid}?`}</Text>
        <Button title="Send Request" onPress={sendRequest} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: spacing.l, textAlign: 'center' },
  button: { alignSelf: 'stretch' },
});
