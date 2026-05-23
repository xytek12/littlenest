import type { ReactElement } from 'react';
import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Screen } from '../src/components/Screen';

function renderScreen(node: ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 44, right: 0, bottom: 34, left: 0 },
      }}
    >
      {node}
    </SafeAreaProvider>,
  );
}

describe('Screen', () => {
  it('does not render a ScrollView by default', () => {
    const { UNSAFE_queryByType, getByText } = renderScreen(
      <Screen>
        <Text>Body</Text>
      </Screen>,
    );

    expect(getByText('Body')).toBeTruthy();
    expect(UNSAFE_queryByType(ScrollView)).toBeNull();
    expect(UNSAFE_queryByType(View)).toBeTruthy();
  });

  it('renders a ScrollView when scrolling is enabled', () => {
    const { UNSAFE_queryByType } = renderScreen(
      <Screen scroll>
        <Text>Body</Text>
      </Screen>,
    );

    expect(UNSAFE_queryByType(ScrollView)).toBeTruthy();
  });
});
