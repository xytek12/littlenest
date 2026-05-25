// Loads the storybook + body fonts (Fraunces, Nunito, Cormorant Garamond).
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

export function useStoryFonts(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Font.loadAsync({
      Fraunces_700Bold,
      Nunito_400Regular,
      Nunito_700Bold,
      Nunito_900Black,
      CormorantGaramond_500Medium_Italic,
      CormorantGaramond_700Bold,
    })
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
