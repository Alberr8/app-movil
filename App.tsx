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
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
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
import { colors, shadow } from './src/constants/theme';
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
  Wardrobe: { active: 'grid',       inactive: 'grid-outline'      },
  Stats:    { active: 'bar-chart',  inactive: 'bar-chart-outline' },
  Camera:   { active: 'camera',     inactive: 'camera-outline'    },
  Premium:  { active: 'bag',        inactive: 'bag-outline'       },
  Profile:  { active: 'person',     inactive: 'person-outline'    },
};

const TAB_LABELS: Record<string, Record<TabName, string>> = {
  es: { Camera: 'Cámara', Premium: 'Pro', Wardrobe: 'Looks', Profile: 'Perfil', Stats: 'Stats' },
  en: { Camera: 'Camera', Premium: 'Pro', Wardrobe: 'Looks', Profile: 'Profile', Stats: 'Stats' },
};

// ─── Camera FAB ───────────────────────────────────────────────────────────────
const CAM_SIZE = 60;

// ─── Custom Tab Bar — floating pill with frosted glass ────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState('es');
  useEffect(() => { getLanguage().then(setLang); }, []);
  const labels = TAB_LABELS[lang] ?? TAB_LABELS['es'];

  const leftNames:  TabName[] = ['Wardrobe', 'Stats'];
  const rightNames: TabName[] = ['Premium', 'Profile'];
  const cameraIdx = state.routes.findIndex(r => r.name === 'Camera');
  const isCamFocused = state.index === cameraIdx;

  // Hide the tab bar on the Camera screen — it's a full-screen experience
  if (isCamFocused) return null;

  const bottomPad = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 20 : 12);

  function renderTab(name: TabName) {
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
          color={focused ? colors.dark : colors.textTertiary}
        />
        <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
          {labels[name]}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[tabStyles.wrapper, { paddingBottom: bottomPad }]} pointerEvents="box-none">
      <View style={tabStyles.pill}>
        {/* Left tabs */}
        <View style={tabStyles.side}>
          {leftNames.map(renderTab)}
        </View>

        {/* Camera FAB — elevated above the pill */}
        <View style={tabStyles.fabSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.85}
            style={tabStyles.fabTouch}
          >
            <View style={[tabStyles.fabRing, isCamFocused && tabStyles.fabRingFocused]}>
              <View style={[tabStyles.fabCircle, isCamFocused && tabStyles.fabCircleFocused]}>
                <Ionicons
                  name={isCamFocused ? 'camera' : 'camera-outline'}
                  size={26}
                  color={isCamFocused ? colors.onAccent : '#fff'}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right tabs */}
        <View style={tabStyles.side}>
          {rightNames.map(renderTab)}
        </View>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#0d0d10',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 14,
    overflow: 'visible',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  labelActive: { color: colors.dark },

  // Camera FAB
  fabSection: {
    width: CAM_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTouch: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  fabRing: {
    width: CAM_SIZE + 8,
    height: CAM_SIZE + 8,
    borderRadius: (CAM_SIZE + 8) / 2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  fabRingFocused: {
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  fabCircle: {
    width: CAM_SIZE,
    height: CAM_SIZE,
    borderRadius: CAM_SIZE / 2,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabCircleFocused: {
    backgroundColor: colors.accent,
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
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold_Italic,
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
