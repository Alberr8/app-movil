import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

import CameraScreen   from './src/screens/CameraScreen';
import ScoreScreen    from './src/screens/ScoreScreen';
import PremiumScreen  from './src/screens/PremiumScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import StatsScreen    from './src/screens/StatsScreen';
import AuthScreen     from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { RootStackParamList, TabParamList } from './src/types';
import { colors, palette, radius, shadow } from './src/constants/theme';
import { scheduleDailyReminder, requestNotificationPermission } from './src/services/notifications';
import { getLanguage, getNotificationsEnabled } from './src/services/storage';
import { supabase } from './src/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabName = keyof TabParamList;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<TabName, { active: IoniconName; inactive: IoniconName }> = {
  Wardrobe: { active: 'shirt',        inactive: 'shirt-outline'   },
  Profile:  { active: 'person',       inactive: 'person-outline'  },
  Camera:   { active: 'camera',       inactive: 'camera-outline'  },
  Premium:  { active: 'star',         inactive: 'star-outline'    },
  Stats:    { active: 'bar-chart',    inactive: 'bar-chart-outline'},
};

const TAB_LABELS: Record<string, Record<TabName, string>> = {
  es: { Camera: 'Cámara', Premium: 'Premium', Wardrobe: 'Armario', Profile: 'Perfil', Stats: 'Stats' },
  en: { Camera: 'Camera', Premium: 'Premium', Wardrobe: 'Wardrobe', Profile: 'Profile', Stats: 'Stats' },
};

// ─── Camera FAB button (center, elevated) ─────────────────────────────────────
const CAM_SIZE = 62;

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState('es');
  useEffect(() => { getLanguage().then(setLang); }, []);
  const labels = TAB_LABELS[lang] ?? TAB_LABELS['es'];

  // Layout: [Wardrobe, Stats] | [Camera FAB] | [Premium, Profile]
  const leftNames:   TabName[] = ['Wardrobe', 'Stats'];
  const rightNames:  TabName[] = ['Premium', 'Profile'];
  const cameraIndex = state.routes.findIndex(r => r.name === 'Camera');
  const isCameraFocused = state.index === cameraIndex;

  const paddingBottom = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 20 : 8);
  const barHeight = 54 + paddingBottom;

  function renderSideTab(name: TabName) {
    const route = state.routes.find(r => r.name === name);
    if (!route) return null;
    const focused = state.routes[state.index].name === name;
    const icons = TAB_ICONS[name];

    return (
      <TouchableOpacity
        key={name}
        style={tabStyles.tab}
        onPress={() => navigation.navigate(name)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={focused ? icons.active : icons.inactive}
          size={22}
          color={focused ? '#65c301' : 'rgba(0,0,0,0.35)'}
        />
        <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
          {labels[name]}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[tabStyles.container, { paddingBottom, height: barHeight + 20 }]}>
      {/* Left tabs */}
      <View style={tabStyles.side}>
        {leftNames.map(renderSideTab)}
      </View>

      {/* Camera FAB — elevated above the bar */}
      <View style={tabStyles.cameraSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Camera')}
          activeOpacity={0.85}
          style={tabStyles.cameraTouch}
        >
          <View style={[tabStyles.cameraRing, isCameraFocused && tabStyles.cameraRingFocused]}>
            <View style={[tabStyles.cameraCircle, isCameraFocused && tabStyles.cameraCircleFocused]}>
              <Ionicons
                name={isCameraFocused ? 'camera' : 'camera-outline'}
                size={26}
                color="#000"
              />
            </View>
          </View>
          <Text style={[tabStyles.label, isCameraFocused && tabStyles.labelActive, { marginTop: 2 }]}>
            {labels['Camera']}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right tabs */}
      <View style={tabStyles.side}>
        {rightNames.map(renderSideTab)}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.07)',
    // shadow on the bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'visible',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
    letterSpacing: 0.2,
  },
  labelActive: { color: '#65c301' },

  // Camera FAB
  cameraSection: {
    width: CAM_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  cameraTouch: {
    alignItems: 'center',
    marginBottom: 2,
  },
  cameraRing: {
    width: CAM_SIZE + 8,
    height: CAM_SIZE + 8,
    borderRadius: (CAM_SIZE + 8) / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    // lifts above the bar line
    marginBottom: -4,
    transform: [{ translateY: -18 }],
    ...shadow.md,
  },
  cameraRingFocused: {
    shadowColor: palette.lime[300],
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,
  },
  cameraCircle: {
    width: CAM_SIZE,
    height: CAM_SIZE,
    borderRadius: CAM_SIZE / 2,
    backgroundColor: 'rgba(181,253,89,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCircleFocused: {
    backgroundColor: palette.lime[300],
  },
});

// ─── Tab Navigator ─────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tab.Screen name="Stats"    component={StatsScreen}    />
      <Tab.Screen name="Camera"   component={CameraScreen}   />
      <Tab.Screen name="Premium"  component={PremiumScreen}  />
      <Tab.Screen name="Profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const [session, setSession]               = useState<Session | null | undefined>(undefined);
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

  if ((!fontsLoaded && !fontError) || session === undefined || onboardingDone === undefined) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
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
