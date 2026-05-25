import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { AiScreen } from '../src/screens/AiScreen';
import { PrototypeStateProvider } from '../src/state/PrototypeState';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

describe('AiScreen', () => {
  it('does not render the recipe ideas action card on the AI screen', () => {
    const { getByTestId, queryByText } = render(
      <PrototypeStateProvider>
        <AiScreen />
      </PrototypeStateProvider>,
    );

    expect(getByTestId('screen-ai')).toBeTruthy();
    expect(queryByText('Compare Gemini + OpenAI')).toBeTruthy();
    expect(queryByText('Recipe ideas')).toBeNull();
  });
});
