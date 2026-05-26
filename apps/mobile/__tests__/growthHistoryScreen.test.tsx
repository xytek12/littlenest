import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GrowthHistoryScreen } from '../src/screens/GrowthHistoryScreen';
import { GrowthScreen } from '../src/screens/GrowthScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

const Stack = createNativeStackNavigator();

function renderGrowthFlow() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 44, right: 0, bottom: 34, left: 0 },
      }}
    >
      <PrototypeStateProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GrowthMain" component={GrowthScreen} />
            <Stack.Screen name="GrowthHistory" component={GrowthHistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PrototypeStateProvider>
    </SafeAreaProvider>,
  );
}

describe('GrowthHistoryScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows an empty inline card and empty history when there are no entries', () => {
    const { getByTestId, getByText, queryAllByText } = renderGrowthFlow();

    expect(getByText('Last 2 years')).toBeTruthy();
    expect(getByText('No measurements in the last 2 years.')).toBeTruthy();

    fireEvent.press(getByTestId('growth-inline-history'));

    expect(getByTestId('screen-growth-history')).toBeTruthy();
    expect(queryAllByText('No history yet.').length).toBeGreaterThan(0);
  });

  it('records a measurement, surfaces it inline, and lists it on the history screen', () => {
    const { getByPlaceholderText, getByTestId, getByText, queryAllByText } = renderGrowthFlow();

    fireEvent.press(getByText('Weight'));
    fireEvent.changeText(getByPlaceholderText('0'), '8.2');
    fireEvent.press(getByText('Save measurement'));

    // Inline card shows the new weight row with date/time + value.
    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/Weight · 8.2 kg/).length).toBeGreaterThan(0);

    fireEvent.press(getByTestId('growth-inline-history'));

    expect(getByTestId('screen-growth-history')).toBeTruthy();
    expect(queryAllByText(/Weight · 8.2 kg/).length).toBeGreaterThan(0);
  });
});
