import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
  useRouter,
  useSegments,
  type Href,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useAppTheme } from '@src/hooks/useAppTheme';
import { useAuth } from '@src/hooks/useAuth';
import { useNotifications } from '@src/hooks/useNotifications';
import { seedIfEmpty } from '@src/scripts/seedChallenges';
import {
  ThemeProvider,
  useWebBodyBackground,
} from '@src/theme/ThemeContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootLayoutNavigator() {
  useNotifications();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colors = useAppTheme().colors;

  useEffect(() => {
    if (loading) return;
    const primeiro = String(segments[0] ?? '');
    const emAuthFlow = primeiro === 'login' || primeiro === 'cadastro';
    if (!user && !emAuthFlow) {
      router.replace('/login' as Href);
    }
    if (user && emAuthFlow) {
      router.replace('/' as Href);
    }
  }, [user, loading, segments, router]);

  useEffect(() => {
    if (__DEV__ && user) {
      seedIfEmpty().catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="configuracoes" />
      <Stack.Screen name="ranking" />
      <Stack.Screen name="conquistas" />
      <Stack.Screen name="termos" />
      <Stack.Screen name="planos" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function RootLayoutInner() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const { colors, temaEfetivo } = useAppTheme();

  useWebBodyBackground(colors.background);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const baseNavTheme = temaEfetivo === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavTheme,
    dark: temaEfetivo === 'dark',
    colors: {
      ...baseNavTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={temaEfetivo === 'dark' ? 'light' : 'dark'} />
      <RootLayoutNavigator />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
