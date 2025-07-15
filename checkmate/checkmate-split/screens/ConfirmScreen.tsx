import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

type ParamList = {
  Confirm: { result: any };
};

export default function ConfirmScreen() {
  const route = useRoute<RouteProp<ParamList, 'Confirm'>>();
  const navigation = useNavigation();
  const { result } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text>{JSON.stringify(result, null, 2)}</Text>
        <Button title="Done" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.m,
  },
});

