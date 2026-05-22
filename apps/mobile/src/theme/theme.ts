import type { ChildSex, TwinType } from '../types/domain';
import { colors } from './colors';

export type AccentInput =
  | { mode: 'single'; sex: ChildSex }
  | { mode: 'twins'; twinType: TwinType };

export type AccentTheme = {
  primary: string;
  secondary?: string;
  softPrimary: string;
  softSecondary?: string;
};

export function getAccentTheme(input: AccentInput): AccentTheme {
  if (input.mode === 'single') {
    return input.sex === 'boy'
      ? { primary: colors.blue, softPrimary: colors.blueSoft }
      : { primary: colors.pink, softPrimary: colors.pinkSoft };
  }

  if (input.twinType === 'boy_girl') {
    return {
      primary: colors.blue,
      secondary: colors.pink,
      softPrimary: colors.blueSoft,
      softSecondary: colors.pinkSoft,
    };
  }

  return input.twinType === 'boy_boy'
    ? { primary: colors.blue, softPrimary: colors.blueSoft }
    : { primary: colors.pink, softPrimary: colors.pinkSoft };
}
