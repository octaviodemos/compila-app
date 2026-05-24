import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import 'react-native-reanimated';

import { theme } from '@src/constants/theme';
import { ThemeConfigContext } from '@src/contexts/useThemeContext';
import { useAuth } from '@src/hooks/useAuth';
import { useThemeColors } from '@src/hooks/useTheme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootLayoutNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colors = useThemeColors();

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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const themeColorScheme = useColorScheme() ?? 'light';

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

  const colors = theme.colors[themeColorScheme];
  const navigationTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.card,
      notification: colors.accent,
    },
  };

  return (
    <ThemeConfigContext.Provider value={theme}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <RootLayoutNavigator />
      </ThemeProvider>
    </ThemeConfigContext.Provider>
  );
}
