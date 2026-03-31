import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import {
  buildPublishPayload,
  checkStripePublishStatus,
  getCurrentUserOrThrow,
  normalizePriceInput,
  validatePublishForm,
} from "@/services/publish";

export function usePublishController() {
  const router = useRouter();
  const { uploadPhoto, loading: uploading } = usePhotoUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [checkingStripe, setCheckingStripe] = useState(true);
  const [stripeBlocked, setStripeBlocked] = useState(false);
  const [refreshingStripe, setRefreshingStripe] = useState(false);

  const formValues = useMemo(
    () => ({
      title,
      description,
      price,
      tagsText,
      imageUri,
    }),
    [description, imageUri, price, tagsText, title],
  );

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setPrice("");
    setTagsText("");
    setImageUri(null);
  }, []);

  const checkStripeStatus = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      try {
        if (silent) {
          setRefreshingStripe(true);
        } else {
          setCheckingStripe(true);
        }

        await getCurrentUserOrThrow();

        const result = await checkStripePublishStatus();
        setStripeBlocked(result.blocked);
      } catch (error) {
        console.error("Stripe check error:", error);
        setStripeBlocked(true);

        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("logado")
        ) {
          router.replace("/auth");
        }
      } finally {
        setCheckingStripe(false);
        setRefreshingStripe(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void checkStripeStatus();
  }, [checkStripeStatus]);

  const pickImage = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Permita acesso à galeria para selecionar uma imagem.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        aspect: [4, 5],
      });

      if (!result.canceled) {
        setImageUri(result.assets[0]?.uri ?? null);
      }
    } catch {
      Alert.alert("Erro", "Falha ao abrir a galeria.");
    }
  }, []);

  const handleChangePrice = useCallback((value: string) => {
    setPrice(normalizePriceInput(value));
  }, []);

  const handlePublish = useCallback(async () => {
    if (stripeBlocked) {
      return;
    }

    const validationError = validatePublishForm({
      title,
      price,
      imageUri,
    });

    if (validationError) {
      Alert.alert("Atenção", validationError);
      return;
    }

    try {
      await getCurrentUserOrThrow();

      const payload = buildPublishPayload({
        title,
        description,
        price,
        tagsText,
        imageUri,
      });

      await uploadPhoto(payload);

      Alert.alert("Sucesso", "Foto enviada para moderação.");
      resetForm();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Publish error:", error);

      const message =
        error instanceof Error ? error.message : "Erro ao publicar foto.";

      Alert.alert("Erro", message);
    }
  }, [
    description,
    imageUri,
    price,
    resetForm,
    router,
    stripeBlocked,
    tagsText,
    title,
    uploadPhoto,
  ]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    price,
    setPrice: handleChangePrice,
    tagsText,
    setTagsText,
    imageUri,
    checkingStripe,
    stripeBlocked,
    refreshingStripe,
    uploading,
    pickImage,
    handlePublish,
    checkStripeStatus,
    formValues,
  };
}
