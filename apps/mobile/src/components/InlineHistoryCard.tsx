import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';

export type InlineHistoryRow = {
  key: string;
  primary: string;
  secondary?: string;
  accentColor?: string;
};

type Props = {
  rows: InlineHistoryRow[];
  onPress: () => void;
  testID?: string;
};

export function InlineHistoryCard({ rows, onPress, testID }: Props) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const history = getDictionary(family.language).history;
  const rtl = isRtlLanguage(family.language);
  const rtlText = rtl ? styles.rtlText : null;
  const hasRows = rows.length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={history.last24h}
      onPress={onPress}
      testID={testID}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, rtlText, { color: theme.text }]}>{history.last24h}</Text>
        <Text style={[styles.viewAll, { color: theme.text }]}>{history.viewAll} →</Text>
      </View>
      {hasRows ? (
        rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <View
              style={[styles.marker, { backgroundColor: row.accentColor ?? theme.border }]}
            />
            <View style={styles.rowBody}>
              <Text style={[styles.rowPrimary, rtlText, { color: theme.text }]}>{row.primary}</Text>
              {row.secondary ? (
                <Text style={[styles.rowSecondary, rtlText, { color: theme.mutedText }]}>{row.secondary}</Text>
              ) : null}
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.empty, rtlText, { color: theme.mutedText }]}>{history.empty24h}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '800',
    opacity: 0.7,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  marker: {
    alignSelf: 'stretch',
    borderRadius: 6,
    width: 5,
  },
  rowBody: { flex: 1 },
  rowPrimary: {
    fontWeight: '700',
    lineHeight: 20,
  },
  rowSecondary: {
    color: '#6B7D91',
    lineHeight: 18,
    marginTop: 2,
  },
  empty: {
    color: '#6B7D91',
    lineHeight: 20,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
