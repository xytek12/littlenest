import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';
import {
  PrototypeStateProvider,
  usePrototypeState,
  type FeedUnit,
} from '../src/state/PrototypeState';

function Probe() {
  const state = usePrototypeState();

  return (
    <View>
      <Text testID="feed-unit">{state.settings.feedUnit}</Text>
      <Text testID="sleep-count">{String(state.sleepSessions.length)}</Text>
      <Text testID="latest-sleep-duration">
        {state.sleepSessions[0]?.durationMinutes ?? 'none'}
      </Text>
      <Text testID="latest-wake-count">{state.sleepSessions[0]?.wakeCount ?? 'none'}</Text>
      <Text testID="feed-count">{String(state.feedEntries.length)}</Text>
      <Text testID="latest-feed-kind">{state.feedEntries[0]?.kind ?? 'none'}</Text>
      <Text testID="latest-feed-amount">
        {state.feedEntries[0]?.kind === 'bottle' ? state.feedEntries[0].amount : 'none'}
      </Text>
      <Text testID="latest-feed-unit">
        {state.feedEntries[0]?.kind === 'bottle' ? state.feedEntries[0].unit : 'none'}
      </Text>
      <Text testID="latest-feed-total">
        {state.feedEntries[0]?.kind === 'nursing' ? state.feedEntries[0].totalMinutes : 'none'}
      </Text>
      <Text testID="latest-feed-sides">
        {state.feedEntries[0]?.kind === 'nursing'
          ? `${state.feedEntries[0].leftMinutes}/${state.feedEntries[0].rightMinutes}`
          : 'none'}
      </Text>
      <Text testID="salmon-allergen-checks">
        {state.allergenExposures[state.activeChild.id]?.salmon ?? 'none'}
      </Text>

      <Pressable onPress={() => state.updateFeedUnit('oz')}>
        <Text>set-oz</Text>
      </Pressable>
      <Pressable onPress={state.startSleep}>
        <Text>start-sleep</Text>
      </Pressable>
      <Pressable onPress={() => state.endSleep({ wakeCount: 2 })}>
        <Text>end-sleep</Text>
      </Pressable>
      <Pressable onPress={() => state.recordBottleFeed({ amount: 120 })}>
        <Text>bottle-feed</Text>
      </Pressable>
      <Pressable onPress={() => state.startNursing('left')}>
        <Text>start-left</Text>
      </Pressable>
      <Pressable onPress={() => state.stopNursing('left')}>
        <Text>stop-left</Text>
      </Pressable>
      <Pressable onPress={() => state.startNursing('right')}>
        <Text>start-right</Text>
      </Pressable>
      <Pressable onPress={() => state.stopNursing('right')}>
        <Text>stop-right</Text>
      </Pressable>
      <Pressable onPress={() => state.finishNursingSession()}>
        <Text>finish-nursing</Text>
      </Pressable>
      <Pressable onPress={() => state.markAllergenExposure('salmon', 2)}>
        <Text>mark-salmon-two</Text>
      </Pressable>
      <Pressable onPress={() => state.markAllergenExposure('salmon', 4)}>
        <Text>mark-salmon-too-high</Text>
      </Pressable>
    </View>
  );
}

function renderProbe() {
  return render(
    <PrototypeStateProvider>
      <Probe />
    </PrototypeStateProvider>,
  );
}

describe('PrototypeStateProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tracks feed unit changes', () => {
    const { getByText, getByTestId } = renderProbe();

    expect(getByTestId('feed-unit').props.children).toBe('mL' satisfies FeedUnit);

    fireEvent.press(getByText('set-oz'));

    expect(getByTestId('feed-unit').props.children).toBe('oz');
  });

  it('stores a completed sleep session with duration and wake count', () => {
    const { getByText, getByTestId } = renderProbe();

    fireEvent.press(getByText('start-sleep'));
    jest.setSystemTime(new Date('2026-05-24T11:35:00.000Z'));
    fireEvent.press(getByText('end-sleep'));

    expect(getByTestId('sleep-count').props.children).toBe('1');
    expect(getByTestId('latest-sleep-duration').props.children).toBe(95);
    expect(getByTestId('latest-wake-count').props.children).toBe(2);
  });

  it('stores bottle feeds with default milliliter units', () => {
    const { getByText, getByTestId } = renderProbe();

    fireEvent.press(getByText('bottle-feed'));

    expect(getByTestId('feed-count').props.children).toBe('1');
    expect(getByTestId('latest-feed-kind').props.children).toBe('bottle');
    expect(getByTestId('latest-feed-amount').props.children).toBe(120);
    expect(getByTestId('latest-feed-unit').props.children).toBe('mL');
  });

  it('stores nursing sessions with left and right totals', () => {
    const { getByText, getByTestId } = renderProbe();

    fireEvent.press(getByText('start-left'));
    jest.setSystemTime(new Date('2026-05-24T10:07:00.000Z'));
    fireEvent.press(getByText('stop-left'));

    fireEvent.press(getByText('start-right'));
    jest.setSystemTime(new Date('2026-05-24T10:12:00.000Z'));
    fireEvent.press(getByText('stop-right'));

    fireEvent.press(getByText('finish-nursing'));

    expect(getByTestId('feed-count').props.children).toBe('1');
    expect(getByTestId('latest-feed-kind').props.children).toBe('nursing');
    expect(getByTestId('latest-feed-total').props.children).toBe(12);
    expect(getByTestId('latest-feed-sides').props.children).toBe('7/5');
  });

  it('stores allergen exposure checks per active child and caps them at three', () => {
    const { getByText, getByTestId } = renderProbe();

    expect(getByTestId('salmon-allergen-checks').props.children).toBe('none');

    fireEvent.press(getByText('mark-salmon-two'));

    expect(getByTestId('salmon-allergen-checks').props.children).toBe(2);

    fireEvent.press(getByText('mark-salmon-too-high'));

    expect(getByTestId('salmon-allergen-checks').props.children).toBe(3);
  });
});
