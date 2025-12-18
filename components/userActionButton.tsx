import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabaseClient";

export default function UserActionButton() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState<string>("?");
  const router = useRouter();
  const pathname = usePathname();

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

    if (meta?.full_name) {
      setInitial(meta.full_name.charAt(0).toUpperCase());
    }
  }

  function handlePress() {
    // Se estiver na tela de perfil → configurações
    if (pathname.includes("profile")) {
      router.push("/settings");
      return;
    }

    // Se estiver logado → perfil
    if (avatarUrl || initial !== "?") {
      router.push("/(tabs)/profile");
      return;
    }

    // Se não estiver logado → auth
    router.push("/auth");
  }

  // 🔓 NÃO LOGADO
  if (!avatarUrl && initial === "?") {
    return (
      <TouchableOpacity style={styles.loginButton} onPress={handlePress}>
        <Text style={styles.loginText}>Login / Cadastro</Text>
      </TouchableOpacity>
    );
  }

  // 🔐 LOGADO
  return (
    <TouchableOpacity onPress={handlePress}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.fallbackAvatar}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    backgroundColor: "#6A0DAD",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  fallbackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
  },
  initial: {
    color: "#000",
    fontWeight: "900",
  },
});
