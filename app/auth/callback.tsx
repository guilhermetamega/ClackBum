import * as Linking from "expo-linking";
import { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

export default function Callback() {
  useEffect(() => {
    const handleAuth = async () => {
      if (Platform.OS === "web") return;

      const url = await Linking.getInitialURL();
      if (!url) return;

      const parsed = Linking.parse(url);

      const access_token = parsed.queryParams?.access_token;
      const refresh_token = parsed.queryParams?.refresh_token;

      if (!access_token || !refresh_token) return;

      await supabase.auth.setSession({
        access_token: String(access_token),
        refresh_token: String(refresh_token),
      });
    };

    handleAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
