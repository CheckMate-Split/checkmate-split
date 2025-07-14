import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ScanScreen from './screens/ScanScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import SettingsScreen from './screens/SettingsScreen';

export type RootStackParamList = {
  Scan: undefined;
  Confirm: { result: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function ScanStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan Receipt' }} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} options={{ title: 'Confirm Items' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="ScanTab" component={ScanStack} options={{ title: 'Scan' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

