import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

describe('app shell', () => {
  it('starts on the home screen and switches between the visible refresh tabs', () => {
    const { getByLabelText, getByRole, getByTestId, getByText, queryByTestId } = render(<App />);

    expect(getByTestId('screen-home')).toBeTruthy();
    expect(queryByTestId('screen-recipes')).toBeNull();
    expect(getByLabelText('Recipes tab')).toBeTruthy();
    expect(getByLabelText('Home tab')).toBeTruthy();
    expect(getByLabelText('AI tab')).toBeTruthy();
    expect(getByLabelText('Growth tab')).toBeTruthy();

    fireEvent.press(getByRole('button', { name: /Recipes tab/i }));

    expect(getByTestId('screen-recipes')).toBeTruthy();
    expect(queryByTestId('screen-home')).toBeNull();

    fireEvent.press(getByRole('button', { name: /AI tab/i }));

    expect(getByTestId('screen-ai')).toBeTruthy();

    fireEvent.press(getByRole('button', { name: /Growth tab/i }));

    expect(getByTestId('screen-growth')).toBeTruthy();
    expect(getByText('Height')).toBeTruthy();
  });

  it('routes from home actions into the hidden sleep flow instead of using a visible tab', () => {
    const { getByLabelText, getByText, getByTestId, queryByRole } = render(<App />);

    expect(queryByRole('button', { name: /Sleep, tab/i })).toBeNull();

    fireEvent.press(getByText('Sleep'));

    expect(getByTestId('screen-sleep')).toBeTruthy();
    expect(getByLabelText('Home tab')).toBeTruthy();

    fireEvent.press(getByLabelText('Back to Home'));

    expect(getByTestId('screen-home')).toBeTruthy();
  });

  it('routes from home actions into the food tasting flow', () => {
    const { getByText, getByTestId } = render(<App />);

    fireEvent.press(getByText('Food tasting'));

    expect(getByTestId('screen-food-tasting')).toBeTruthy();
  });

  it('opens settings from the home header gear', () => {
    const { getByLabelText, getByTestId } = render(<App />);

    fireEvent.press(getByLabelText('Open settings'));

    expect(getByTestId('screen-settings')).toBeTruthy();
    expect(getByLabelText('Home tab')).toBeTruthy();
  });

  it('renders Hebrew labels after switching the prototype language', () => {
    const { getByLabelText, getByText } = render(<App />);

    fireEvent.press(getByLabelText('Open settings'));
    fireEvent.press(getByText('HE'));

    expect(getByText('הגדרות')).toBeTruthy();
    expect(getByText('שפה')).toBeTruthy();
  });
});
