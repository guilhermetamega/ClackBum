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

  async function handlePublish() {
    if (!title || !price || !imageUri) {
      Alert.alert("Preencha título, preço e escolha uma imagem.");
      return;
    }

    try {
      // 🔐 GARANTE SESSÃO ANTES DE QUALQUER COISA
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert("Erro", "Você precisa estar logado.");
        return;
      }

      await uploadPhoto({
        file: { uri: imageUri }, // 🔥 string pura (URI)
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
