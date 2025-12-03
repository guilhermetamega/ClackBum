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
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Erro ao abrir galeria", String(err));
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
      return Alert.alert("Preencha título, preço e escolha uma imagem.");
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return Alert.alert("Você precisa estar logado.");
    }

    try {
      const fetched = await fetch(imageUri);
      const blob = await fetched.blob();

      const contentType = blob.type || "image/jpeg";
      const ext = contentType.split("/")[1] || "jpeg";
      const filePath = `public/${user.id}/${Date.now()}.${ext}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("photos")
        .upload(filePath, blob, {
          contentType,
          upsert: false,
        });

      if (storageError) {
        console.error(storageError);
        setLoading(false);
        return Alert.alert("Erro ao enviar imagem");
      }

      const tagsArray = parseTags(tagsText);

      const { error: insertError } = await supabase.from("photos").insert({
        user_id: user.id,
        title,
        description,
        tags: tagsArray,
        price: Number(price),
        image_url: filePath,
        status: "pending",
      });

      setLoading(false);

      if (insertError) {
        Alert.alert("Erro ao salvar no banco", insertError.message);
        return;
      }

      Alert.alert("Sucesso!", "Foto enviada para moderação.");
      router.replace("/(tabs)");
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Erro", String(err.message || err));
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
        onChangeText={setTitle}
        value={title}
      />

      <TextInput
        placeholder="Descrição"
        placeholderTextColor="#999"
        multiline
        style={[styles.input, { height: 90 }]}
        onChangeText={setDescription}
        value={description}
      />

      <TextInput
        placeholder="Tags (separe por vírgula) — ex: favela, rua, grafite"
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={setTagsText}
        value={tagsText}
      />

      <TextInput
        placeholder="Preço (R$)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={setPrice}
        value={price}
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
