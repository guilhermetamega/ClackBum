import {
  fetchFeedPage,
  filterPhotosLocally,
  mergeUniquePhotos,
} from "@/services/feed";
import type { FeedPhoto, FeedToast } from "@/types/feed";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseFeedControllerParams = {
  payment?: string;
  onPaymentHandled?: () => void;
};

export function useFeedController({
  payment,
  onPaymentHandled,
}: UseFeedControllerParams) {
  const [allPhotos, setAllPhotos] = useState<FeedPhoto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState<FeedToast | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPage = useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      if (!reset && (loadingMore || !hasMore)) {
        return;
      }

      if (reset) {
        setRefreshing(true);
      } else if (page === 0 && allPhotos.length === 0) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const currentPage = reset ? 0 : page;
        const result = await fetchFeedPage(currentPage);

        if (!mountedRef.current) {
          return;
        }

        setAllPhotos((current) =>
          reset ? result.items : mergeUniquePhotos(current, result.items),
        );
        setPage(result.nextPage);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Erro ao carregar feed:", error);

        if (!mountedRef.current) {
          return;
        }

        setToast({
          message: "Não foi possível carregar o feed agora.",
          type: "error",
        });
      } finally {
        if (!mountedRef.current) {
          return;
        }

        setLoadingInitial(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [allPhotos.length, hasMore, loadingMore, page],
  );

  useEffect(() => {
    void loadPage({ reset: true });
  }, [loadPage]);

  useEffect(() => {
    if (!payment) {
      return;
    }

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

    const timeout = setTimeout(() => {
      setToast(null);
      onPaymentHandled?.();
    }, 3200);

    return () => clearTimeout(timeout);
  }, [onPaymentHandled, payment]);

  const filteredPhotos = useMemo(
    () => filterPhotosLocally(allPhotos, searchText),
    [allPhotos, searchText],
  );

  const clearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  const refreshFeed = useCallback(() => {
    void loadPage({ reset: true });
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loadingInitial || loadingMore || !hasMore) {
      return;
    }

    void loadPage();
  }, [hasMore, loadPage, loadingInitial, loadingMore]);

  return {
    allPhotos,
    filteredPhotos,
    loadingInitial,
    loadingMore,
    refreshing,
    hasMore,
    searchText,
    setSearchText,
    clearSearch,
    refreshFeed,
    loadMore,
    toast,
    setToast,
  };
}
