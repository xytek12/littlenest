// Loads the storybook + body fonts (Fraunces, Nunito, Cormorant Garamond)
// and the Hebrew fonts (Frank Ruhl Libre, Heebo).
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

// Hebrew display font: Frank Ruhl Libre (replaces Cormorant Garamond italic in HE).
// Hebrew body font: Heebo (replaces Fraunces / Nunito in HE).
// Both packages are added to package.json alongside this change.
let FrankRuhlLibre_700Bold: object | undefined;
let Heebo_400Regular: object | undefined;
let Heebo_700Bold: object | undefined;

try {
  // Dynamic require — graceful no-op if package not yet installed (CI / fresh clone).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ FrankRuhlLibre_700Bold } = require('@expo-google-fonts/frank-ruhl-libre'));
} catch {
  FrankRuhlLibre_700Bold = undefined;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ Heebo_400Regular, Heebo_700Bold } = require('@expo-google-fonts/heebo'));
} catch {
  Heebo_400Regular = undefined;
  Heebo_700Bold = undefined;
}

export function useStoryFonts(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Font values can be numbers (asset IDs) or objects depending on the platform.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fontMap: Record<string, any> = {
      Fraunces_700Bold,
      Nunito_400Regular,
      Nunito_700Bold,
      Nunito_900Black,
      CormorantGaramond_500Medium_Italic,
      CormorantGaramond_700Bold,
    };

    // Add Hebrew fonts only when their packages are installed.
    if (FrankRuhlLibre_700Bold) fontMap['FrankRuhlLibre_700Bold'] = FrankRuhlLibre_700Bold;
    if (Heebo_400Regular) fontMap['Heebo_400Regular'] = Heebo_400Regular;
    if (Heebo_700Bold) fontMap['Heebo_700Bold'] = Heebo_700Bold;

    Font.loadAsync(fontMap)
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
