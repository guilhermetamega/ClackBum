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

type Photo = {
  id: string;
  title: string;
  image_url: string;
  price: number;
};

export default function Profile() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMyPhotos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("photos")
      .select("id, title, image_url, price")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMyPhotos();
  }, []);

  function renderItem({ item }: { item: Photo }) {
    const publicUrl = supabase.storage
      .from("photos")
      .getPublicUrl(item.image_url).data.publicUrl;

    return (
      <View style={styles.card}>
        <Image source={{ uri: publicUrl }} style={styles.image} />
        <View style={styles.cardFooter}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>R$ {item.price}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#0f0f0f",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 260,
  },
  cardFooter: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  price: {
    color: "#FFA500",
    fontWeight: "700",
  },
});
