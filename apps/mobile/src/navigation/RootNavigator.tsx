import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigation,
  type Theme,
} from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { Text } from 'react-native';
import { BottomEmojiTabBar } from '../components/BottomEmojiTabBar';
import { Screen } from '../components/Screen';
import { AiScreen } from '../screens/AiScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { FeedHistoryScreen } from '../screens/FeedHistoryScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { FoodTastingScreen } from '../screens/FoodTastingScreen';
import { FamilySetupScreen } from '../screens/FamilySetupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SleepScreen } from '../screens/SleepScreen';
import { SleepHistoryScreen } from '../screens/SleepHistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GrowthScreen } from '../screens/GrowthScreen';
import { GrowthHistoryScreen } from '../screens/GrowthHistoryScreen';
import { getCurrentSession } from '../services/trackingRepository';
import { hasSupabaseEnv, supabase } from '../services/supabase';
import { PrototypeStateProvider, usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export type RootTabParamList = {
  Recipes: undefined;
  Home: undefined;
  AI: undefined;
  Growth: undefined;
  SleepFlow: undefined;
  FeedFlow: undefined;
  FoodTastingFlow: undefined;
  FamilySetupFlow: undefined;
  Settings: undefined;
};

export type GrowthStackParamList = {
  GrowthMain: undefined;
  GrowthHistory: undefined;
};

export type SleepStackParamList = {
  SleepMain: undefined;
  SleepHistory: undefined;
};

export type FeedStackParamList = {
  FeedMain: undefined;
  FeedHistory: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const GrowthStack = createNativeStackNavigator<GrowthStackParamList>();
const SleepStack = createNativeStackNavigator<SleepStackParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();

function GrowthStackNavigator() {
  return (
    <GrowthStack.Navigator screenOptions={{ headerShown: false }}>
      <GrowthStack.Screen name="GrowthMain" component={GrowthScreen} />
      <GrowthStack.Screen name="GrowthHistory" component={GrowthHistoryScreen} />
    </GrowthStack.Navigator>
  );
}

function SleepStackNavigator() {
  return (
    <SleepStack.Navigator screenOptions={{ headerShown: false }}>
      <SleepStack.Screen name="SleepMain" component={SleepScreen} />
      <SleepStack.Screen name="SleepHistory" component={SleepHistoryScreen} />
    </SleepStack.Navigator>
  );
}

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedMain" component={FeedScreen} />
      <FeedStack.Screen name="FeedHistory" component={FeedHistoryScreen} />
    </FeedStack.Navigator>
  );
}

function FamilySetupFlowScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  return (
    <FamilySetupScreen
      embeddedInTabs
      onComplete={() => navigation.navigate('Home')}
    />
  );
}

const screenComponents = {
  Recipes: FoodScreen,
  Home: HomeScreen,
  AI: AiScreen,
  Growth: GrowthStackNavigator,
  SleepFlow: SleepStackNavigator,
  FeedFlow: FeedStackNavigator,
  FoodTastingFlow: FoodTastingScreen,
  FamilySetupFlow: FamilySetupFlowScreen,
  Settings: SettingsScreen,
} satisfies Record<keyof RootTabParamList, ComponentType>;

function TabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <BottomEmojiTabBar {...props} />}
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      {(Object.keys(screenComponents) as (keyof RootTabParamList)[]).map((tab) => (
        <Tab.Screen key={tab} name={tab} component={screenComponents[tab]} />
      ))}
    </Tab.Navigator>
  );
}

function AppContent() {
  const appTheme = useAppTheme();
  const prototype = usePrototypeState();
  const [session, setSession] = useState<Session | null | undefined>(
    hasSupabaseEnv() ? undefined : null,
  );
  const baseTheme = appTheme.isDark ? DarkTheme : DefaultTheme;
  const theme: Theme = useMemo(
    () => ({
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.blue,
        background: appTheme.background,
        card: appTheme.surface,
        text: appTheme.text,
        border: appTheme.border,
        notification: colors.berry,
      },
    }),
    [appTheme.background, appTheme.border, appTheme.surface, appTheme.text, baseTheme],
  );

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return;
    }

    let mounted = true;

    getCurrentSession()
      .then((nextSession) => {
        if (mounted) {
          setSession(nextSession);
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer theme={theme}>
      {hasSupabaseEnv()
        ? session === undefined
          ? (
              <Screen testID="screen-auth-loading">
                <Text style={{ color: appTheme.text, fontSize: 18, fontWeight: '800' }}>
                  Checking session...
                </Text>
              </Screen>
            )
          : session
            ? prototype.loading
              ? (
                  <Screen testID="screen-prototype-loading">
                    <Text style={{ color: appTheme.text, fontSize: 18, fontWeight: '800' }}>
                      Preparing prototype...
                    </Text>
                  </Screen>
                )
              : prototype.family.configured
                ? <TabsNavigator />
                : <FamilySetupScreen />
            : <LoginScreen />
        : prototype.loading
          ? (
              <Screen testID="screen-prototype-loading">
                <Text style={{ color: appTheme.text, fontSize: 18, fontWeight: '800' }}>
                  Preparing prototype...
                </Text>
              </Screen>
            )
          : prototype.family.configured
            ? <TabsNavigator />
            : <FamilySetupScreen />}
    </NavigationContainer>
  );
}

export function RootNavigator() {
  return (
    <PrototypeStateProvider>
      <AppContent />
    </PrototypeStateProvider>
  );
}
