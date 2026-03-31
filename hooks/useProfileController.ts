import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  copyPublicPhotoLink,
  deletePhoto,
  fetchMyPhotos,
  fetchMyPurchases,
  fetchStripeBalance,
  updatePhotoVisibility,
} from "@/services/profile";
import type {
  ProfileCacheState,
  ProfilePhoto,
  ProfileTab,
  ProfileToastState,
  Visibility,
} from "@/types/profile";

const PROFILE_CACHE_TTL = 15 * 60 * 1000;

let profileCache: ProfileCacheState | null = null;

function isCacheValid(cache: ProfileCacheState | null) {
  if (!cache) return false;
  return Date.now() - cache.updatedAt < PROFILE_CACHE_TTL;
}

export function useProfileController() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>("own");
  const [photos, setPhotos] = useState<ProfilePhoto[]>(
    profileCache?.photos ?? [],
  );
  const [purchases, setPurchases] = useState<ProfilePhoto[]>(
    profileCache?.purchases ?? [],
  );
  const [loading, setLoading] = useState(!profileCache);
  const [refreshing, setRefreshing] = useState(false);

  const [balance, setBalance] = useState<number>(profileCache?.balance ?? 0);
  const [balancePending, setBalancePending] = useState<number>(
    profileCache?.balancePending ?? 0,
  );
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<ProfilePhoto | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [toast, setToast] = useState<ProfileToastState>({
    visible: false,
    message: "",
  });

  const hasBootstrappedRef = useRef(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2200);
  }, []);

  const applyCache = useCallback((cache: ProfileCacheState) => {
    setPhotos(cache.photos);
    setPurchases(cache.purchases);
    setBalance(cache.balance);
    setBalancePending(cache.balancePending);
  }, []);

  const loadBalanceOnly = useCallback(async () => {
    try {
      setBalanceLoading(true);
      const result = await fetchStripeBalance();
      setBalance(result.available);
      setBalancePending(result.pending);

      if (profileCache) {
        profileCache = {
          ...profileCache,
          balance: result.available,
          balancePending: result.pending,
          updatedAt: Date.now(),
        };
      }
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const loadContent = useCallback(
    async (options?: { force?: boolean; silent?: boolean }) => {
      const force = options?.force ?? false;
      const silent = options?.silent ?? false;

      const canUseCache = !force && isCacheValid(profileCache);

      if (canUseCache && profileCache) {
        applyCache(profileCache);

        if (!silent) {
          setLoading(false);
          setRefreshing(false);
        }

        return;
      }

      try {
        if (!silent) {
          if (!profileCache) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
        }

        const [myPhotos, myPurchases, balanceData] = await Promise.all([
          fetchMyPhotos(),
          fetchMyPurchases(),
          fetchStripeBalance(),
        ]);

        const nextCache: ProfileCacheState = {
          photos: myPhotos,
          purchases: myPurchases,
          balance: balanceData.available,
          balancePending: balanceData.pending,
          updatedAt: Date.now(),
        };

        profileCache = nextCache;
        applyCache(nextCache);
      } catch (error) {
        console.error("Erro ao carregar profile:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyCache],
  );

  useFocusEffect(
    useCallback(() => {
      if (!hasBootstrappedRef.current) {
        hasBootstrappedRef.current = true;
        void loadContent();
        return;
      }

      if (profileCache) {
        applyCache(profileCache);
        setLoading(false);
      }

      if (!isCacheValid(profileCache)) {
        void loadContent({ silent: true });
      }
    }, [applyCache, loadContent]),
  );

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
    setSelectedPhoto(null);
  }, []);

  const openMenu = useCallback((photo: ProfilePhoto) => {
    setSelectedPhoto(photo);
    setMenuVisible(true);
  }, []);

  const handleShare = useCallback(
    async (photo: ProfilePhoto) => {
      if (photo.visibility === "private") return;

      try {
        const link = await copyPublicPhotoLink(photo.id);

        if (!link) {
          Alert.alert(
            "Atenção",
            "Defina EXPO_PUBLIC_SITE_URL para compartilhar.",
          );
          return;
        }

        await Clipboard.setStringAsync(link);
        showToast("Link copiado");
      } catch (error) {
        console.error("Erro ao copiar link:", error);
        Alert.alert("Erro", "Não foi possível copiar o link.");
      }
    },
    [showToast],
  );

  const handleUpdateVisibility = useCallback(
    async (visibility: Visibility) => {
      if (!selectedPhoto) return;

      try {
        await updatePhotoVisibility(selectedPhoto.id, visibility);

        setPhotos((current) => {
          const next = current.map((item) =>
            item.id === selectedPhoto.id ? { ...item, visibility } : item,
          );

          if (profileCache) {
            profileCache = {
              ...profileCache,
              photos: next,
              updatedAt: Date.now(),
            };
          }

          return next;
        });

        closeMenu();
        showToast("Visibilidade atualizada");
      } catch (error) {
        console.error("Erro ao atualizar visibilidade:", error);
        Alert.alert("Erro", "Não foi possível atualizar a visibilidade.");
      }
    },
    [closeMenu, selectedPhoto, showToast],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedPhoto) return;

    try {
      await deletePhoto(selectedPhoto);

      setPhotos((current) => {
        const next = current.filter((item) => item.id !== selectedPhoto.id);

        if (profileCache) {
          profileCache = {
            ...profileCache,
            photos: next,
            updatedAt: Date.now(),
          };
        }

        return next;
      });

      closeMenu();
      showToast("Foto excluída");
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      Alert.alert("Erro", "Não foi possível excluir a foto.");
    }
  }, [closeMenu, selectedPhoto, showToast]);

  const handleDownload = useCallback(
    (photo: ProfilePhoto) => {
      router.push({
        pathname: "/(hidden)/photo/[id]",
        params: { id: photo.id, download: "true" },
      });
    },
    [router],
  );

  const handleWithdrawPress = useCallback(() => {
    console.log(`Sacar R$ ${balance.toFixed(2)}`);
  }, [balance]);

  return {
    activeTab,
    setActiveTab,
    photos,
    purchases,
    loading,
    refreshing,
    reloadContent: () => loadContent({ force: true }),
    balance,
    balancePending,
    balanceLoading,
    loadBalance: loadBalanceOnly,
    selectedPhoto,
    menuVisible,
    openMenu,
    closeMenu,
    toast,
    handleShare,
    handleUpdateVisibility,
    handleDelete,
    handleDownload,
    handleWithdrawPress,
  };
}
