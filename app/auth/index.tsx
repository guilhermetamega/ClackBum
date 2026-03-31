import { useApp } from "@/components/appContext";
import { FontAwesome } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import { Link, usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { platform } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  const siteUrl = useMemo(() => {
    if (process.env.EXPO_PUBLIC_SITE_URL) {
      return process.env.EXPO_PUBLIC_SITE_URL;
    }

    if (Platform.OS === "web") {
      return window.location.origin;
    }

    return "http://localhost:8081";
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erro ao obter sessão inicial:", error);
        return;
      }

      if (!mounted || redirectedRef.current) return;

      if (session && pathname === "/auth") {
        redirectedRef.current = true;
        router.replace("/(tabs)");
      }
    }

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION") {
        console.log("🔐 Auth event:", event);
      }

      if (!mounted || redirectedRef.current) return;

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        redirectedRef.current = true;
        router.replace("/(tabs)");
        return;
      }

      if (event === "SIGNED_OUT" && pathname !== "/auth") {
        redirectedRef.current = false;
        router.replace("/auth");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  useEffect(() => {
    if (platform !== "mobile") return;

    const handleDeepLink = async (event: { url: string }) => {
      try {
        console.log("🔗 Deep link recebido:", event.url);

        const url = new URL(event.url);
        const accessToken =
          url.hash.match(/access_token=([^&]*)/)?.[1] ||
          url.searchParams.get("access_token");
        const refreshToken =
          url.hash.match(/refresh_token=([^&]*)/)?.[1] ||
          url.searchParams.get("refresh_token");

        if (!accessToken || !refreshToken) return;

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("❌ Erro ao setar sessão:", error);
        }
      } catch (error) {
        console.error("❌ Erro ao tratar deep link:", error);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    void Linking.getInitialURL().then((url) => {
      if (url) {
        void handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [platform]);

  const signInWithGoogle = async () => {
    try {
      const redirectTo =
        platform === "web" ? siteUrl : makeRedirectUri({ scheme: "clackbum" });

      console.log("🔗 Redirect URL:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: platform !== "web",
        },
      });

      if (error) {
        console.error("❌ Erro no login Google:", error.message);
        return;
      }

      if (!data?.url) {
        console.error("❌ Nenhuma URL retornada no OAuth.");
        return;
      }

      if (platform === "web") {
        window.location.href = data.url;
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );
      console.log("🔄 Resultado WebBrowser:", result);
    } catch (error) {
      console.error("❌ Erro inesperado no login Google:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/bg.png")}
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ opacity: 0.5, width: "110%" }}
    >
      <View style={styles.overlay}>
        <View style={styles.cameraContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.cameraLogo}
            resizeMode="contain"
          />
          <Text style={styles.title}>CLACKBUM</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Text style={styles.subtitle}>ENTRE PARA CONTINUAR</Text>

          <TouchableOpacity
            style={styles.buttonGoogle}
            onPress={signInWithGoogle}
            activeOpacity={0.92}
          >
            <FontAwesome name="google" size={32} color="#EE9734" />
            <Text style={styles.buttonText}>Entrar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonFacebook}
            disabled
            activeOpacity={1}
          >
            <FontAwesome name="facebook" size={32} color="#EE9734" />
            <Text style={styles.buttonText}>Entrar com Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao continuar, você concorda com nossos
          </Text>

          <View style={styles.footerLinksRow}>
            <Link href="/terms" style={styles.footerLink}>
              Termos de Uso
            </Link>

            <Text style={styles.footerDivider}>•</Text>

            <Link href="/privacy-policy" style={styles.footerLink}>
              Política de Privacidade
            </Link>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },

  overlay: {
    width: "50%",
    minWidth: 376,
    maxWidth: "80%",
    backgroundColor: "#1e4563f6",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 28,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#EE9734",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 32,
    elevation: 8,
  },

  cameraLogo: {
    width: 124,
    height: 124,
  },

  cameraContainer: {
    marginBottom: 54,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: -20,
    fontSize: 36,
    color: "#F5F5F5",
    fontFamily: "Koulen-Regular",
    textAlign: "center",
  },

  buttonsContainer: {
    flexDirection: "column",
    gap: 8,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  subtitle: {
    color: "#F5F5F5",
    fontWeight: "400",
    fontFamily: "Koulen-Regular",
    fontSize: 24,
  },

  buttonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 16,
    width: "100%",
    minWidth: 336,
    maxWidth: "80%",
  },

  buttonFacebook: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 16,
    width: "100%",
    minWidth: 336,
    maxWidth: "80%",
    opacity: 0.7,
  },

  buttonText: {
    fontWeight: "400",
    color: "#1E4563",
    fontSize: 20,
    fontFamily: "Koulen-Regular",
  },

  footer: {
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },

  footerText: {
    color: "rgba(245,245,245,0.78)",
    fontSize: 12,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 6,
  },

  footerLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  footerLink: {
    color: "#FFB357",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.2,
    textDecorationLine: "underline",
  },

  footerDivider: {
    color: "rgba(245,245,245,0.45)",
    fontSize: 12,
    fontWeight: "300",
  },
});
