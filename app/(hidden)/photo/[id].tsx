import { useStripePayment } from "@/hooks/useStripePayment";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabaseClient";

export const unstable_settings = {
  ssr: false,
};

type Photo = {
  id: string;
  title: string;
  description: string;
  preview_path: string;
  original_path: string;
  visibility: "public" | "unlisted" | "private";
  user_id: string;
  price: number;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { pay, supported } = useStripePayment();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  async function fetchPhoto() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("photos")
      .select(
        "id, title, description, preview_path, original_path, visibility, user_id, price, status",
      )
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    if (data.visibility === "private" && (!user || user.id !== data.user_id)) {
      router.replace("/");
      return;
    }

    setPhoto(data);

    if (user) {
      if (user.id === data.user_id) {
        setIsOwner(true);
        setCanDownload(true);
      } else {
        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("buyer_id", user.id)
          .eq("photo_id", data.id)
          .eq("status", "approved")
          .maybeSingle();

        if (purchase) setCanDownload(true);
      }
    }

    setLoading(false);
  }

  async function handleBuy() {
    console.log("🟢 Chamando handleBuy");
    console.log("Platform:", Platform.OS);
    console.log("Stripe supported:", supported);

    if (!photo) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push({
        pathname: "/auth",
        params: { redirectTo: `/photo/${photo.id}` },
      });
      return;
    }

    if (!supported) {
      Alert.alert(
        "Pagamento indisponível",
        "Pagamentos não estão disponíveis nesta plataforma, tente novamente.",
      );
      return;
    }

    try {
      setBuying(true);

      const result = await pay(photo.id);

      if (result?.canceled) {
        // 👇 Apenas ignora, sem alert
        return;
      }

      // 👇 Se quiser, pode mostrar sucesso aqui
      console.log("Pagamento concluído");
    } catch (err: any) {
      Alert.alert(
        "Erro no pagamento",
        err?.message || "Falha ao iniciar pagamento",
      );
    } finally {
      setBuying(false);
    }
  }

  async function handleDownload() {
    if (!photo) return;

    const { data } = await supabase.storage
      .from("photos")
      .createSignedUrl(photo.original_path, 60 * 5);

    if (!data?.signedUrl) {
      Alert.alert("Erro", "Não foi possível gerar o download");
      return;
    }

    if (typeof window !== "undefined") {
      window.open(data.signedUrl, "_blank");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  if (!photo) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Foto não encontrada</Text>
      </View>
    );
  }

  const imageUrl = supabase.storage
    .from("photos_public")
    .getPublicUrl(photo.preview_path).data.publicUrl;

  return (
    <>
      {/* HEADER SIMPLES: APENAS NAVEGAÇÃO */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: photo.title,
          headerBackTitleVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>{photo.title}</Text>

          {photo.description ? (
            <Text style={styles.description}>{photo.description}</Text>
          ) : null}

          {photo.visibility === "unlisted" && (
            <Text style={styles.unlisted}>🔗 Foto com link privado</Text>
          )}

          {/* BOTÕES DE AÇÃO NO CORPO DA TELA */}
          {!isOwner && !canDownload && (
            <TouchableOpacity
              disabled={buying}
              onPress={handleBuy}
              style={styles.buyMainButton}
            >
              <Text style={styles.buyMainText}>
                {buying
                  ? "Processando..."
                  : `Comprar por ${formatPrice(photo.price)}`}
              </Text>
            </TouchableOpacity>
          )}

          {canDownload && (
            <TouchableOpacity
              onPress={handleDownload}
              style={styles.downloadMainButton}
            >
              <Text style={styles.downloadMainText}>Download</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },

  image: {
    width: "100%",
    height: 360,
  },

  content: {
    padding: 16,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },

  description: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 20,
  },

  unlisted: {
    marginTop: 12,
    color: "#f1c40f",
    fontWeight: "700",
  },

  backText: {
    color: "#FFA500",
    fontWeight: "900",
    marginLeft: 12,
  },

  buyMainButton: {
    marginTop: 20,
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buyMainText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 16,
  },

  downloadMainButton: {
    marginTop: 20,
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  downloadMainText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 16,
  },
});
