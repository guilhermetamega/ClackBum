import { useApp } from "@/components/appContext";
import { FontAwesome } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import {
  Image,
  ImageBackground,
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

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔐 Auth event:", event);

        if (event === "SIGNED_IN" && session) {
          console.log("✅ Login realizado:", session.user.email);
          router.replace("/(tabs)"); // Redirect
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Captura deep link no mobile após OAuth
  useEffect(() => {
    if (platform === "mobile") {
      const handleDeepLink = async (event: { url: string }) => {
        console.log("🔗 Deep link recebido:", event.url);

        // Extrai tokens da URL (hash ou query params)
        const url = new URL(event.url);
        const access_token =
          url.hash.match(/access_token=([^&]*)/)?.[1] ||
          url.searchParams.get("access_token");
        const refresh_token =
          url.hash.match(/refresh_token=([^&]*)/)?.[1] ||
          url.searchParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("❌ Erro ao setar sessão:", error);
          }
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);

      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });

      return () => {
        subscription.remove();
      };
    }
  }, [platform]);

  const signInWithGoogle = async () => {
    const redirectTo =
      // platform === "web" ? process.env.EXPO_PUBLIC_SITE_URL : makeRedirectUri();
      platform === "web" ? "http://localhost:8081" : makeRedirectUri();

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
      console.log("⚠️ Nenhuma URL retornada");
      return;
    }

    console.log("🌐 Abrindo URL OAuth:", data.url);

    if (platform === "web") {
      window.location.href = data.url;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      console.log("🔄 Resultado WebBrowser:", result);
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
          >
            <FontAwesome name="google" size={32} color="#EE9734" />
            <Text style={styles.buttonText}>Entrar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonFacebook} disabled>
            <FontAwesome name="facebook" size={32} color="#EE9734" />
            <Text style={styles.buttonText}>Entrar com Facebook</Text>
          </TouchableOpacity>
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
    paddingVertical: 64,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#EE9734",

    // sombra iOS / Web
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 32,

    // sombra Android
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
});
