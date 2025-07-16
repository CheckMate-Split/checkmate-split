import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ReceiptsScreen from './screens/ReceiptsScreen';
import AccountScreen from './screens/AccountScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TermsPrivacyScreen from './screens/TermsPrivacyScreen';
import SupportFaqScreen from './screens/SupportFaqScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import CreateReceiptScreen from './screens/CreateReceiptScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import ClaimItemsScreen from './screens/ClaimItemsScreen';
import ManageReceiptScreen from './screens/ManageReceiptScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './constants';
import { auth } from './firebaseConfig';
import { signInAnonymously } from 'firebase/auth';

export type RootStackParamList = {
  Tabs: undefined;
  Receipt: { id: string; receipt: any };
  ManageReceipt: { receipt: any };
};

export type HomeStackParamList = {
  Home: undefined;
  CreateReceipt: { data: any; image: string; manual?: boolean };
  Confirm: { result: any };
  ClaimItems: { receipt: any };
};


export type SettingsStackParamList = {
  Settings: undefined;
  Account: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  Terms: undefined;
  Support: undefined;
};

export type ReceiptsStackParamList = {
  Receipts: undefined;
};

export type HistoryStackParamList = {
  History: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();
const HistoryStackNav = createNativeStackNavigator<HistoryStackParamList>();
const ReceiptsStackNav = createNativeStackNavigator<ReceiptsStackParamList>();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL('/')],
};

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="CreateReceipt" component={CreateReceiptScreen} />
      <HomeStackNav.Screen name="Confirm" component={ConfirmScreen} />
      <HomeStackNav.Screen name="ClaimItems" component={ClaimItemsScreen} />
    </HomeStackNav.Navigator>
  );
}


function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="Settings" component={SettingsScreen} />
      <SettingsStackNav.Screen name="Account" component={AccountScreen} />
      <SettingsStackNav.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <SettingsStackNav.Screen name="Notifications" component={NotificationsScreen} />
      <SettingsStackNav.Screen name="Terms" component={TermsPrivacyScreen} />
      <SettingsStackNav.Screen name="Support" component={SupportFaqScreen} />
    </SettingsStackNav.Navigator>
  );
}

function ReceiptsStack() {
  return (
    <ReceiptsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ReceiptsStackNav.Screen name="Receipts" component={ReceiptsScreen} />
    </ReceiptsStackNav.Navigator>
  );
}

function HistoryStack() {
  return (
    <HistoryStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStackNav.Screen name="History" component={HistoryScreen} />
    </HistoryStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Receipts') icon = 'receipt';
          else if (route.name === 'History') icon = 'time';
          else if (route.name === 'Settings') icon = 'settings';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { borderTopWidth: 1, borderColor: '#ccc' },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen name="Receipts" component={ReceiptsStack} options={{ headerShown: false }} />
      <Tab.Screen name="History" component={HistoryStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
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
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={MainTabs} />
        <RootStack.Screen name="Receipt" component={ReceiptScreen} />
        <RootStack.Screen name="ManageReceipt" component={ManageReceiptScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

