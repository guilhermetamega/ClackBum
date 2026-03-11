import PhotoCard from "@/components/PhotoCard";
import UserActionButton from "@/components/userActionButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Photo = {
  id: string;
  title: string;
  description: string;
  preview_path: string;
  original_path: string;
  visibility: "public" | "unlisted" | "private";
  user_id: string;
  price: number;

  users: {
    name: string;
    avatar_url: string | null;
  } | null;

  sales: number | null;
};

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
  const { payment } = useLocalSearchParams<{ payment?: string }>();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !payment) return;

    if (payment === "success") {
      setToast({
        message:
          "Pagamento aprovado. A foto já está disponível para download no seu perfil 📸",
        type: "success",
      });
    }

    if (payment === "cancel") {
      setToast({
        message: "Pagamento cancelado. Nenhuma cobrança foi feita.",
        type: "error",
      });
    }

    const timer = setTimeout(() => {
      setToast(null);
      router.replace("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [payment, mounted]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPhotos([]);
      setPage(0);
      setHasMore(true);
      fetchPhotos();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  async function fetchPhotos(loadMore = false) {
    if (loadingMore || (!hasMore && loadMore)) return;

    loadMore ? setLoadingMore(true) : setLoading(true);

    const currentPage = loadMore ? page : 0;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("photos")
      .select(
        `
    id,
    title,
    description,
    preview_path,
    original_path,
    visibility,
    user_id,
    price,
    users (
      name,
      avatar_url
    ),
    photo_sales (
      sales
    )
  `,
      )
      .eq("status", "approved")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const normalized: Photo[] =
      data?.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        preview_path: p.preview_path,
        original_path: p.original_path,
        visibility: p.visibility,
        user_id: p.user_id,
        price: p.price,
        users: p.users ?? null,
        sales: p.photo_sales?.[0]?.sales ?? 0,
      })) ?? [];

    setPhotos((prev) => (loadMore ? [...prev, ...normalized] : normalized));
    setHasMore(normalized.length === PAGE_SIZE);
    setPage(currentPage + 1);

    setLoading(false);
    setLoadingMore(false);
  }

  function getImageUrl(path: string) {
    return supabase.storage.from("photos_public").getPublicUrl(path).data
      .publicUrl;
  }

  const renderItem = useCallback(
    ({ item }: { item: Photo }) => {
      const imageUrl = getImageUrl(item.preview_path);
      return (
        <PhotoCard
          photo={{
            id: item.id,
            title: item.title,
            image_url: imageUrl,
            price: item.price,
            users: item.users,
            sales: item.sales,
          }}
          onPress={() =>
            router.push({
              pathname: "/(hidden)/photo/[id]",
              params: { id: item.id },
            })
          }
        />
      );
    },
    [router],
  );

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
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
      />

      {toast && (
        <View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
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
  toast: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    zIndex: 999,
    maxWidth: "90%",
  },
  toastSuccess: {
    backgroundColor: "#16a34a",
  },
  toastError: {
    backgroundColor: "#dc2626",
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});
