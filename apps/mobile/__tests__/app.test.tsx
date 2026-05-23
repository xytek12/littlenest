import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('app shell', () => {
  it('renders the primary bottom tabs', () => {
    const { getAllByText, getByText } = render(<App />);

    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Food')).toBeTruthy();
    expect(getAllByText('Home').length).toBeGreaterThan(0);
    expect(getByText('Feed')).toBeTruthy();
    expect(getByText('AI')).toBeTruthy();
  });
});
