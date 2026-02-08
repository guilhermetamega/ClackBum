import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type PhotoData = {
  id: string;
  url: string;
  price: number;
  users?: {
    name: string;
  };
};

export default function PurchaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkAuthAndLoad() {
    const { data: session } = await supabase.auth.getSession();

    if (!session.session) {
      Alert.alert("Login necessário", "Faça login para comprar esta foto.");
      return router.replace("/auth");
    }

    fetchPhoto();
  }

  async function fetchPhoto() {
    const { data, error } = await supabase
      .from("photos")
      .select(
        `
        *,
        users (
          name
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados da foto.");
      return;
    }

    setPhoto(data);
    setLoading(false);
  }

  async function handlePurchase() {
    Alert.alert(
      "Pagamento realizado! 🎉",
      "Você agora pode baixar a foto em alta qualidade.",
    );

    // Depois vamos implementar liberação do arquivo real
    router.replace("/(tabs)");
  }

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  if (loading || !photo) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.url }} style={styles.image} />

      <Text style={styles.title}>Foto por {photo.users?.name}</Text>

      <Text style={styles.price}>R$ {photo.price.toFixed(2)}</Text>

      <TouchableOpacity style={styles.button} onPress={handlePurchase}>
        <Text style={styles.buttonText}>Comprar e Baixar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 350,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFA500",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6A0DAD",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});
