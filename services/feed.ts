import { supabase } from "@/lib/supabaseClient";
import type { FeedFetchResult, FeedPhoto, FeedPhotoRow } from "@/types/feed";

export const FEED_PAGE_SIZE = 24;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildSearchableText(row: FeedPhotoRow) {
  return normalizeText(
    [
      row.title ?? "",
      row.description ?? "",
      Array.isArray(row.users)
        ? (row.users[0]?.name ?? "")
        : (row.users?.name ?? ""),
      ...(row.tags ?? []),
    ].join(" "),
  );
}

function resolveUser(users: FeedPhotoRow["users"]): FeedPhoto["users"] {
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

function mapFeedPhoto(row: FeedPhotoRow): FeedPhoto {
  const publicImageUrl = row.preview_path
    ? supabase.storage.from("photos_public").getPublicUrl(row.preview_path).data
        .publicUrl
    : "";

  return {
    id: row.id,
    title: row.title?.trim() || "Foto sem título",
    description: row.description?.trim() || "",
    preview_path: row.preview_path ?? "",
    original_path: row.original_path ?? "",
    visibility: row.visibility,
    user_id: row.user_id,
    price: row.price ?? 0,
    tags: row.tags ?? [],
    sales: resolveSales(row.photo_sales),
    created_at: row.created_at,
    public_image_url: publicImageUrl,
    users: resolveUser(row.users),
    searchableText: buildSearchableText(row),
  };
}

export async function fetchFeedPage(page: number): Promise<FeedFetchResult> {
  const from = page * FEED_PAGE_SIZE;
  const to = from + FEED_PAGE_SIZE - 1;

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
    throw error;
  }

  const items = ((data ?? []) as FeedPhotoRow[]).map(mapFeedPhoto);

  return {
    items,
    hasMore: items.length === FEED_PAGE_SIZE,
    nextPage: page + 1,
  };
}

export function mergeUniquePhotos(
  current: FeedPhoto[],
  incoming: FeedPhoto[],
): FeedPhoto[] {
  const map = new Map<string, FeedPhoto>();

  for (const item of current) {
    map.set(item.id, item);
  }

  for (const item of incoming) {
    map.set(item.id, item);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function filterPhotosLocally(
  items: FeedPhoto[],
  searchText: string,
): FeedPhoto[] {
  const normalizedSearch = normalizeText(searchText);

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) => item.searchableText.includes(normalizedSearch));
}
