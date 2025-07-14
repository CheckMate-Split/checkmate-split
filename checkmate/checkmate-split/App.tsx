import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ScanScreen from './screens/ScanScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import CreateReceiptScreen from './screens/CreateReceiptScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './constants';

export type RootStackParamList = {
  Scan: undefined;
  CreateReceipt: { data: any; image: string };
  Receipt: { id: string; receipt: any };
  Confirm: { result: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function ScanStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateReceipt" component={CreateReceiptScreen} options={{ title: 'Create Receipt' }} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} options={{ title: 'Confirm Items' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon = route.name === 'ScanTab' ? 'scan' : 'settings';
            return <Ionicons name={icon as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
        })}
      >
        <Tab.Screen name="ScanTab" component={ScanStack} options={{ title: 'Scan' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

