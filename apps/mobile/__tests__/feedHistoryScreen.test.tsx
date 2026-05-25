import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedHistoryScreen } from '../src/screens/FeedHistoryScreen';
import { FeedScreen } from '../src/screens/FeedScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('../src/components/FlowHeader', () => ({
  FlowHeader: ({ title }: { title: string }) => title,
}));

const Stack = createNativeStackNavigator();

function renderFeedFlow() {
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
            <Stack.Screen name="FeedMain" component={FeedScreen} />
            <Stack.Screen name="FeedHistory" component={FeedHistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PrototypeStateProvider>
    </SafeAreaProvider>,
  );
}

describe('FeedHistoryScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the empty inline card and empty history before any feed', () => {
    const { getByTestId, getByText, queryAllByText } = renderFeedFlow();

    expect(getByText('Last 24 hours')).toBeTruthy();
    expect(getByText('No entries in the last 24 hours.')).toBeTruthy();

    fireEvent.press(getByTestId('feed-inline-history'));

    expect(getByTestId('screen-feed-history')).toBeTruthy();
    expect(queryAllByText('No history yet.').length).toBeGreaterThan(0);
  });

  it('saves a bottle feed and lists it on the history screen', () => {
    const { getByTestId, getByText, queryAllByText } = renderFeedFlow();

    fireEvent.press(getByText('Bottle / nursing'));
    fireEvent.press(getByText('Bottle'));
    fireEvent.press(getByText('120'));
    fireEvent.press(getByText('Save bottle feed'));

    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/Bottle · 120 mL/).length).toBeGreaterThan(0);

    fireEvent.press(getByTestId('feed-inline-history'));

    expect(getByTestId('screen-feed-history')).toBeTruthy();
    // History rows now show "Bottle" on the primary line and "120 mL" on a secondary line below.
    expect(queryAllByText(/Bottle/).length).toBeGreaterThan(0);
    expect(queryAllByText(/120 mL/).length).toBeGreaterThan(0);
  });
});
