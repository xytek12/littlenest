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
import { Screen } from '../components/Screen';
import { AiScreen } from '../screens/AiScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SleepScreen } from '../screens/SleepScreen';
import { getCurrentSession } from '../services/trackingRepository';
import { hasSupabaseEnv, supabase } from '../services/supabase';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { tabs } from './tabs';

export type RootTabParamList = {
  Sleep: undefined;
  Food: undefined;
  Home: undefined;
  Feed: undefined;
  AI: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const screenComponents = {
  Sleep: SleepScreen,
  Food: FoodScreen,
  Home: HomeScreen,
  Feed: FeedScreen,
  AI: AiScreen,
} satisfies Record<keyof RootTabParamList, ComponentType>;

function TabsNavigator() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      {tabs.map((tab) => (
        <Tab.Screen key={tab} name={tab} component={screenComponents[tab]} />
      ))}
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const appTheme = useAppTheme();
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
          <TabsNavigator />
        ) : (
          <LoginScreen />
        )
      ) : (
        <TabsNavigator />
      )}
    </NavigationContainer>
  );
}
