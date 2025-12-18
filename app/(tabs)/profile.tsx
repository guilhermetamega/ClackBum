import UserActionButton from "@/components/userActionButton";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Photo = {
  id: string;
  title: string;
  preview_path: string;
  status: "pending" | "approved" | "rejected";
};

export default function MyProfile() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  async function loadMyPhotos() {
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
      .select("id, title, preview_path, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadMyPhotos();
    }, [])
  );

  function getStatusColor(status: Photo["status"]) {
    switch (status) {
      case "approved":
        return "#2ecc71";
      case "rejected":
        return "#e74c3c";
      default:
        return "#f1c40f";
    }
  }

  function getImageUrl(path: string) {
    return supabase.storage.from("photos_public").getPublicUrl(path).data
      .publicUrl;
  }

  function renderItem({ item }: { item: Photo }) {
    const imageUrl = getImageUrl(item.preview_path);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/(hidden)/photo/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.card}>
          <Image source={{ uri: imageUrl }} style={styles.image} />

          <View style={styles.cardFooter}>
            <Text style={styles.title}>{item.title}</Text>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
    <View style={styles.container}>
      <Text style={styles.header}>
        Meu Perfil
        <UserActionButton />
      </Text>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  list: {
    paddingBottom: 32,
  },
  loading: {
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
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  image: {
    width: "100%",
    height: 220,
  },
  cardFooter: {
    padding: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 12,
  },
});
