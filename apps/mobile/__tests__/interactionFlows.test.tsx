import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from '../src/screens/FeedScreen';
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
    const { getByText, getByPlaceholderText, queryByText } = renderWithProviders(<SleepScreen />);

    fireEvent.press(getByText('Start sleep'));
    fireEvent.press(getByText('End sleep'));

    expect(getByText(/How many times did the child wake up/i)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('0'), '2');
    jest.setSystemTime(new Date('2026-05-24T11:35:00.000Z'));
    fireEvent.press(getByText('Save sleep session'));

    expect(queryByText(/How many times did the child wake up/i)).toBeNull();
    expect(getByText(/wakes 2/i)).toBeTruthy();
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
