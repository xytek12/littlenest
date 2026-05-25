import { useEffect, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { getDailyRecipeIdeas } from '../src/data/recipeIdeas';
import { he } from '../src/i18n/he';
import { FoodScreen } from '../src/screens/FoodScreen';
import { PrototypeStateProvider, usePrototypeState } from '../src/state/PrototypeState';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

describe('FoodScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T09:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders readable daily recipe cards with benefit text and source CTA', () => {
    const { getAllByText, getByText, getByTestId } = render(
      <PrototypeStateProvider>
        <FoodScreen />
      </PrototypeStateProvider>,
    );

    expect(getByTestId('screen-recipes')).toBeTruthy();
    expect(getByText('Recipe ideas')).toBeTruthy();
    expect(getByText(/Avocado/i)).toBeTruthy();
    expect(getByText(/healthy fats/i)).toBeTruthy();
    expect(getAllByText(/Open recipe source/i).length).toBeGreaterThan(0);
  });

  it('renders localized Hebrew recipe UI instead of English recipe cards', () => {
    function HebrewFoodScreen() {
      const { updateLanguage } = usePrototypeState();
      const didApplyLanguage = useRef(false);

      useEffect(() => {
        if (didApplyLanguage.current) {
          return;
        }

        didApplyLanguage.current = true;
        updateLanguage('he');
      }, [updateLanguage]);

      return <FoodScreen />;
    }

    const { getAllByText, getByText, queryByText } = render(
      <PrototypeStateProvider>
        <HebrewFoodScreen />
      </PrototypeStateProvider>,
    );

    expect(getByText(he.recipes.title)).toBeTruthy();
    expect(getAllByText(he.recipes.openSource).length).toBeGreaterThan(0);
    expect(queryByText('Recipe ideas')).toBeNull();
    expect(queryByText('Open recipe source')).toBeNull();
  });

  it('rotates the recipe set when refreshCount changes', () => {
    const firstSet = getDailyRecipeIdeas({
      date: new Date('2026-05-24T09:00:00.000Z'),
      language: 'en',
      childAgeMonths: 18,
      query: '',
      refreshCount: 0,
    });
    const secondSet = getDailyRecipeIdeas({
      date: new Date('2026-05-24T09:00:00.000Z'),
      language: 'en',
      childAgeMonths: 18,
      query: '',
      refreshCount: 1,
    });

    expect(firstSet.map((idea) => idea.id)).not.toEqual(secondSet.map((idea) => idea.id));
    expect(firstSet[0]?.title).not.toBe(secondSet[0]?.title);
  });
});
