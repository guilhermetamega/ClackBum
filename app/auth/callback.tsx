import { useApp } from "@/components/appContext";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

export default function Callback() {
  const router = useRouter();
  const { platform } = useApp(); // 🔥 vem do boot

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 🌐 WEB: Supabase já resolve a sessão automaticamente
        if (platform === "web") {
          router.replace("/(tabs)");
          return;
        }

        // 📱 MOBILE: captura deep link
        const url = await Linking.getInitialURL();
        if (!url) {
          router.replace("/auth");
          return;
        }

        const parsed = Linking.parse(url);
        const access_token = parsed.queryParams?.access_token;
        const refresh_token = parsed.queryParams?.refresh_token;

        if (!access_token || !refresh_token) {
          router.replace("/auth");
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: String(access_token),
          refresh_token: String(refresh_token),
        });

        if (error) {
          console.error("❌ Erro ao salvar sessão:", error);
          router.replace("/auth");
          return;
        }

        router.replace("/(tabs)");
      } catch (err) {
        console.error("🔥 Callback error:", err);
        router.replace("/auth");
      }
    };

    handleAuth();
  }, [platform]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
