import { supabase } from "@/lib/supabaseClient";
import type {
  BalanceData,
  ProfilePhoto,
  ProfilePhotoRow,
  ProfilePurchaseRow,
  Visibility,
  VisibilityConfig,
} from "@/types/profile";

export async function getCurrentUserOrThrow() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Você precisa estar logado.");
  }

  return user;
}

export function getVisibilityConfig(visibility: Visibility): VisibilityConfig {
  switch (visibility) {
    case "public":
      return {
        label: "Pública",
        icon: "globe-outline",
        color: "#22C55E",
      };
    case "unlisted":
      return {
        label: "Não listada",
        icon: "link-outline",
        color: "#3B82F6",
      };
    default:
      return {
        label: "Privada",
        icon: "lock-closed-outline",
        color: "#71717A",
      };
  }
}

export async function fetchStripeBalance(): Promise<BalanceData> {
  const userSession = await supabase.auth.getSession();
  const token = userSession.data.session?.access_token;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!token || !supabaseUrl) {
    return {
      available: 0,
      pending: 0,
    };
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/stripe-get-balance`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar o saldo.");
  }

  const data = await response.json();

  return {
    available: data.available ?? 0,
    pending: data.pending ?? 0,
  };
}

async function createOriginalSignedUrl(path: string) {
  if (!path) return "";

  const { data } = await supabase.storage
    .from("photos")
    .createSignedUrl(path, 60 * 5);

  return data?.signedUrl ?? "";
}

export async function fetchMyPhotos(): Promise<ProfilePhoto[]> {
  const user = await getCurrentUserOrThrow();

  const { data, error } = await supabase
    .from("photos")
    .select("id, title, original_path, preview_path, status, visibility")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar suas fotos.");
  }

  const rows = (data ?? []) as ProfilePhotoRow[];

  return Promise.all(
    rows.map(async (photo) => ({
      ...photo,
      imageUrl: await createOriginalSignedUrl(photo.original_path),
    })),
  );
}

export async function fetchMyPurchases(): Promise<ProfilePhoto[]> {
  const user = await getCurrentUserOrThrow();

  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
        photo_id,
        photos (
          id,
          title,
          original_path,
          preview_path
        )
      `,
    )
    .eq("buyer_id", user.id);

  if (error) {
    throw new Error("Não foi possível carregar suas compras.");
  }

  const rows = (data ?? []) as unknown as ProfilePurchaseRow[];

  const validPhotos = rows
    .map((row) => row.photos)
    .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

  return Promise.all(
    validPhotos.map(async (photo) => ({
      ...photo,
      imageUrl: await createOriginalSignedUrl(photo.original_path),
    })),
  );
}

export async function updatePhotoVisibility(
  id: string,
  visibility: Visibility,
): Promise<void> {
  const { error } = await supabase
    .from("photos")
    .update({ visibility })
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível atualizar a visibilidade.");
  }
}

export async function deletePhoto(photo: {
  id: string;
  original_path: string;
  preview_path: string;
}): Promise<void> {
  if (photo.original_path) {
    await supabase.storage.from("photos").remove([photo.original_path]);
  }

  if (photo.preview_path) {
    await supabase.storage.from("photos_public").remove([photo.preview_path]);
  }

  const { error } = await supabase.from("photos").delete().eq("id", photo.id);

  if (error) {
    throw new Error("Não foi possível excluir a foto.");
  }
}

export async function copyPublicPhotoLink(id: string): Promise<string | null> {
  const baseUrl = process.env.EXPO_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/photo/${id}`;
}
