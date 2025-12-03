// app/auth/index.tsx
import { makeRedirectUri } from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/(tabs)");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInEmail() {
    if (!email || !password) return Alert.alert("Preencha email e senha");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Erro", error.message);
  }

  async function signUpEmail() {
    if (!email || !password) return Alert.alert("Preencha email e senha");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Erro", error.message);
    else
      Alert.alert("Verifique seu email", "Confirme para completar o cadastro.");
  }

  const redirectUri = makeRedirectUri({ scheme: "clackbum" });

  async function signInWithProvider(provider: "google" | "facebook") {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri },
      });
    } catch (err: any) {
      Alert.alert("Erro OAuth", err.message || String(err));
    }
  }

  return (
    <LinearGradient colors={["#0E0E0E", "#1A1A1A"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.logoText}>ClackBum</Text>
        <Text style={styles.subtitle}>
          A favela tem{" "}
          <Text style={{ color: "#FFA500", fontWeight: "800" }}>voz</Text>.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity style={styles.buttonPrimary} onPress={signInEmail}>
          <Text style={styles.buttonPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={signUpEmail}>
          <Text style={styles.linkButtonText}>Criar conta com Email</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
          onPress={() => signInWithProvider("google")}
        >
          <Text style={styles.socialButtonText}>Entrar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#1877F2" }]}
          onPress={() => signInWithProvider("facebook")}
        >
          <Text style={styles.socialButtonText}>Entrar com Facebook</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },

  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFA500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  subtitle: {
    fontSize: 16,
    color: "#eee",
    marginTop: 4,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444",
  },

  buttonPrimary: {
    backgroundColor: "#6A0DAD",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  linkButton: {
    marginTop: 10,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#FFA500",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#444",
  },
  dividerText: {
    color: "#777",
    marginHorizontal: 8,
    fontSize: 12,
  },

  socialButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  socialButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
