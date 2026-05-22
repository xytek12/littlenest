import { describe, expect, it } from '@jest/globals';
import { getAccentTheme } from '../src/theme/theme';

describe('theme accent rules', () => {
  it('uses blue for one boy', () => {
    expect(getAccentTheme({ mode: 'single', sex: 'boy' }).primary).toBe('#72BDF2');
  });

  it('uses pink for one girl', () => {
    expect(getAccentTheme({ mode: 'single', sex: 'girl' }).primary).toBe('#F4A3C7');
  });

  it('uses blue for boy and boy twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'boy_boy' }).primary).toBe('#72BDF2');
  });

  it('uses pink for girl and girl twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'girl_girl' }).primary).toBe('#F4A3C7');
  });

  it('uses split colors only for boy and girl twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'boy_girl' }).secondary).toBe('#F4A3C7');
  });
});
