import { useStripePayment } from "@/hooks/useStripePayment";
import {
  canUserDownloadPhoto,
  createOriginalDownloadUrl,
  fetchPhotoDetails,
  formatPrice,
  getCurrentUserSafe,
  isPhotoVisibleToUser,
  waitForApprovedPurchase,
} from "@/services/photo-details";
import type {
  PhotoDetails,
  PhotoDetailsCacheEntry,
} from "@/types/photo-details";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

const PHOTO_CACHE_TTL = 10 * 60 * 1000;

type PhotoActionMode = "buy" | "download" | "owner";

const photoDetailsCache = new Map<string, PhotoDetailsCacheEntry>();

function isCacheValid(entry?: PhotoDetailsCacheEntry) {
  if (!entry) return false;
  return Date.now() - entry.updatedAt < PHOTO_CACHE_TTL;
}

export function usePhotoDetailsController(id: string) {
  const router = useRouter();
  const { pay, supported } = useStripePayment();

  const cacheEntry = photoDetailsCache.get(id);

  const [photo, setPhoto] = useState<PhotoDetails | null>(
    cacheEntry?.photo ?? null,
  );
  const [loading, setLoading] = useState(!cacheEntry);
  const [refreshing, setRefreshing] = useState(false);
  const [buying, setBuying] = useState(false);
  const [canDownload, setCanDownload] = useState(
    cacheEntry?.canDownload ?? false,
  );
  const [isOwner, setIsOwner] = useState(cacheEntry?.isOwner ?? false);

  const hasBootstrappedRef = useRef(false);

  const applyEntry = useCallback((entry: PhotoDetailsCacheEntry) => {
    setPhoto(entry.photo);
    setCanDownload(entry.canDownload);
    setIsOwner(entry.isOwner);
  }, []);

  const loadPhoto = useCallback(
    async (options?: { force?: boolean; silent?: boolean }) => {
      const force = options?.force ?? false;
      const silent = options?.silent ?? false;

      const cached = photoDetailsCache.get(id);

      if (!force && isCacheValid(cached)) {
        if (cached) {
          applyEntry(cached);
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (!silent) {
          if (!cached) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
        }

        const user = await getCurrentUserSafe();
        const fetchedPhoto = await fetchPhotoDetails(id);

        if (!fetchedPhoto) {
          setPhoto(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        const canSee = isPhotoVisibleToUser({
          visibility: fetchedPhoto.visibility,
          currentUserId: user?.id ?? null,
          ownerId: fetchedPhoto.user_id,
        });

        if (!canSee) {
          router.replace("/");
          return;
        }

        const access = await canUserDownloadPhoto({
          userId: user?.id ?? null,
          photoId: fetchedPhoto.id,
          photoOwnerId: fetchedPhoto.user_id,
        });

        const nextEntry: PhotoDetailsCacheEntry = {
          photo: fetchedPhoto,
          canDownload: access.canDownload,
          isOwner: access.isOwner,
          updatedAt: Date.now(),
        };

        photoDetailsCache.set(id, nextEntry);
        applyEntry(nextEntry);
      } catch (error) {
        console.error("Erro ao carregar foto:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyEntry, id, router],
  );

  useFocusEffect(
    useCallback(() => {
      const cached = photoDetailsCache.get(id);

      if (!hasBootstrappedRef.current) {
        hasBootstrappedRef.current = true;
        void loadPhoto();
        return;
      }

      if (cached) {
        applyEntry(cached);
        setLoading(false);
      }

      if (!isCacheValid(cached)) {
        void loadPhoto({ silent: true });
      }
    }, [applyEntry, id, loadPhoto]),
  );

  const handleBuy = useCallback(async () => {
    if (!photo) return;

    const user = await getCurrentUserSafe();

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
        "Pagamentos não estão disponíveis nesta plataforma no momento.",
      );
      return;
    }

    try {
      setBuying(true);

      const result = await pay(photo.id);

      if (result?.canceled) {
        return;
      }

      if (result?.success) {
        const approved = await waitForApprovedPurchase({
          buyerId: user.id,
          photoId: photo.id,
        });

        if (approved) {
          setCanDownload(true);

          const existing = photoDetailsCache.get(id);
          if (existing) {
            photoDetailsCache.set(id, {
              ...existing,
              canDownload: true,
              updatedAt: Date.now(),
            });
          }

          Alert.alert("Pagamento aprovado", "Sua compra foi confirmada.");
        } else {
          Alert.alert(
            "Pagamento em processamento",
            "O pagamento foi iniciado. Aguarde alguns instantes para a liberação.",
          );
        }
      }
    } catch (error: any) {
      Alert.alert(
        "Erro no pagamento",
        error?.message || "Falha ao iniciar pagamento.",
      );
    } finally {
      setBuying(false);
    }
  }, [id, pay, photo, router, supported]);

  const handleDownload = useCallback(async () => {
    if (!photo) return;

    try {
      const signedUrl = await createOriginalDownloadUrl(photo.original_path);

      if (!signedUrl) {
        Alert.alert("Erro", "Não foi possível gerar o download.");
        return;
      }

      const safeTitle = photo.title
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const filename = `${safeTitle || "foto"}-${photo.id}.jpg`;

      if (Platform.OS === "web") {
        const response = await fetch(signedUrl);

        if (!response.ok) {
          throw new Error("Falha ao baixar arquivo.");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(objectUrl);
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(signedUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error("Falha ao baixar arquivo.");
      }

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          "Download concluído",
          "O arquivo foi salvo temporariamente no dispositivo.",
        );
        return;
      }

      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Salvar ou compartilhar imagem",
        UTI: "public.jpeg",
      });
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      Alert.alert("Erro", "Não foi possível baixar a imagem.");
    }
  }, [photo]);

  const priceLabel = useMemo(
    () => (photo ? formatPrice(photo.price) : formatPrice(0)),
    [photo],
  );

  const actionMode = useMemo<PhotoActionMode>(() => {
    if (canDownload) return "download";
    if (isOwner) return "owner";
    return "buy";
  }, [canDownload, isOwner]);

  return {
    photo,
    loading,
    refreshing,
    buying,
    canDownload,
    isOwner,
    priceLabel,
    actionMode,
    isWeb: Platform.OS === "web",
    reloadPhoto: () => loadPhoto({ force: true }),
    handleBuy,
    handleDownload,
  };
}
