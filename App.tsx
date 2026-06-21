import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import type { Session } from '@supabase/supabase-js';

import CameraScreen from './src/screens/CameraScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { RootStackParamList, TabParamList } from './src/types';
import { colors } from './src/constants/theme';
import { scheduleDailyReminder, requestNotificationPermission } from './src/services/notifications';
import { getLanguage, getNotificationsEnabled } from './src/services/storage';
import { supabase } from './src/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, { active: TabIconName; inactive: TabIconName }> = {
  Camera:   { active: 'camera',        inactive: 'camera-outline' },
  Premium:  { active: 'star',          inactive: 'star-outline' },
  Wardrobe: { active: 'shirt',         inactive: 'shirt-outline' },
  Profile:  { active: 'person',        inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, Record<keyof TabParamList, string>> = {
  es: { Camera: 'Inicio', Premium: 'Premium', Wardrobe: 'Armario', Profile: 'Perfil' },
  en: { Camera: 'Home',   Premium: 'Premium', Wardrobe: 'Wardrobe', Profile: 'Profile' },
};

function TabNavigator() {
  const [lang, setLang] = React.useState('es');
  useEffect(() => { getLanguage().then(setLang); }, []);
  const labels = TAB_LABELS[lang] ?? TAB_LABELS['es'];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name as keyof TabParamList];
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: 'rgba(0,0,0,0.07)',
            borderTopWidth: 0.5,
            height: Platform.OS === 'ios' ? 84 : 62,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 10,
            letterSpacing: 0.2,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />
          ),
          tabBarLabel: labels[route.name as keyof TabParamList] ?? route.name,
        };
      }}
    >
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [onboardingDone, setOnboardingDone] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    AsyncStorage.getItem('@sportstyle/onboardingDone').then(v => setOnboardingDone(v === 'true'));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!session) return;
    async function init() {
      if (Platform.OS === 'web') return;
      const enabled = await getNotificationsEnabled();
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
          const lang = await getLanguage();
          await scheduleDailyReminder(lang);
        }
      }
    }
    init();
  }, [session]);

  // Wait for fonts, auth session and onboarding flag
  if ((!fontsLoaded && !fontError) || session === undefined || onboardingDone === undefined) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : !onboardingDone ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="Score"
                component={ScoreScreen}
                options={{ presentation: 'card', animation: 'slide_from_bottom' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
