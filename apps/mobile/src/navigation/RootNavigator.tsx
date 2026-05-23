import type { ComponentType } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { AiScreen } from '../screens/AiScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SleepScreen } from '../screens/SleepScreen';
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

export function RootNavigator() {
  const scheme = useColorScheme();
  const theme: Theme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        {tabs.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={screenComponents[tab.name]} />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
