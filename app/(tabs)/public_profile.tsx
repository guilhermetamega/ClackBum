// app/(tabs)/profile.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

interface Photo {
  id: string;
  title: string;
  image_url: string; // path salvo no banco
}

export default function PublicProfile() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("photos")
      .select("id, title, image_url")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setPhotos(data || []);
    setLoading(false);
  }

  function renderItem({ item }: { item: Photo }) {
    const publicUrl = supabase.storage
      .from("photos")
      .getPublicUrl(item.image_url).data.publicUrl;

    return (
      <View style={styles.card}>
        <Image source={{ uri: publicUrl }} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Perfil de Fulano</Text>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  header: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFA500",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 220,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    padding: 12,
  },
});
