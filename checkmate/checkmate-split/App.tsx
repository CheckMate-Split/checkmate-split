import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import AccountScreen from './screens/AccountScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TermsPrivacyScreen from './screens/TermsPrivacyScreen';
import SupportFaqScreen from './screens/SupportFaqScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import CreateReceiptScreen from './screens/CreateReceiptScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './constants';
import { auth } from './firebaseConfig';
import { signInAnonymously } from 'firebase/auth';

export type RootStackParamList = {
  Tabs: undefined;
  Receipt: { id: string; receipt: any };
};

export type HomeStackParamList = {
  Home: undefined;
  CreateReceipt: { data: any; image: string; manual?: boolean };
  Confirm: { result: any };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Account: undefined;
  PaymentMethods: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Notifications: undefined;
  Terms: undefined;
  Support: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();
const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();
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
    </HomeStackNav.Navigator>
  );
}

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} />
      <ProfileStackNav.Screen name="Account" component={AccountScreen} />
      <ProfileStackNav.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    </ProfileStackNav.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="Settings" component={SettingsScreen} />
      <SettingsStackNav.Screen name="Notifications" component={NotificationsScreen} />
      <SettingsStackNav.Screen name="Terms" component={TermsPrivacyScreen} />
      <SettingsStackNav.Screen name="Support" component={SupportFaqScreen} />
    </SettingsStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'History') icon = 'time';
          else if (route.name === 'Profile') icon = 'person';
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
      <Tab.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
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
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

