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
  image_url: string;
}

const PAGE_SIZE = 20;

export default function PublicProfile() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos(loadMore = false) {
    if (loadingMore || (!hasMore && loadMore)) return;

    loadMore ? setLoadingMore(true) : setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("photos")
      .select("id, title, image_url")
      .eq("status", "approved")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (data) {
      setPhotos((prev) => (loadMore ? [...prev, ...data] : data));
      setHasMore(data.length === PAGE_SIZE);
      setPage((prev) => prev + 1);
    }

    setLoading(false);
    setLoadingMore(false);
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

  function renderFooter() {
    if (!loadingMore) return null;

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#FFA500" />
      </View>
    );
  }

  if (loading && page === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed Público</Text>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={() => fetchPhotos(true)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
