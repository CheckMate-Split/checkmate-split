import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import FriendsScreen from './screens/FriendsScreen';
import AddFriendSearchScreen from './screens/AddFriendSearchScreen';
import AddFriendQRScreen from './screens/AddFriendQRScreen';
import AddGroupScreen from './screens/AddGroupScreen';
import FriendDetailScreen from './screens/FriendDetailScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';
import DeeplinkAddFriendScreen from './screens/DeeplinkAddFriendScreen';
import ReceiptsScreen from './screens/ReceiptsScreen';
import AccountScreen from './screens/AccountScreen';
import LoginScreen from './screens/LoginScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TermsPrivacyScreen from './screens/TermsPrivacyScreen';
import SupportFaqScreen from './screens/SupportFaqScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import CreateReceiptScreen from './screens/CreateReceiptScreen';
import ScanScreen from './screens/ScanScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import ClaimItemsScreen from './screens/ClaimItemsScreen';
import ManageReceiptScreen from './screens/ManageReceiptScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './constants';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export type RootStackParamList = {
  Login: undefined;
  AccountSetup: undefined;
  Tabs: undefined;
  Receipt: { id: string; receipt: any };
  ManageReceipt: { receipt: any };
};

export type HomeStackParamList = {
  Home: undefined;
  Scan: undefined;
  CreateReceipt: {
    data?: any;
    image?: string;
    manual?: boolean;
    edit?: boolean;
    receipt?: any;
  };
  Confirm: { result: any };
  ClaimItems: { receipt: any };
};


export type SettingsStackParamList = {
  SettingsHome: undefined;
  Account: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  Terms: undefined;
  Support: undefined;
};

export type ReceiptsStackParamList = {
  ReceiptsHome: undefined;
};

export type FriendsStackParamList = {
  FriendsHome: undefined;
  AddFriendSearch: undefined;
  AddFriendQR: undefined;
  AddGroup: undefined;
  FriendDetail: { uid: string; name: string };
  GroupDetail: { id: string };
  DeeplinkAddFriend: { uid: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();
const FriendsStackNav = createNativeStackNavigator<FriendsStackParamList>();
const ReceiptsStackNav = createNativeStackNavigator<ReceiptsStackParamList>();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Friends: {
        screens: {
          DeeplinkAddFriend: 'add-friend',
        },
      },
    },
  },
};

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="Scan" component={ScanScreen} />
      <HomeStackNav.Screen name="CreateReceipt" component={CreateReceiptScreen} />
      <HomeStackNav.Screen name="Confirm" component={ConfirmScreen} />
      <HomeStackNav.Screen name="ClaimItems" component={ClaimItemsScreen} />
    </HomeStackNav.Navigator>
  );
}


function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="SettingsHome" component={SettingsScreen} />
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
      <ReceiptsStackNav.Screen name="ReceiptsHome" component={ReceiptsScreen} />
    </ReceiptsStackNav.Navigator>
  );
}

function FriendsStack() {
  return (
    <FriendsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FriendsStackNav.Screen name="FriendsHome" component={FriendsScreen} />
      <FriendsStackNav.Screen name="AddFriendSearch" component={AddFriendSearchScreen} />
      <FriendsStackNav.Screen name="AddFriendQR" component={AddFriendQRScreen} />
      <FriendsStackNav.Screen name="AddGroup" component={AddGroupScreen} />
      <FriendsStackNav.Screen name="FriendDetail" component={FriendDetailScreen} />
      <FriendsStackNav.Screen name="GroupDetail" component={GroupDetailScreen} />
      <FriendsStackNav.Screen name="DeeplinkAddFriend" component={DeeplinkAddFriendScreen} />
    </FriendsStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Receipts') icon = 'receipt';
          else if (route.name === 'Friends') icon = 'people';
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
      <Tab.Screen name="Friends" component={FriendsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useNavigationContainerRef();
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      const valid = u && !u.isAnonymous ? u : null;
      setUser(valid);
      if (unsubProfile) unsubProfile();
      if (valid) {
        unsubProfile = onSnapshot(doc(db, 'users', valid.uid), (snap) => {
          setProfile(snap.exists() ? snap.data() : null);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  useEffect(() => {
    if (loading || !navReady) return;
    if (!user) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else if (!profile || !profile.first || !profile.last || !profile.username || !profile.email) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'AccountSetup', params: { initial: true } }],
      });
    } else {
      navigationRef.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    }
  }, [user, profile, loading, navReady, navigationRef]);

  if (loading) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => setNavReady(true)}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="AccountSetup" component={AccountScreen} />
        <RootStack.Screen name="Tabs" component={MainTabs} />
        <RootStack.Screen name="Receipt" component={ReceiptScreen} />
        <RootStack.Screen name="ManageReceipt" component={ManageReceiptScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

