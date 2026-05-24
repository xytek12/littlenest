import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from '../src/screens/FeedScreen';
import { GrowthScreen } from '../src/screens/GrowthScreen';
import { SleepScreen } from '../src/screens/SleepScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('../src/components/FlowHeader', () => ({
  FlowHeader: ({ title }: { title: string }) => title,
}));

function renderWithProviders(node: ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 44, right: 0, bottom: 34, left: 0 },
      }}
    >
      <PrototypeStateProvider>{node}</PrototypeStateProvider>
    </SafeAreaProvider>,
  );
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
    const { getByLabelText, getByText, getByPlaceholderText, queryByText } =
      renderWithProviders(<SleepScreen />);

    fireEvent.press(getByText('Start sleep'));
    expect(getByText('Sleep timer')).toBeTruthy();

    fireEvent.press(getByText('Pause'));
    expect(getByText('Paused')).toBeTruthy();

    fireEvent.press(getByText('Resume'));
    fireEvent.press(getByLabelText('End sleep session'));

    expect(getByText(/How many times did the child wake up/i)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('0'), '2');
    jest.setSystemTime(new Date('2026-05-24T11:35:00.000Z'));
    fireEvent.press(getByText('Save sleep session'));

    expect(queryByText(/How many times did the child wake up/i)).toBeNull();
    expect(getByText(/wakes 2/i)).toBeTruthy();
  });

  it('records growth measurements with metric and imperial units', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<GrowthScreen />);

    fireEvent.press(getByText('Weight'));
    fireEvent.changeText(getByPlaceholderText('0'), '8.2');
    fireEvent.press(getByText('Save measurement'));

    expect(getByText(/Weight 8.2 kg/i)).toBeTruthy();

    fireEvent.press(getByText('Imperial'));
    fireEvent.press(getByText('Height'));
    fireEvent.changeText(getByPlaceholderText('0'), '27.5');
    fireEvent.press(getByText('Save measurement'));

    expect(getByText(/Height 27.5 in/i)).toBeTruthy();

    fireEvent.press(getByText('Head circumference'));
    fireEvent.changeText(getByPlaceholderText('0'), '16.2');
    fireEvent.press(getByText('Save measurement'));

    expect(getByText(/Head circumference 16.2 in/i)).toBeTruthy();
  });

  it('opens bottle mode with presets and saves the chosen amount', () => {
    const { getByText } = renderWithProviders(<FeedScreen />);

    fireEvent.press(getByText('Bottle / nursing'));
    fireEvent.press(getByText('Bottle'));
    fireEvent.press(getByText('120'));
    fireEvent.press(getByText('Save bottle feed'));

    expect(getByText(/bottle 120 mL/i)).toBeTruthy();
  });

  it('opens nursing mode with left and right controls', () => {
    const { getByText } = renderWithProviders(<FeedScreen />);

    fireEvent.press(getByText('Bottle / nursing'));
    fireEvent.press(getByText('Nursing'));

    expect(getByText('Start left')).toBeTruthy();
    expect(getByText('Start right')).toBeTruthy();
  });
});
