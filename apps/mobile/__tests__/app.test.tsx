import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { he } from '../src/i18n/he';
import App from '../App';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

function completeFamilySetup(getByText: ReturnType<typeof render>['getByText']) {
  fireEvent.press(getByText('Start testing LittleNest'));
}

describe('app shell', () => {
  it('starts on the family setup screen, then switches between the visible refresh tabs', () => {
    const { getByLabelText, getByRole, getByTestId, getByText, queryByTestId } = render(<App />);

    expect(getByTestId('screen-family-setup')).toBeTruthy();
    completeFamilySetup(getByText);

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

    completeFamilySetup(getByText);
    expect(queryByRole('button', { name: /Sleep, tab/i })).toBeNull();

    fireEvent.press(getByText('Sleep'));

    expect(getByTestId('screen-sleep')).toBeTruthy();
    expect(getByLabelText('Home tab')).toBeTruthy();

    fireEvent.press(getByLabelText('Back to Home'));
    expect(getByTestId('screen-home')).toBeTruthy();
  });

  it('routes from home actions into the food tasting flow', () => {
    const { getByText, getByTestId } = render(<App />);

    completeFamilySetup(getByText);
    fireEvent.press(getByText('Food tasting'));

    expect(getByTestId('screen-food-tasting')).toBeTruthy();
  });

  it('keeps family setup out of the home dashboard', () => {
    const { getByText, queryAllByText } = render(<App />);

    completeFamilySetup(getByText);
    expect(queryAllByText('Family setup')).toHaveLength(0);
  });

  it('opens settings from the home header gear', () => {
    const { getByLabelText, getByTestId, getByText } = render(<App />);

    completeFamilySetup(getByText);
    fireEvent.press(getByLabelText('Open settings'));

    expect(getByTestId('screen-settings')).toBeTruthy();
    expect(getByLabelText('Home tab')).toBeTruthy();
  });

  it('renders clean Hebrew labels after switching the prototype language', () => {
    const { getByLabelText, getByText, getByTestId } = render(<App />);

    completeFamilySetup(getByText);
    fireEvent.press(getByLabelText('Open settings'));
    fireEvent.press(getByText('HE'));

    expect(getByLabelText(`${he.tabs.recipes} tab`)).toBeTruthy();
    expect(getByLabelText(`${he.tabs.home} tab`)).toBeTruthy();
    expect(getByLabelText('AI tab')).toBeTruthy();
    expect(getByLabelText(`${he.tabs.growth} tab`)).toBeTruthy();
    expect(getByTestId('screen-settings')).toBeTruthy();
    expect(getByText(he.settings.language)).toBeTruthy();

    fireEvent.press(getByText(he.settings.familySetup));

    expect(getByTestId('screen-family-setup')).toBeTruthy();
    expect(getByLabelText(`${he.tabs.home} tab`)).toBeTruthy();
    expect(getByText(he.familySetup.title)).toBeTruthy();
    expect(getByText(he.familySetup.childDetails)).toBeTruthy();
    expect(getByText(he.familySetup.childName)).toBeTruthy();
    expect(getByText(he.common.day)).toBeTruthy();
    expect(getByText(he.common.month)).toBeTruthy();
    expect(getByText(he.common.year)).toBeTruthy();
  });

  it('localizes feed and growth screens after switching to Hebrew', () => {
    const { getAllByText, getByLabelText, getByText } = render(<App />);

    completeFamilySetup(getByText);
    fireEvent.press(getByLabelText('Open settings'));
    fireEvent.press(getByText('HE'));
    fireEvent.press(getByLabelText(`${he.tabs.home} tab`));

    fireEvent.press(getByText(he.home.feedTitle));
    expect(getByText(he.feed.title)).toBeTruthy();
    expect(getByText(he.feed.actionTitle)).toBeTruthy();

    fireEvent.press(getByLabelText(he.common.backHomeLabel));
    fireEvent.press(getByLabelText(`${he.tabs.growth} tab`));

    expect(getAllByText(he.growth.title).length).toBeGreaterThan(0);
    expect(getByText(he.growth.metric)).toBeTruthy();
    expect(getByText(he.growth.weight)).toBeTruthy();
  });
});
