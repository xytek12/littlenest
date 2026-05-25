import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStoryFonts } from './src/theme/fonts';

export default function App() {
  // Triggers the async font load but never blocks rendering — the storybook
  // typography simply pops in once the Google Fonts finish downloading.
  useStoryFonts();

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
