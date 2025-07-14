import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScanScreen from './screens/ScanScreen';
import ConfirmScreen from './screens/ConfirmScreen';

export type RootStackParamList = {
  Scan: undefined;
  Confirm: { result: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan Receipt' }} />
        <Stack.Screen name="Confirm" component={ConfirmScreen} options={{ title: 'Confirm Items' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

