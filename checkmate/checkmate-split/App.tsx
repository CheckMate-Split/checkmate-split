import React, { useEffect } from 'react';
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
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebaseConfig';

export type RootStackParamList = {
  Tabs: undefined;
  Receipt: { id: string; receipt: any };
};

export type ScanStackParamList = {
  Scan: undefined;
  CreateReceipt: { data: any; image: string };
  Confirm: { result: any };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const ScanStackNav = createNativeStackNavigator<ScanStackParamList>();
const Tab = createBottomTabNavigator();

function ScanStack() {
  return (
    <ScanStackNav.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <ScanStackNav.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
      <ScanStackNav.Screen name="CreateReceipt" component={CreateReceiptScreen} options={{ title: 'Create Receipt' }} />
      <ScanStackNav.Screen name="Confirm" component={ConfirmScreen} options={{ title: 'Confirm Items' }} />
    </ScanStackNav.Navigator>
  );
}

function MainTabs() {
  return (
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
  );
}

export default function App() {
  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(console.error);
    }
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
        <RootStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

