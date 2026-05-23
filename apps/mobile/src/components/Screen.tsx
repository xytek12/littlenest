import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/useAppTheme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Screen({ children, scroll = false, contentContainerStyle, testID }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const contentStyle = [
    styles.content,
    {
      backgroundColor: theme.background,
      paddingBottom: 16 + insets.bottom,
    },
    contentContainerStyle,
  ];

  return scroll ? (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        testID={testID}
        contentContainerStyle={contentStyle}
        style={[styles.fill, { backgroundColor: theme.background }]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View testID={testID} style={[styles.fill, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: 16 },
});
