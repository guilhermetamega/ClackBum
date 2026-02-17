import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { supabase } from "@/lib/supabaseClient";

export default function Publish() {
  const router = useRouter();
  const { uploadPhoto, loading } = usePhotoUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [checkingStripe, setCheckingStripe] = useState(true);
  const [stripeBlocked, setStripeBlocked] = useState(false);

  /* =========================
     CHECK STRIPE STATUS
  ========================= */
  useEffect(() => {
    checkStripeStatus();
  }, []);

  async function checkStripeStatus() {
    try {
      setCheckingStripe(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStripeBlocked(true);
        router.replace("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("stripe_account_id, stripe_charges_enabled")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        setStripeBlocked(true);
      } else if (!data.stripe_account_id || !data.stripe_charges_enabled) {
        setStripeBlocked(true);
      } else {
        setStripeBlocked(false); // ✅ desbloqueia automaticamente
      }
    } catch (err) {
      console.error("Stripe check error:", err);
      setStripeBlocked(true);
    } finally {
      setCheckingStripe(false);
    }
  }

  /* =========================
     IMAGE PICKER
  ========================= */
  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Erro", "Falha ao abrir galeria");
    }
  }

  function parseTags(input: string) {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  /* =========================
     PUBLISH
  ========================= */
  async function handlePublish() {
    if (stripeBlocked) return;

    if (!title || !price || !imageUri) {
      Alert.alert("Preencha título, preço e escolha uma imagem.");
      return;
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert("Erro", "Você precisa estar logado.");
        return;
      }

      await uploadPhoto({
        file: { uri: imageUri },
        title,
        description,
        price: Number(price),
        tags: parseTags(tagsText),
        visibility: "private",
      });

      Alert.alert("Sucesso!", "Foto enviada para moderação.");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Publish error:", err);
      Alert.alert("Erro", err.message || "Erro ao publicar foto");
    }
  }

  /* =========================
     LOADING INICIAL
  ========================= */
  if (checkingStripe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Publicar Foto</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePickerText}>Selecionar imagem</Text>
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Título"
          placeholderTextColor="#999"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Descrição"
          placeholderTextColor="#999"
          multiline
          style={[styles.input, { height: 90 }]}
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          placeholder="Tags (separe por vírgula)"
          placeholderTextColor="#999"
          style={styles.input}
          value={tagsText}
          onChangeText={setTagsText}
        />

        <TextInput
          placeholder="Preço (R$)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          style={styles.input}
          value={price}
          onChangeText={setPrice}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handlePublish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 🔒 BLOQUEIO STRIPE */}
      {stripeBlocked && (
        <View style={styles.blockOverlay}>
          <View style={styles.blockModal}>
            <Text style={styles.blockTitle}>Ative seus recebimentos</Text>

            <Text style={styles.blockText}>
              Para publicar fotos é necessário ativar sua conta Stripe e
              habilitar os recebimentos.
            </Text>

            <TouchableOpacity
              style={styles.blockButton}
              onPress={() => router.push("/settings")}
            >
              <Text style={styles.blockButtonText}>Ir para Configurações</Text>
            </TouchableOpacity>

            {/* ✅ BOTÃO DE REFRESH */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={checkStripeStatus}
              disabled={checkingStripe}
            >
              {checkingStripe ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.refreshButtonText}>Atualizar status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFA500",
    marginBottom: 20,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: "#222",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePickerText: { color: "#777" },
  imagePreview: { width: "100%", height: "100%" },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    width: "100%",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: "#333",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#6A0DAD",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  /* 🔒 BLOCK MODAL */
  blockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  blockModal: {
    width: "85%",
    backgroundColor: "#1c1c1c",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  blockTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  blockText: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  blockButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  blockButtonText: {
    fontWeight: "bold",
    color: "#000",
  },

  /* ✅ REFRESH BUTTON */
  refreshButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
  },
  refreshButtonText: {
    fontWeight: "bold",
    color: "#000",
  },
});
