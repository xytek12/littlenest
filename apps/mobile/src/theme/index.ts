import type { ChildProfile, ChildSex, TwinType } from '../types/domain';
import { colors as legacyColors } from './colors';

// ---------- Pastel watercolor base ----------
export const paletteBase = {
  paperCream: '#FBF6F0',
  cardWash: '#FFFCF7',
  cardWashAlt: 'rgba(255, 252, 247, 0.85)',
  ink: '#3F3A3A',
  inkSoft: '#6F6664',
  sage: '#A7BFA3',
  sageSoft: '#E1ECDF',
  border: '#EADFD2',
  borderSoft: '#F1E7DA',
  // sticker / dock colours
  stickerCharcoal: '#2B2B3A',
  stickerBubblegum: '#FF8FB1',
  stickerSky: '#5EC0FF',
  shadowOffset: '#2B2B3A',
} as const;

// ---------- Per baby-type palettes ----------
export const paletteGirl = {
  primary: '#E8A6A0',
  primarySoft: '#F6D9D2',
  primaryDeep: '#B65F5A',
  sticker: paletteBase.stickerBubblegum,
};

export const paletteBoy = {
  primary: '#7FA6C9',
  primarySoft: '#CFE0EE',
  primaryDeep: '#3E6A93',
  sticker: paletteBase.stickerSky,
};

export const paletteTwins = {
  primary: '#E8A6A0',
  primarySoft: '#F6D9D2',
  primaryDeep: '#B65F5A',
  secondary: '#7FA6C9',
  secondarySoft: '#CFE0EE',
  secondaryDeep: '#3E6A93',
  bridge: '#C9BBD9',
  bridgeSoft: '#EBE2F1',
};

export type BabyType = 'girl' | 'boy' | 'twins';

export type Palette = {
  type: BabyType;
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  secondary?: string;
  secondarySoft?: string;
  secondaryDeep?: string;
  bridge?: string;
  bridgeSoft?: string;
  sticker: string;
  stickerSecondary?: string;
};

export function getPalette(input:
  | { mode: 'single'; sex: ChildSex }
  | { mode: 'twins'; twinType?: TwinType }): Palette {
  if (input.mode === 'single') {
    if (input.sex === 'boy') {
      return {
        type: 'boy',
        primary: paletteBoy.primary,
        primarySoft: paletteBoy.primarySoft,
        primaryDeep: paletteBoy.primaryDeep,
        sticker: paletteBoy.sticker,
      };
    }
    return {
      type: 'girl',
      primary: paletteGirl.primary,
      primarySoft: paletteGirl.primarySoft,
      primaryDeep: paletteGirl.primaryDeep,
      sticker: paletteGirl.sticker,
    };
  }

  // twins
  if (input.twinType === 'boy_boy') {
    return {
      type: 'boy',
      primary: paletteBoy.primary,
      primarySoft: paletteBoy.primarySoft,
      primaryDeep: paletteBoy.primaryDeep,
      sticker: paletteBoy.sticker,
    };
  }
  if (input.twinType === 'girl_girl') {
    return {
      type: 'girl',
      primary: paletteGirl.primary,
      primarySoft: paletteGirl.primarySoft,
      primaryDeep: paletteGirl.primaryDeep,
      sticker: paletteGirl.sticker,
    };
  }
  // boy_girl twins (mixed) → dual + bridge
  return {
    type: 'twins',
    primary: paletteTwins.primary,
    primarySoft: paletteTwins.primarySoft,
    primaryDeep: paletteTwins.primaryDeep,
    secondary: paletteTwins.secondary,
    secondarySoft: paletteTwins.secondarySoft,
    secondaryDeep: paletteTwins.secondaryDeep,
    bridge: paletteTwins.bridge,
    bridgeSoft: paletteTwins.bridgeSoft,
    sticker: paletteBase.stickerBubblegum,
    stickerSecondary: paletteBase.stickerSky,
  };
}

// Per-child accent — used so each twin gets a distinct colour even when the
// shared palette only carries one primary (boy_boy / girl_girl twins).
export function getChildAccent(child: ChildProfile, index: number, palette: Palette): {
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  sticker: string;
} {
  if (palette.type === 'twins') {
    // boy_girl: pink for A, blue for B (match child.sex if available)
    if (child.sex === 'boy') {
      return {
        primary: paletteTwins.secondary,
        primarySoft: paletteTwins.secondarySoft,
        primaryDeep: paletteTwins.secondaryDeep,
        sticker: paletteBase.stickerSky,
      };
    }
    return {
      primary: paletteTwins.primary,
      primarySoft: paletteTwins.primarySoft,
      primaryDeep: paletteTwins.primaryDeep,
      sticker: paletteBase.stickerBubblegum,
    };
  }
  // same-sex twins: vary slightly by index so the two cards differ
  if (index === 1) {
    const base = palette.type === 'girl' ? paletteGirl : paletteBoy;
    return {
      primary: base.primaryDeep,
      primarySoft: base.primarySoft,
      primaryDeep: base.primaryDeep,
      sticker: base.sticker,
    };
  }
  return {
    primary: palette.primary,
    primarySoft: palette.primarySoft,
    primaryDeep: palette.primaryDeep,
    sticker: palette.sticker,
  };
}

// ---------- Typography tokens ----------
// Font family names match the @expo-google-fonts/<family> export names.
// If the font is not yet loaded, RN silently falls back to the system font.
export const typography = {
  display: 'Fraunces_700Bold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  displayBold: 'CormorantGaramond_700Bold',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  bodyBlack: 'Nunito_900Black',
};

// ---------- Re-exports & helpers ----------
export { legacyColors };
export const surfaces = paletteBase;
