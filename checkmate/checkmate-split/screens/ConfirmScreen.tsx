import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text>{JSON.stringify(result, null, 2)}</Text>
      <Button title="Done" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
});

