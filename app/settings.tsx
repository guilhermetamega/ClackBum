import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabaseClient";

export default function Settings() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();

    // 🔥 ESSENCIAL
    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: 20,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
  },
});
