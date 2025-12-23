import UserActionButton from "@/components/userActionButton";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

interface Photo {
  id: string;
  title: string;
  preview_path: string;
}

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export default function HomeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");

  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPhotos([]);
      setPage(0);
      setHasMore(true);
      fetchPhotos(false, true);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  async function fetchPhotos(loadMore = false, reset = false) {
    if (loadingMore || (!hasMore && loadMore)) return;

    loadMore ? setLoadingMore(true) : setLoading(true);

    const currentPage = loadMore ? page : 0;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("photos")
      .select("id, title, preview_path")
      .eq("status", "approved")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (data) {
      setPhotos((prev) => (loadMore ? [...prev, ...data] : data));
      setHasMore(data.length === PAGE_SIZE);
      setPage(currentPage + 1);
    }

    setLoading(false);
    setLoadingMore(false);
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
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </TouchableOpacity>
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
      <Text style={styles.header}>
        Feed Público <UserActionButton />
      </Text>

      <TextInput
        placeholder="Buscar por título ou tag"
        placeholderTextColor="#777"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={() => fetchPhotos(true)}
        onEndReachedThreshold={0.6}
        ListFooterComponent={renderFooter}
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
    marginBottom: 12,
  },
  search: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
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
