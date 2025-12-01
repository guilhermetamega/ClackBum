import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabaseClient";

type Photo = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string; // imagem preview baixa resolução
  full_image_url: string; // alta resolução
  created_at: string;
  users?: {
    name: string;
  };
};

export default function PhotoDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsLogged(!!user);
  }

  async function loadPhoto() {
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select(
        `
        *,
        users (
          name
        )
      `
      )
      .eq("id", id)
      .single();

    if (!error) setPhoto(data as Photo);
    setLoading(false);
  }

  useEffect(() => {
    checkUser();
    loadPhoto();
  }, [id]);

  if (loading || !photo)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  const handleBuy = () => {
    if (!isLogged) {
      router.push("/auth");
    } else {
      router.push({
        pathname: "/purchase/[id]",
        params: { id: photo.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.image_url }} style={styles.image} />

      <Text style={styles.title}>{photo.title}</Text>
      <Text style={styles.author}>
        Por {photo.users?.name || "Fotógrafo(a) desconhecido"}
      </Text>

      {photo.description ? (
        <Text style={styles.description}>{photo.description}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleBuy}>
        <Text style={styles.buttonText}>Comprar Foto - R$ {photo.price}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  author: {
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 16,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: "#444",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  button: {
    backgroundColor: "#6A0DAD",
    margin: 16,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
