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
  visibility?: Visibility;
  imageUrl?: string;
};

export default function MyProfile() {
  const router = useRouter();

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

  const [activeTab, setActiveTab] = useState<"own" | "purchases">("own");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [purchases, setPurchases] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState<number | null>(null);
  const [balancePending, setBalancePending] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =========================
     LOAD BALANCE (STRIPE)
  ========================= */
  async function loadBalance() {
    try {
      setBalanceLoading(true);

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/stripe-get-balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("💰 Balance:", data);

      setBalance(data.available ?? 0);
      setBalancePending(data.pending ?? 0);
    } catch (err) {
      console.error("Erro ao carregar saldo", err);
    } finally {
      setBalanceLoading(false);
    }
  }

  /* =========================
     LOAD MINHAS FOTOS
  ========================= */
  async function loadMyPhotos() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("photos")
      .select("id, title, original_path, preview_path, status, visibility")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) return;

    const withUrls = await Promise.all(
      data.map(async (photo) => {
        const { data: signed } = await supabase.storage
          .from("photos")
          .createSignedUrl(photo.original_path, 60 * 5);

        return { ...photo, imageUrl: signed?.signedUrl ?? "" };
      })
    );

    setPhotos(withUrls);
  }

  /* =========================
     LOAD COMPRAS
  ========================= */
  async function loadPurchases() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
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
      `
      )
      .eq("buyer_id", user.id);

    if (!data) return;

    const formatted = await Promise.all(
      data.map(async (row: any) => {
        const photo = row.photos;

        const { data: signed } = await supabase.storage
          .from("photos")
          .createSignedUrl(photo.original_path, 60 * 5);

        return {
          ...photo,
          imageUrl: signed?.signedUrl ?? "",
        };
      })
    );

    setPurchases(formatted);
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      Promise.all([loadMyPhotos(), loadPurchases(), loadBalance()]).finally(
        () => setLoading(false)
      );
    }, [])
  );

  /* =========================
     HELPERS
  ========================= */
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
    if (!baseUrl) return;

    await Clipboard.setStringAsync(`${baseUrl}/photo/${photo.id}`);

    setToastVisible(true);
    toastTimeout.current && clearTimeout(toastTimeout.current);

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
    if (photo.original_path) {
      await supabase.storage.from("photos").remove([photo.original_path]);
    }
    if (photo.preview_path) {
      await supabase.storage.from("photos_public").remove([photo.preview_path]);
    }

    await supabase.from("photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    closeMenu();
  }

  async function handleDownload(photo: Photo) {
    router.push({
      pathname: "/(hidden)/photo/[id]",
      params: { id: photo.id, download: "true" },
    });
  }

  /* =========================
     RENDER
  ========================= */
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={{ width: 32 }} />

        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Carteira</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* DISPONÍVEL */}
            <View style={{ alignItems: "center" }}>
              <Text style={styles.balanceSubLabel}>Disponível</Text>
              <Text style={styles.balanceValue}>
                {balance !== null ? `R$ ${balance.toFixed(2)}` : "--"}
              </Text>
            </View>

            {/* PENDENTE */}
            <View style={{ alignItems: "center" }}>
              <Text style={styles.balanceSubLabel}>Pendente</Text>
              <Text style={styles.balancePending}>
                {balancePending !== null
                  ? `R$ ${balancePending.toFixed(2)}`
                  : "--"}
              </Text>
            </View>

            {/* REFRESH */}
            <Pressable onPress={loadBalance} disabled={balanceLoading}>
              {balanceLoading ? (
                <ActivityIndicator size="small" color="#FFA500" />
              ) : (
                <Ionicons name="refresh" size={20} color="#FFA500" />
              )}
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={26} color="#FFA500" />
        </Pressable>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setActiveTab("own")}
          style={[styles.tab, activeTab === "own" && styles.tabActive]}
        >
          <Text style={styles.tabText}>Minhas Fotos</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("purchases")}
          style={[styles.tab, activeTab === "purchases" && styles.tabActive]}
        >
          <Text style={styles.tabText}>Compras</Text>
        </Pressable>
      </View>

      <FlatList
        data={activeTab === "own" ? photos : purchases}
        keyExtractor={(item) => item.id}
        renderItem={
          activeTab === "own"
            ? ({ item }) => {
                const visibility = getVisibilityConfig(item.visibility!);
                return (
                  <View style={styles.card}>
                    <View style={styles.topActions}>
                      <Pressable
                        disabled={item.visibility === "private"}
                        style={{
                          opacity: item.visibility === "private" ? 0.4 : 1,
                        }}
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
                        <Ionicons
                          name="ellipsis-vertical"
                          size={20}
                          color="#fff"
                        />
                      </Pressable>
                    </View>

                    <View
                      style={[
                        styles.visibilityBadge,
                        { backgroundColor: visibility.color },
                      ]}
                    >
                      <Ionicons
                        name={visibility.icon as any}
                        size={12}
                        color="#000"
                      />
                      <Text style={styles.visibilityText}>
                        {visibility.label}
                      </Text>
                    </View>

                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.image}
                    />

                    <View style={styles.cardFooter}>
                      <Text style={styles.title}>{item.title}</Text>
                    </View>
                  </View>
                );
              }
            : ({ item }) => (
                <View style={styles.card}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  <View style={styles.cardFooter}>
                    <Text style={styles.title}>{item.title}</Text>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownload(item)}
                    >
                      <Ionicons name="download" size={18} color="#000" />
                      <Text style={styles.downloadText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ACTION SHEET */}
      <Modal transparent visible={menuVisible} animationType="fade">
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
              <Text style={styles.sheetItem}>🔗 Tornar Não Listada</Text>
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
              onPress={() => selectedPhoto && handleDelete(selectedPhoto)}
            >
              <Text style={[styles.sheetItem, { color: "#e74c3c" }]}>
                🗑 Excluir
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Link copiado</Text>
        </View>
      )}
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  balanceBox: { alignItems: "center" },
  balanceLabel: { color: "#aaa", fontSize: 13, fontWeight: "700" },
  balanceValue: { color: "#FFA500", fontSize: 28, fontWeight: "900" },

  balanceSubLabel: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "700",
  },

  balancePending: {
    color: "#f1c40f", // amarelo = aguardando liberação
    fontSize: 22,
    fontWeight: "800",
  },

  tabs: { flexDirection: "row", marginBottom: 16, gap: 10 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#FFA500" },
  tabText: { fontWeight: "900", color: "#000" },

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

  downloadBtn: {
    marginTop: 10,
    backgroundColor: "#FFA500",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  downloadText: { fontWeight: "900", color: "#000" },

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
  toastText: { color: "#fff", fontWeight: "900", fontSize: 14 },
});
