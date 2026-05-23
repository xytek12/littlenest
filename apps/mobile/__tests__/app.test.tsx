import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

describe('app shell', () => {
  it('starts on the home screen and switches tabs', () => {
    const { getByRole, getByTestId, queryByTestId } = render(<App />);

    expect(getByTestId('screen-home')).toBeTruthy();
    expect(queryByTestId('screen-sleep')).toBeNull();

    fireEvent.press(getByRole('button', { name: /Sleep, tab/i }));

    expect(getByTestId('screen-sleep')).toBeTruthy();
    expect(queryByTestId('screen-home')).toBeNull();
  });
});
