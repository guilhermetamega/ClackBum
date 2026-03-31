import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

export type FeedPhoto = {
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
  sales: number;
};

type SupabasePhotoRow = {
  id: string;
  title: string;
  description: string;
  preview_path: string;
  original_path: string;
  visibility: "public" | "unlisted" | "private";
  user_id: string;
  price: number;
  users:
    | {
        name: string;
        avatar_url: string | null;
      }[]
    | null;
  photo_sales:
    | {
        sales: number | null;
      }[]
    | null;
};

export function useFeedPhotos(searchTerm: string) {
  const [photos, setPhotos] = useState<FeedPhoto[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  const requestIdRef = useRef(0);
  const imageUrlCacheRef = useRef<Record<string, string>>({});
  const resultsCacheRef = useRef<Record<string, FeedPhoto[]>>({});

  const mapRow = useCallback((row: SupabasePhotoRow): FeedPhoto => {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      preview_path: row.preview_path,
      original_path: row.original_path,
      visibility: row.visibility,
      user_id: row.user_id,
      price: row.price,
      users: row.users?.[0] ?? null,
      sales: row.photo_sales?.[0]?.sales ?? 0,
    };
  }, []);

  const buildQuery = useCallback((value: string, from: number, to: number) => {
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

    if (value.length >= 2) {
      const safeValue = value.replace(/,/g, " ");
      query = query.or(
        `title.ilike.%${safeValue}%,description.ilike.%${safeValue}%`,
      );
    }

    return query;
  }, []);

  const fetchFirstPage = useCallback(async () => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const requestId = ++requestIdRef.current;

    if (resultsCacheRef.current[normalizedSearch]) {
      const cached = resultsCacheRef.current[normalizedSearch];
      setPhotos(cached);
      setPage(1);
      setHasMore(cached.length === PAGE_SIZE);
      setLoadingInitial(false);
      setSearching(false);
      return;
    }

    if (loadingInitial && photos.length === 0) {
      setLoadingInitial(true);
    } else {
      setSearching(true);
    }

    const { data, error } = await buildQuery(searchTerm, 0, PAGE_SIZE - 1);

    if (requestId !== requestIdRef.current) return;

    setLoadingInitial(false);
    setSearching(false);

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    const rows = (data ?? []) as unknown as SupabasePhotoRow[];
    const normalizedRows = rows.map(mapRow);

    resultsCacheRef.current[normalizedSearch] = normalizedRows;

    setPhotos(normalizedRows);
    setPage(1);
    setHasMore(normalizedRows.length === PAGE_SIZE);
  }, [buildQuery, loadingInitial, mapRow, photos.length, searchTerm]);

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore || searching || loadingInitial) return;

    setLoadingMore(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await buildQuery(searchTerm, from, to);

    setLoadingMore(false);

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    const rows = (data ?? []) as unknown as SupabasePhotoRow[];
    const normalizedRows = rows.map(mapRow);

    setPhotos((prev) => [...prev, ...normalizedRows]);
    setPage((prev) => prev + 1);
    setHasMore(normalizedRows.length === PAGE_SIZE);
  }, [
    buildQuery,
    hasMore,
    loadingInitial,
    loadingMore,
    mapRow,
    page,
    searchTerm,
    searching,
  ]);

  const getImageUrl = useCallback((path: string) => {
    if (imageUrlCacheRef.current[path]) {
      return imageUrlCacheRef.current[path];
    }

    const publicUrl = supabase.storage.from("photos_public").getPublicUrl(path)
      .data.publicUrl;

    imageUrlCacheRef.current[path] = publicUrl;
    return publicUrl;
  }, []);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  return {
    photos,
    loadingInitial,
    loadingMore,
    searching,
    hasMore,
    fetchMore,
    getImageUrl,
  };
}
