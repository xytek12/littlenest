import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { FoodScreen } from '../src/screens/FoodScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

describe('FoodScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T09:00:00.000Z'));
  });

  it('renders readable daily recipe cards with benefit text and source CTA', () => {
    const { getAllByText, getByText, getByTestId } = render(
      <PrototypeStateProvider>
        <FoodScreen />
      </PrototypeStateProvider>,
    );

    expect(getByTestId('screen-recipes')).toBeTruthy();
    expect(getByText('Recipe ideas')).toBeTruthy();
    expect(getByText(/Avocado/)).toBeTruthy();
    expect(getByText(/soft first texture/i)).toBeTruthy();
    expect(getAllByText(/Open recipe source/i).length).toBeGreaterThan(0);
  });
});
