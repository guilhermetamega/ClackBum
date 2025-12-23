import UserActionButton from "@/components/userActionButton";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Visibility = "public" | "private" | "unlisted";

type Photo = {
  id: string;
  title: string;
  original_path: string;
  preview_path: string;
  status: "pending" | "approved" | "rejected";
  visibility: Visibility;
  imageUrl?: string;
};

export default function MyProfile() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  async function loadMyPhotos() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("photos")
      .select("id, title, original_path, preview_path, status, visibility")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const withUrls = await Promise.all(
        data.map(async (photo) => {
          const { data: signed } = await supabase.storage
            .from("photos")
            .createSignedUrl(photo.original_path, 60 * 5);

          return {
            ...photo,
            imageUrl: signed?.signedUrl ?? "",
          };
        })
      );

      setPhotos(withUrls);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadMyPhotos();
    }, [])
  );

  function getVisibilityConfig(visibility: Visibility) {
    switch (visibility) {
      case "public":
        return { label: "PUBLIC", icon: "earth", color: "#2ecc71" };
      case "unlisted":
        return { label: "UNLISTED", icon: "link", color: "#3498db" };
      default:
        return { label: "PRIVATE", icon: "lock-closed", color: "#7f8c8d" };
    }
  }

  function closeMenu() {
    setMenuVisible(false);
    setSelectedPhoto(null);
  }

  async function handleShare(photo: Photo) {
    if (photo.visibility === "private") return;

    const baseUrl = process.env.EXPO_PUBLIC_SITE_URL;

    if (!baseUrl) {
      console.warn("EXPO_PUBLIC_SITE_URL não definida");
      return;
    }

    const publicUrl = `${baseUrl}/photo/${photo.id}`;

    await Clipboard.setStringAsync(publicUrl);

    setToastVisible(true);

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  }

  async function updateVisibility(id: string, visibility: Visibility) {
    await supabase.from("photos").update({ visibility }).eq("id", id);
    closeMenu();
    loadMyPhotos();
  }

  async function handleDelete(photo: Photo) {
    try {
      //1️⃣ Apaga arquivos primeiro (mais seguro)

      if (photo.original_path) {
        const { error } = await supabase.storage
          .from("photos")
          .remove([photo.original_path]);

        if (error) throw error;
      }

      if (photo.preview_path) {
        const { error } = await supabase.storage
          .from("photos_public")
          .remove([photo.preview_path]);

        if (error) throw error;
      }

      // 2️⃣ Agora apaga do banco
      const { error: dbError } = await supabase
        .from("photos")
        .delete()
        .eq("id", photo.id);

      if (dbError) throw dbError;

      // 3️⃣ Atualiza UI
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      closeMenu();
    } catch (err) {
      console.error("Erro real ao excluir:", err);
    }
  }

  function renderItem({ item }: { item: Photo }) {
    const visibility = getVisibilityConfig(item.visibility);

    return (
      <View style={styles.card}>
        {/* TOP ACTIONS */}
        <View style={styles.topActions}>
          <Pressable
            disabled={item.visibility === "private"}
            style={{ opacity: item.visibility === "private" ? 0.4 : 1 }}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => {
              setSelectedPhoto(item);
              setMenuVisible(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* VISIBILITY BADGE */}
        <View
          style={[
            styles.visibilityBadge,
            { backgroundColor: visibility.color },
          ]}
        >
          <Ionicons name={visibility.icon as any} size={12} color="#000" />
          <Text style={styles.visibilityText}>{visibility.label}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/(hidden)/photo/[id]",
              params: { id: item.id },
            })
          }
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.cardFooter}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Meu Perfil <UserActionButton />
      </Text>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* ACTION SHEET */}
      <Modal
        transparent
        visible={menuVisible && !!selectedPhoto}
        animationType="fade"
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View style={styles.sheet}>
            <Pressable
              onPress={() =>
                selectedPhoto && updateVisibility(selectedPhoto.id, "public")
              }
            >
              <Text style={styles.sheetItem}>🌍 Tornar Pública</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                selectedPhoto && updateVisibility(selectedPhoto.id, "unlisted")
              }
            >
              <Text style={styles.sheetItem}>
                🔗 Tornar Não Listada (Acesso Apenas de Pessoas Com o Link)
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                selectedPhoto && updateVisibility(selectedPhoto.id, "private")
              }
            >
              <Text style={styles.sheetItem}>🔒 Tornar Privada</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={() => {
                if (!selectedPhoto) return;
                handleDelete(selectedPhoto);
              }}
            >
              <Text style={[styles.sheetItem, { color: "#e74c3c" }]}>
                🗑 Excluir
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* TOAST */}
      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Link copiado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  header: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFA500",
    marginBottom: 16,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
  },
  image: { width: "100%", height: 220 },
  cardFooter: { padding: 12 },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },

  topActions: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    flexDirection: "row",
    gap: 14,
  },

  visibilityBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  visibilityText: { fontSize: 11, fontWeight: "900", color: "#000" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetItem: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 10,
  },

  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  toastText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
