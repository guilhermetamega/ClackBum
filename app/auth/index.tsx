// app/auth/index.tsx
import { makeRedirectUri } from "expo-auth-session";
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

WebBrowser.maybeCompleteAuthSession(); // necessário para expo-auth-session flows

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // opcional: listener de mudança de sessão
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/(tabs)"); // ajuste conforme sua rota principal
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInEmail() {
    if (!email || !password) return Alert.alert("Preencha email e senha");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Erro", error.message);
    else router.replace("/(tabs)");
  }

  async function signUpEmail() {
    if (!email || !password) return Alert.alert("Preencha email e senha");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Erro", error.message);
    else
      Alert.alert(
        "Verifique seu email",
        "Confirme seu endereço de email para completar o cadastro."
      );
  }

  // Gera redirect adequado para Expo. Em Expo Go use useProxy: true

  const redirectUri = makeRedirectUri({
    scheme: "clackbum", // substitua depois pelo seu scheme real
  });

  async function signInWithProvider(provider: "google" | "facebook") {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
        },
      });
      // a navegação será tratada quando o browser voltar ao app
    } catch (err: any) {
      Alert.alert("Erro OAuth", err.message || String(err));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={signInEmail}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondary]}
        onPress={signUpEmail}
      >
        <Text style={styles.buttonText}>Cadastrar (email)</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />

      <TouchableOpacity
        style={[styles.button, styles.google]}
        onPress={() => signInWithProvider("google")}
      >
        <Text style={styles.buttonText}>Entrar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.facebook]}
        onPress={() => signInWithProvider("facebook")}
      >
        <Text style={styles.buttonText}>Entrar com Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  input: {
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#6A0DAD",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondary: { backgroundColor: "#FFA500" },
  google: { backgroundColor: "#DB4437" },
  facebook: { backgroundColor: "#1877F2" },
});
