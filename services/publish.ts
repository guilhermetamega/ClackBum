import { supabase } from "@/lib/supabaseClient";
import type { PublishPayload, StripeStatus } from "@/types/publish";

export function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function normalizePriceInput(value: string): string {
  const cleaned = value.replace(/[^\d,.]/g, "").replace(",", ".");
  const parts = cleaned.split(".");

  if (parts.length <= 1) {
    return cleaned;
  }

  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function parsePriceToNumber(value: string): number {
  const normalized = normalizePriceInput(value);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

export function validatePublishForm(params: {
  title: string;
  price: string;
  imageUri: string | null;
}) {
  if (!params.imageUri) {
    return "Selecione uma imagem.";
  }

  if (!params.title.trim()) {
    return "Informe um título.";
  }

  if (!params.price.trim()) {
    return "Informe um preço.";
  }

  const numericPrice = parsePriceToNumber(params.price);

  if (!numericPrice || numericPrice <= 0) {
    return "Informe um preço válido maior que zero.";
  }

  return null;
}

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

export async function checkStripePublishStatus(): Promise<StripeStatus> {
  const user = await getCurrentUserOrThrow();

  const { data, error } = await supabase
    .from("users")
    .select("stripe_account_id, stripe_charges_enabled")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { blocked: true };
  }

  const blocked = !data.stripe_account_id || !data.stripe_charges_enabled;

  return { blocked };
}

export function buildPublishPayload(values: {
  title: string;
  description: string;
  price: string;
  tagsText: string;
  imageUri: string | null;
}): PublishPayload {
  const imageUri = values.imageUri ?? "";

  return {
    file: { uri: imageUri },
    title: values.title.trim(),
    description: values.description.trim(),
    price: parsePriceToNumber(values.price),
    tags: parseTags(values.tagsText),
    visibility: "private",
  };
}
