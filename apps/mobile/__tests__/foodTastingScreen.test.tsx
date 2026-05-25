import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { FoodTastingScreen } from '../src/screens/FoodTastingScreen';
import { fetchAllergenReferenceItems } from '../src/services/allergenRepository';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('../src/components/FlowHeader', () => ({
  FlowHeader: ({ title }: { title: string }) => title,
}));
jest.mock('../src/services/allergenRepository', () => ({
  fetchAllergenReferenceItems: jest.fn(),
}));

const mockedFetchAllergens = jest.mocked(fetchAllergenReferenceItems);

describe('FoodTastingScreen', () => {
  beforeEach(() => {
    mockedFetchAllergens.mockReset();
  });

  it('loads allergen reference items from Supabase when available', async () => {
    mockedFetchAllergens.mockResolvedValue([
      {
        id: 'live-salmon',
        section: 'Fish',
        name: 'Salmon',
        testedCount: 0,
        sourceLabel: 'NIAID',
        sourceUrl: 'https://www.niaid.nih.gov/',
      },
    ]);

    const { getByText, queryByText } = render(
      <PrototypeStateProvider>
        <FoodTastingScreen />
      </PrototypeStateProvider>,
    );

    await waitFor(() => expect(getByText('Salmon')).toBeTruthy());
    expect(getByText('Fish')).toBeTruthy();
    expect(queryByText(/still local prototype data/i)).toBeNull();
  });

  it('lets parents mark one, two, or three allergen checks and shows completion', async () => {
    mockedFetchAllergens.mockResolvedValue([
      {
        id: 'salmon',
        section: 'Fish',
        name: 'Salmon',
        testedCount: 0,
        sourceLabel: 'FDA',
        sourceUrl: 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies',
      },
    ]);

    const { getByLabelText, getByText } = render(
      <PrototypeStateProvider>
        <FoodTastingScreen />
      </PrototypeStateProvider>,
    );

    await waitFor(() => expect(getByText('Salmon')).toBeTruthy());

    fireEvent.press(getByLabelText('Mark Salmon as 2 checks'));

    expect(getByText('2/3 allergy checks complete')).toBeTruthy();

    fireEvent.press(getByLabelText('Mark Salmon as 3 checks'));

    expect(getByText('All checks complete')).toBeTruthy();
  });
});
