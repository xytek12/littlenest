import type { ChildSex, TwinType } from '../types/domain';
import { getPalette } from './index';

export type AccentInput =
  | { mode: 'single'; sex: ChildSex }
  | { mode: 'twins'; twinType: TwinType };

export type AccentTheme = {
  primary: string;
  secondary?: string;
  softPrimary: string;
  softSecondary?: string;
};

// Backwards-compatible helper. Internally reads the new pastel watercolor
// palette so the rest of the app stays in sync with the central theme.
export function getAccentTheme(input: AccentInput): AccentTheme {
  const palette =
    input.mode === 'single'
      ? getPalette({ mode: 'single', sex: input.sex })
      : getPalette({ mode: 'twins', twinType: input.twinType });

  return {
    primary: palette.primary,
    softPrimary: palette.primarySoft,
    secondary: palette.secondary,
    softSecondary: palette.secondarySoft,
  };
}
