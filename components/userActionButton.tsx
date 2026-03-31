import { useThemeColor } from "@/hooks/use-theme-color";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabaseClient";

export default function UserActionButton() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState<string>("?");
  const router = useRouter();
  const pathname = usePathname();

  const primary = useThemeColor({}, "primary");
  const primaryText = useThemeColor({}, "primaryText");
  const text = useThemeColor({}, "text");
  const surfaceAlt = useThemeColor({}, "surfaceAlt");
  const border = useThemeColor({}, "border");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const meta = user.user_metadata;

    if (meta?.avatar_url) {
      setAvatarUrl(meta.avatar_url);
    }

    const displayName = meta?.full_name || meta?.name;
    if (displayName) {
      setInitial(String(displayName).charAt(0).toUpperCase());
    }
  }

  function handlePress() {
    if (pathname.includes("profile")) {
      router.push("/settings");
      return;
    }

    if (avatarUrl || initial !== "?") {
      router.push("/(tabs)/profile");
      return;
    }

    router.push("/auth");
  }

  if (!avatarUrl && initial === "?") {
    return (
      <Pressable
        style={[styles.loginButton, { backgroundColor: primary }]}
        onPress={handlePress}
      >
        <Text style={[styles.loginText, { color: primaryText }]}>Entrar</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { borderColor: border }]}
        />
      ) : (
        <View
          style={[
            styles.fallbackAvatar,
            { backgroundColor: surfaceAlt, borderColor: border },
          ]}
        >
          <Text style={[styles.initial, { color: text }]}>{initial}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  fallbackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initial: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
