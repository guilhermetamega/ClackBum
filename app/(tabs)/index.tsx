import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";
import FeedSearchBar from "@/components/feed/FeedSearchBar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { FeedPhoto, FeedPhotoRow, FeedToast } from "@/types/feed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputSubmitEditingEventData,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type FeedTheme = {
  background: string;
  text: string;
  textMuted: string;
  success: string;
  error: string;
  fixedHeaderBackground: string;
  placeholder: string;
  headerIcon: string;
};

const PAGE_SIZE = 24;
const FIXED_HEADER_HEIGHT = 172;
const DESKTOP_BREAKPOINT = 980;

function getTheme(colorScheme: "light" | "dark" | null | undefined): FeedTheme {
  const isDark = colorScheme === "dark";

  return {
    background: isDark ? "#121212" : "#F5F5F5",
    text: isDark ? "#F5F5F5" : "#121212",
    textMuted: isDark ? "#B8B8B8" : "#6B7280",
    success: "#16A34A",
    error: "#DC2626",
    fixedHeaderBackground: isDark ? "#121212" : "#F5F5F5",
    placeholder: "#33516E",
    headerIcon: "#33516E",
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function resolveUser(users: FeedPhotoRow["users"]) {
  if (Array.isArray(users)) {
    return users[0] ?? null;
  }

  return users ?? null;
}

function resolveSales(photoSales: FeedPhotoRow["photo_sales"]): number {
  if (Array.isArray(photoSales)) {
    return photoSales[0]?.sales ?? 0;
  }

  return photoSales?.sales ?? 0;
}

function buildSearchableText(photo: FeedPhotoRow) {
  const user = resolveUser(photo.users);

  return normalizeText(
    [
      photo.title ?? "",
      photo.description ?? "",
      user?.name ?? "",
      ...(photo.tags ?? []),
    ].join(" "),
  );
}

function toFeedPhoto(photo: FeedPhotoRow): FeedPhoto {
  const publicImageUrl = photo.preview_path
    ? supabase.storage.from("photos_public").getPublicUrl(photo.preview_path)
        .data.publicUrl
    : "";

  return {
    id: photo.id,
    title: photo.title?.trim() || "Foto sem título",
    description: photo.description?.trim() || "",
    preview_path: photo.preview_path ?? "",
    original_path: photo.original_path ?? "",
    visibility: photo.visibility,
    user_id: photo.user_id,
    price: photo.price ?? 0,
    tags: photo.tags ?? [],
    sales: resolveSales(photo.photo_sales),
    created_at: photo.created_at,
    public_image_url: publicImageUrl,
    users: resolveUser(photo.users),
    searchableText: buildSearchableText(photo),
  };
}

function mergeUniquePhotos(current: FeedPhoto[], incoming: FeedPhoto[]) {
  const map = new Map<string, FeedPhoto>();

  current.forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => map.set(item.id, item));

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { payment } = useLocalSearchParams<{ payment?: string }>();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentWidth = isDesktop ? Math.min(width - 32, 1120) : width - 24;

  const [allPhotos, setAllPhotos] = useState<FeedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState<FeedToast | null>(null);

  const inputRef = useRef<TextInput | null>(null);

  const loadFeedPage = useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      if ((loadingMore && !reset) || (!hasMore && !reset && page !== 0)) {
        return;
      }

      if (reset) {
        setRefreshing(true);
      } else if (page === 0 && allPhotos.length === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const nextPage = reset ? 0 : page;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
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
            tags,
            created_at,
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

      if (error) {
        console.error("Erro ao carregar feed:", error);
        setToast({
          message: "Não foi possível carregar o feed agora.",
          type: "error",
        });
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }

      const normalized = ((data ?? []) as unknown as FeedPhotoRow[]).map(
        toFeedPhoto,
      );

      setAllPhotos((current) =>
        reset ? normalized : mergeUniquePhotos(current, normalized),
      );
      setPage(nextPage + 1);
      setHasMore(normalized.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    },
    [allPhotos.length, hasMore, loadingMore, page],
  );

  useEffect(() => {
    void loadFeedPage({ reset: true });
  }, [loadFeedPage]);

  useEffect(() => {
    if (!payment) return;

    if (payment === "success") {
      setToast({
        message: "Pagamento aprovado. A foto já está disponível no seu perfil.",
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
    }, 3200);

    return () => clearTimeout(timer);
  }, [payment, router]);

  const filteredPhotos = useMemo(() => {
    const query = normalizeText(searchText);

    if (!query) return allPhotos;

    return allPhotos.filter((photo) => photo.searchableText.includes(query));
  }, [allPhotos, searchText]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    void loadFeedPage();
  }, [hasMore, loadFeedPage, loading, loadingMore]);

  const handleRefresh = useCallback(() => {
    void loadFeedPage({ reset: true });
  }, [loadFeedPage]);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    inputRef.current?.focus();
  }, []);

  const handleSearchSubmit = useCallback(
    (_event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      inputRef.current?.focus();
    },
    [],
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <FeedList
        data={filteredPhotos}
        loadingInitial={loading}
        loadingMore={loadingMore}
        refreshing={refreshing}
        hasMore={hasMore}
        hasQuery={!!searchText.trim()}
        contentWidth={contentWidth}
        topInset={FIXED_HEADER_HEIGHT}
        onResetSearch={handleClearSearch}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onPressPhoto={(item) =>
          router.push({
            pathname: "/(hidden)/photo/[id]",
            params: { id: item.id },
          })
        }
      />

      <View
        pointerEvents="box-none"
        style={[
          styles.fixedHeaderLayer,
          {
            backgroundColor: theme.fixedHeaderBackground,
          },
        ]}
      >
        <FeedHeader contentWidth={contentWidth} />

        <FeedSearchBar
          ref={inputRef}
          value={searchText}
          onChangeText={setSearchText}
          onClear={handleClearSearch}
          onSubmitEditing={handleSearchSubmit}
          contentWidth={contentWidth}
          placeholderTextColor={theme.placeholder}
          inputTextColor="#1E4563"
          iconColor={theme.headerIcon}
        />
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.metaRow,
          {
            width: contentWidth,
            top: FIXED_HEADER_HEIGHT - 8,
          },
        ]}
      ></View>

      {toast ? (
        <View
          style={[
            styles.toast,
            {
              backgroundColor:
                toast.type === "success" ? theme.success : theme.error,
            },
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  fixedHeaderLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  metaRow: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 18,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "700",
  },
  metaHint: {
    fontSize: 12,
    fontWeight: "500",
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    zIndex: 30,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
