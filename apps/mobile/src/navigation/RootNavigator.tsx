import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { Text } from 'react-native';
import { BottomEmojiTabBar } from '../components/BottomEmojiTabBar';
import { Screen } from '../components/Screen';
import { AiScreen } from '../screens/AiScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { FoodTastingScreen } from '../screens/FoodTastingScreen';
import { FamilySetupScreen } from '../screens/FamilySetupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SleepScreen } from '../screens/SleepScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GrowthScreen } from '../screens/GrowthScreen';
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
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const screenComponents = {
  Recipes: FoodScreen,
  Home: HomeScreen,
  AI: AiScreen,
  Growth: GrowthScreen,
  SleepFlow: SleepScreen,
  FeedFlow: FeedScreen,
  FoodTastingFlow: FoodTastingScreen,
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
      {hasSupabaseEnv() ? (
        session === undefined ? (
          <Screen testID="screen-auth-loading">
            <Text style={{ color: appTheme.text, fontSize: 18, fontWeight: '800' }}>
              Checking session...
            </Text>
          </Screen>
        ) : session ? (
          prototype.loading ? (
            <Screen testID="screen-prototype-loading">
              <Text style={{ color: appTheme.text, fontSize: 18, fontWeight: '800' }}>
                Preparing prototype...
              </Text>
            </Screen>
          ) : prototype.family.configured ? (
            <TabsNavigator />
          ) : (
            <FamilySetupScreen />
          )
        ) : (
          <LoginScreen />
        )
      ) : (
        <TabsNavigator />
      )}
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
