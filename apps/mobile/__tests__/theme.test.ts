import { describe, expect, it } from '@jest/globals';
import { getAccentTheme } from '../src/theme/theme';
import { getPalette, paletteBoy, paletteGirl, paletteTwins } from '../src/theme';

describe('theme accent rules (legacy bridge)', () => {
  it('uses cornflower for one boy', () => {
    expect(getAccentTheme({ mode: 'single', sex: 'boy' }).primary).toBe(paletteBoy.primary);
  });

  it('uses petal pink for one girl', () => {
    expect(getAccentTheme({ mode: 'single', sex: 'girl' }).primary).toBe(paletteGirl.primary);
  });

  it('uses cornflower for boy and boy twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'boy_boy' }).primary).toBe(paletteBoy.primary);
  });

  it('uses petal pink for girl and girl twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'girl_girl' }).primary).toBe(paletteGirl.primary);
  });

  it('uses split colors only for boy and girl twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'boy_girl' }).secondary).toBe(paletteTwins.secondary);
  });
});

describe('palette getter', () => {
  it('returns the twins palette with both primary + secondary for mixed twins', () => {
    const palette = getPalette({ mode: 'twins', twinType: 'boy_girl' });
    expect(palette.type).toBe('twins');
    expect(palette.primary).toBe(paletteTwins.primary);
    expect(palette.secondary).toBe(paletteTwins.secondary);
    expect(palette.bridge).toBe(paletteTwins.bridge);
  });

  it('returns a single-primary palette for one boy', () => {
    const palette = getPalette({ mode: 'single', sex: 'boy' });
    expect(palette.type).toBe('boy');
    expect(palette.primary).toBe(paletteBoy.primary);
    expect(palette.secondary).toBeUndefined();
  });
});
