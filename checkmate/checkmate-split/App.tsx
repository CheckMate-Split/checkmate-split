import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import CreateReceiptScreen from './screens/CreateReceiptScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './constants';
import auth from '@react-native-firebase/auth';

export type RootStackParamList = {
  Tabs: undefined;
  Receipt: { id: string; receipt: any };
};

export type HomeStackParamList = {
  Home: undefined;
  CreateReceipt: { data: any; image: string };
  Confirm: { result: any };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL('/')],
};

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStackNav.Screen name="CreateReceipt" component={CreateReceiptScreen} options={{ title: 'Create Receipt' }} />
      <HomeStackNav.Screen name="Confirm" component={ConfirmScreen} options={{ title: 'Confirm Items' }} />
    </HomeStackNav.Navigator>
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
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (!auth().currentUser) {
      auth()
        .signInAnonymously()
        .catch(console.error);
    }
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
        <RootStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

