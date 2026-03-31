import { fetchFeedPhotos } from "@/services/feed";
import type { FeedPhoto } from "@/types/feed";
import { useCallback, useEffect, useMemo, useState } from "react";

function normalizeSearchTerm(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function matchesSearch(photo: FeedPhoto, normalizedSearchTerm: string) {
  if (!normalizedSearchTerm) {
    return true;
  }

  return photo.searchableText.includes(normalizedSearchTerm);
}

function dedupePhotos(items: FeedPhoto[]) {
  const map = new Map<string, FeedPhoto>();

  for (const item of items) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

export function useFeed() {
  const [items, setItems] = useState<FeedPhoto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(async (targetPage: number, mode: "initial" | "refresh" | "append") => {
    if (mode === "append") {
      setLoadingMore(true);
    } else if (mode === "refresh") {
      setRefreshing(true);
      setErrorMessage(null);
    } else {
      setLoadingInitial(true);
      setErrorMessage(null);
    }

    try {
      const result = await fetchFeedPhotos(targetPage);

      setHasMore(result.hasMore);
      setPage(result.nextPage);
      setItems((current) => {
        if (mode === "append") {
          return dedupePhotos([...current, ...result.items]);
        }

        return result.items;
      });
    } catch (error) {
      console.error("[feed] failed to fetch photos", error);
      setErrorMessage("Não foi possível carregar o feed agora.");
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPage(0, "initial");
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(0, "refresh");
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingInitial || loadingMore || refreshing || !hasMore) {
      return;
    }

    await loadPage(page, "append");
  }, [hasMore, loadPage, loadingInitial, loadingMore, page, refreshing]);

  const normalizedSearchTerm = useMemo(() => normalizeSearchTerm(searchTerm), [searchTerm]);

  const filteredItems = useMemo(
    () => items.filter((photo) => matchesSearch(photo, normalizedSearchTerm)),
    [items, normalizedSearchTerm],
  );

  return {
    items,
    filteredItems,
    searchTerm,
    setSearchTerm,
    loadingInitial,
    loadingMore,
    refreshing,
    hasMore,
    errorMessage,
    refresh,
    loadMore,
  };
}
