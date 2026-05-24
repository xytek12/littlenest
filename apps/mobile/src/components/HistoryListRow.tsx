import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  primary: string;
  secondary?: string;
  accentColor?: string;
  rtl?: boolean;
};

export function HistoryListRow({ primary, secondary, accentColor, rtl = false }: Props) {
  const theme = useAppTheme();
  const rtlText = rtl ? styles.rtlText : null;

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View
        style={[
          styles.marker,
          { backgroundColor: accentColor ?? theme.border },
        ]}
      />
      <View style={styles.body}>
        <Text style={[styles.primary, rtlText, { color: theme.text }]}>{primary}</Text>
        {secondary ? <Text style={[styles.secondary, rtlText]}>{secondary}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  marker: {
    alignSelf: 'stretch',
    borderRadius: 8,
    width: 6,
  },
  body: { flex: 1 },
  primary: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  secondary: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 3,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
