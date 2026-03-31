import { supabase } from "@/lib/supabaseClient";
import type {
  PhotoDetails,
  PhotoDetailsRow,
  PhotoVisibility,
} from "@/types/photo-details";

export async function getCurrentUserSafe() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

function resolveUser(
  users: PhotoDetailsRow["users"],
): { name: string | null; avatar_url: string | null } | null {
  if (Array.isArray(users)) {
    return users[0] ?? null;
  }

  return users ?? null;
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function normalizeTags(tags: string[] | null | undefined) {
  return (tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

export async function fetchPhotoDetails(
  id: string,
): Promise<PhotoDetails | null> {
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
        users (
          name,
          avatar_url
        )
      `,
    )
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as PhotoDetailsRow;
  const user = resolveUser(row.users);

  const imageUrl = supabase.storage
    .from("photos_public")
    .getPublicUrl(row.preview_path).data.publicUrl;

  return {
    id: row.id,
    title: row.title?.trim() || "Foto sem título",
    description: row.description?.trim() || "",
    preview_path: row.preview_path,
    original_path: row.original_path,
    visibility: row.visibility,
    user_id: row.user_id,
    price: row.price ?? 0,
    tags: normalizeTags(row.tags),
    user_name: user?.name ?? null,
    user_avatar_url: user?.avatar_url ?? null,
    imageUrl,
  };
}

export async function canUserDownloadPhoto(params: {
  userId: string | null;
  photoId: string;
  photoOwnerId: string;
}) {
  if (!params.userId) {
    return {
      canDownload: false,
      isOwner: false,
    };
  }

  if (params.userId === params.photoOwnerId) {
    return {
      canDownload: true,
      isOwner: true,
    };
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("buyer_id", params.userId)
    .eq("photo_id", params.photoId)
    .eq("status", "approved")
    .maybeSingle();

  return {
    canDownload: Boolean(purchase),
    isOwner: false,
  };
}

export async function createOriginalDownloadUrl(originalPath: string) {
  const { data } = await supabase.storage
    .from("photos")
    .createSignedUrl(originalPath, 60 * 5);

  return data?.signedUrl ?? null;
}

export async function waitForApprovedPurchase(params: {
  buyerId: string;
  photoId: string;
  attempts?: number;
  intervalMs?: number;
}) {
  const maxAttempts = params.attempts ?? 6;
  const intervalMs = params.intervalMs ?? 1200;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", params.buyerId)
      .eq("photo_id", params.photoId)
      .eq("status", "approved")
      .maybeSingle();

    if (data) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

export function isPhotoVisibleToUser(params: {
  visibility: PhotoVisibility;
  currentUserId: string | null;
  ownerId: string;
}) {
  if (params.visibility !== "private") {
    return true;
  }

  return params.currentUserId === params.ownerId;
}
