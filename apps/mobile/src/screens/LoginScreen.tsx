import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getDictionary } from '../i18n';
import { Screen } from '../components/Screen';
import { mockFamily } from '../data/mockSeed';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { signInAdmin } from '../services/trackingRepository';
import { getSupabaseEnvError, hasSupabaseEnv } from '../services/supabase';

export function LoginScreen() {
  const theme = useAppTheme();
  const copy = getDictionary(mockFamily.language);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!hasSupabaseEnv()) {
      setErrorMessage(getSupabaseEnvError());
      return;
    }

    setLoading(true);
    try {
      await signInAdmin(email.trim(), password);
      setStatusMessage('Signed in');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen testID="screen-login" scroll>
      <View style={[styles.hero, { backgroundColor: colors.neutral }]}>
        <Text style={[styles.kicker, { color: colors.berry }]}>LittleNest AI</Text>
        <Text style={[styles.title, { color: theme.text }]}>Admin test sign in</Text>
        <Text style={styles.subtitle}>
          Use your Supabase admin account to test login, AI comparisons, and recipe search.
        </Text>
      </View>

      <View
        style={[
          styles.formCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="admin@example.com"
          placeholderTextColor="#8B99AA"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          value={email}
        />

        <Text style={[styles.label, styles.passwordLabel, { color: theme.text }]}>Password</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#8B99AA"
          secureTextEntry
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          value={password}
        />

        <Pressable
          onPress={handleLogin}
          style={[styles.button, { backgroundColor: colors.blue }]}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </Pressable>

        {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.safetyCard}>
        <Text style={styles.safetyText}>{copy.safety.doctor}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6B7D91',
    marginTop: 8,
    lineHeight: 20,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  status: {
    color: '#5EA96E',
    fontWeight: '700',
    marginTop: 12,
  },
  error: {
    color: colors.berry,
    fontWeight: '700',
    marginTop: 12,
  },
  safetyCard: {
    backgroundColor: colors.blueSoft,
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
  },
  safetyText: {
    color: '#36506B',
    lineHeight: 20,
  },
});
