import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from '../src/screens/FeedScreen';
import { FeedHistoryScreen } from '../src/screens/FeedHistoryScreen';
import { GrowthScreen } from '../src/screens/GrowthScreen';
import { GrowthHistoryScreen } from '../src/screens/GrowthHistoryScreen';
import { SleepScreen } from '../src/screens/SleepScreen';
import { SleepHistoryScreen } from '../src/screens/SleepHistoryScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('../src/components/FlowHeader', () => ({
  FlowHeader: ({ title }: { title: string }) => title,
}));

const Stack = createNativeStackNavigator();

function renderWithStack(
  mainName: string,
  MainComponent: ComponentType,
  historyName: string,
  HistoryComponent: ComponentType,
) {
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
            <Stack.Screen name={mainName} component={MainComponent} />
            <Stack.Screen name={historyName} component={HistoryComponent} />
          </Stack.Navigator>
        </NavigationContainer>
      </PrototypeStateProvider>
    </SafeAreaProvider>,
  );
}

function renderSleep() {
  return renderWithStack('SleepMain', SleepScreen, 'SleepHistory', SleepHistoryScreen);
}

function renderGrowth() {
  return renderWithStack('GrowthMain', GrowthScreen, 'GrowthHistory', GrowthHistoryScreen);
}

function renderFeed() {
  return renderWithStack('FeedMain', FeedScreen, 'FeedHistory', FeedHistoryScreen);
}

describe('interaction flows', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('asks for wake count before saving a finished sleep session', () => {
    const { getByLabelText, getByText, getByPlaceholderText, queryAllByText, queryByText } =
      renderSleep();

    fireEvent.press(getByLabelText('Start sleep'));
    expect(getByText('Sleep timer')).toBeTruthy();

    fireEvent.press(getByText('Pause'));
    expect(getByText('Paused')).toBeTruthy();

    fireEvent.press(getByText('Resume'));
    fireEvent.press(getByLabelText('End sleep session'));

    expect(getByText(/How many times did the child wake up/i)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('0'), '2');
    jest.setSystemTime(new Date('2026-05-24T11:35:27.000Z'));
    fireEvent.press(getByText('Save sleep session'));

    expect(queryByText(/How many times did the child wake up/i)).toBeNull();
    // New inline history card format: "{date}, {time}  ·  {duration}  ·  {wakeCount} wakes".
    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/1 hr 35 min · 2 wakes/).length).toBeGreaterThan(0);
  });

  it('records growth measurements with metric and imperial units', () => {
    const { getByLabelText, getByPlaceholderText, getByText, queryAllByText } = renderGrowth();

    fireEvent.press(getByLabelText('Weight'));
    fireEvent.changeText(getByPlaceholderText('0'), '8.2');
    fireEvent.press(getByText('Save measurement'));

    // New inline history card format: "{date}, {time} · Weight · {value}".
    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/Weight · 8.2 kg/).length).toBeGreaterThan(0);

    fireEvent.press(getByText('Imperial'));
    fireEvent.press(getByLabelText('Height'));
    fireEvent.changeText(getByPlaceholderText('0'), '27.5');
    fireEvent.press(getByText('Save measurement'));

    expect(queryAllByText(/Height · 27.5 in/).length).toBeGreaterThan(0);

    fireEvent.press(getByLabelText('Head circumference'));
    fireEvent.changeText(getByPlaceholderText('0'), '16.2');
    fireEvent.press(getByText('Save measurement'));

    // Head row is tagged with the active child's name (single mode: "Maya").
    expect(queryAllByText(/Head · 16.2 in · Maya/).length).toBeGreaterThan(0);
  });

  it('opens bottle mode with presets and saves the chosen amount', () => {
    const { getByLabelText, getByText, queryAllByText } = renderFeed();

    fireEvent.press(getByLabelText('Add Feed'));
    fireEvent.press(getByText('Bottle'));
    fireEvent.press(getByText('120'));
    fireEvent.press(getByText('Save bottle feed'));

    // New inline history card format: "{date}, {time} · Bottle · {amount} {unit}".
    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/Bottle · 120 mL/).length).toBeGreaterThan(0);
  });

  it('opens nursing mode with left and right controls', () => {
    const { getByLabelText, getByText } = renderFeed();

    fireEvent.press(getByLabelText('Add Feed'));
    fireEvent.press(getByText('Nursing'));

    expect(getByText('Start left')).toBeTruthy();
    expect(getByText('Start right')).toBeTruthy();
  });

  it('ticks the sleep timer display every second while a session is active', () => {
    const { getByLabelText, queryAllByText } = renderSleep();

    fireEvent.press(getByLabelText('Start sleep'));

    // advanceTimersByTime also advances the mocked system clock, so Date.now()
    // moves forward by the same amount and getRunningDuration reports it.
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(queryAllByText(/5 seconds/).length).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(queryAllByText(/12 seconds/).length).toBeGreaterThan(0);
  });

  it('ticks the nursing left side display every second while running', () => {
    const { getByLabelText, getByText, queryAllByText } = renderFeed();

    fireEvent.press(getByLabelText('Add Feed'));
    fireEvent.press(getByText('Nursing'));
    fireEvent.press(getByText('Start left'));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(queryAllByText(/00:05 saved/).length).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(queryAllByText(/00:11 saved/).length).toBeGreaterThan(0);
  });

  it('saves nursing history with seconds for each side and the total duration', () => {
    const { getByLabelText, getByText, queryAllByText } = renderFeed();

    fireEvent.press(getByLabelText('Add Feed'));
    fireEvent.press(getByText('Nursing'));

    fireEvent.press(getByText('Start left'));
    jest.setSystemTime(new Date('2026-05-24T10:07:35.000Z'));
    fireEvent.press(getByText('Stop left'));

    fireEvent.press(getByText('Start right'));
    jest.setSystemTime(new Date('2026-05-24T10:12:50.000Z'));
    fireEvent.press(getByText('Stop right'));
    fireEvent.press(getByText('Finish nursing session'));

    // Inline history uses human-readable durations (minutes only, seconds dropped).
    // formatDurationHuman: 770s→"12 minutes", 455s→"7 minutes", 315s→"5 minutes".
    // (Testing Library normalizes runs of whitespace to a single space.)
    expect(queryAllByText(/Nursing · 12 minutes \(L 7 minutes \/ R 5 minutes\)/).length).toBeGreaterThan(0);
  });
});
