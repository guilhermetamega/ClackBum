import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

export default function Publish() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Erro", "Falha ao abrir galeria");
    }
  }

  function parseTags(input: string) {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function uploadPhoto() {
    if (!title || !price || !imageUri) {
      Alert.alert("Preencha título, preço e escolha uma imagem.");
      return;
    }

    setLoading(true);

    try {
      // AUTH
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Você precisa estar logado.");
        return;
      }

      const timestamp = Date.now();
      const basePath = `${user.id}/${timestamp}`;

      // ======================
      // ORIGINAL (PRIVADO)
      // ======================
      const originalBlob = await fetch(imageUri).then((r) => r.blob());
      const contentType = originalBlob.type || "image/jpeg";
      const ext = contentType.split("/")[1] || "jpg";
      const originalPath = `${basePath}.${ext}`;

      const { error: originalError } = await supabase.storage
        .from("photos")
        .upload(originalPath, originalBlob, {
          contentType,
          upsert: false,
        });

      if (originalError) throw originalError;

      // ======================
      // PREVIEW (PÚBLICO)
      // ======================
      const previewResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const previewBlob = await fetch(previewResult.uri).then((r) => r.blob());
      const previewPath = `${basePath}_preview.jpg`;

      const { error: previewError } = await supabase.storage
        .from("photos_public")
        .upload(previewPath, previewBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (previewError) throw previewError;

      // ======================
      // DATABASE
      // ======================
      const tagsArray = parseTags(tagsText);

      const { error: insertError } = await supabase.from("photos").insert({
        user_id: user.id,
        title,
        description,
        tags: tagsArray,
        price: Number(price),
        original_path: originalPath,
        preview_path: previewPath,
        status: "pending",
        visibility: "private",
      });

      if (insertError) throw insertError;

      Alert.alert("Sucesso!", "Foto enviada para moderação.");
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Erro", err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
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
        onPress={uploadPhoto}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    flexGrow: 1,
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
  imagePickerText: {
    color: "#777",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
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
});
