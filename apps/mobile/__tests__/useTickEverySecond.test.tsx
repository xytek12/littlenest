import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { useTickEverySecond } from '../src/utils/useTickEverySecond';

function Probe({ enabled, onTick }: { enabled: boolean; onTick: (tick: number) => void }) {
  const tick = useTickEverySecond(enabled);
  useEffect(() => {
    onTick(tick);
  }, [tick, onTick]);
  return <Text testID="tick">{tick}</Text>;
}

describe('useTickEverySecond', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not tick when disabled', () => {
    const seen: number[] = [];
    const { getByTestId } = render(<Probe enabled={false} onTick={(t) => seen.push(t)} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(getByTestId('tick').props.children).toBe(0);
    expect(seen.every((t) => t === 0)).toBe(true);
  });

  it('increments approximately once per second when enabled', () => {
    const { getByTestId } = render(<Probe enabled={true} onTick={() => undefined} />);

    expect(getByTestId('tick').props.children).toBe(0);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('tick').props.children).toBe(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(getByTestId('tick').props.children).toBe(4);
  });

  it('cleans up the interval on unmount', () => {
    const clearSpy = jest.spyOn(globalThis, 'clearInterval');
    const { unmount } = render(<Probe enabled={true} onTick={() => undefined} />);

    unmount();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
