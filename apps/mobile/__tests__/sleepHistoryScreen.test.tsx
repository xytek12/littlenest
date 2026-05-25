import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SleepHistoryScreen } from '../src/screens/SleepHistoryScreen';
import { SleepScreen } from '../src/screens/SleepScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('../src/components/FlowHeader', () => ({
  FlowHeader: ({ title }: { title: string }) => title,
}));

const Stack = createNativeStackNavigator();

function renderSleepFlow() {
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
            <Stack.Screen name="SleepMain" component={SleepScreen} />
            <Stack.Screen name="SleepHistory" component={SleepHistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PrototypeStateProvider>
    </SafeAreaProvider>,
  );
}

describe('SleepHistoryScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the empty inline card and empty history before any session', () => {
    const { getByTestId, getByText, queryAllByText } = renderSleepFlow();

    expect(getByText('Last 24 hours')).toBeTruthy();
    expect(getByText('No entries in the last 24 hours.')).toBeTruthy();

    fireEvent.press(getByTestId('sleep-inline-history'));

    expect(getByTestId('screen-sleep-history')).toBeTruthy();
    expect(queryAllByText('No history yet.').length).toBeGreaterThan(0);
  });

  it('saves a sleep session and lists it on the history screen with duration and wakes', () => {
    const { getByLabelText, getByPlaceholderText, getByTestId, getByText, queryAllByText } =
      renderSleepFlow();

    fireEvent.press(getByText('Start sleep'));
    fireEvent.press(getByLabelText('End sleep session'));
    fireEvent.changeText(getByPlaceholderText('0'), '2');
    jest.setSystemTime(new Date('2026-05-24T11:35:27.000Z'));
    fireEvent.press(getByText('Save sleep session'));

    // Inline card shows the duration and wake count.
    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/1 hr 35 min · 2 wakes/).length).toBeGreaterThan(0);

    fireEvent.press(getByTestId('sleep-inline-history'));

    expect(getByTestId('screen-sleep-history')).toBeTruthy();
    // History rows now show human-readable duration on the primary line and wakes on a secondary line below.
    expect(queryAllByText(/1 hr 35 min/).length).toBeGreaterThan(0);
    expect(queryAllByText(/2 wakes/).length).toBeGreaterThan(0);
  });
});
