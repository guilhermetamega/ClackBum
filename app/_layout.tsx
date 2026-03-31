import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../lib/supabaseClient";

import { AppProvider } from "@/components/appContext";
import StripeWrapper from "@/components/StripeWrapper";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const PUBLIC_ROUTES = new Set(["auth", "terms", "privacy-policy"]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    "Koulen-Regular": require("../assets/fonts/Koulen-Regular.ttf"),
  });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        console.error("Erro ao obter sessão inicial:", error);
      }

      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const firstSegment = segments[0] ?? "";
  const isPublicRoute = useMemo(
    () => PUBLIC_ROUTES.has(firstSegment),
    [firstSegment],
  );
  const inAuthRoute = firstSegment === "auth";

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    if (!session && !isPublicRoute) {
      router.replace("/auth");
      return;
    }

    if (session && inAuthRoute) {
      router.replace("/(tabs)");
    }
  }, [session, loading, fontsLoaded, inAuthRoute, isPublicRoute, router]);

  if (loading || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <StripeWrapper>
      <AppProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="privacy-policy" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProvider>
    </StripeWrapper>
  );
}
