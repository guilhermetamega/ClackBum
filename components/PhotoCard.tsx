import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface PhotoUser {
  name?: string | null;
}

export interface Photo {
  id: string;
  title?: string | null;
  price?: number | null;
  image_url: string;
  users?: PhotoUser | null;
}

interface PhotoCardProps {
  photo: Photo;
  onPress?: () => void;
}

export default function PhotoCard({ photo, onPress }: PhotoCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: photo.image_url }}
        style={{ width: "100%", height: 200, borderRadius: 8 }}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {photo.title || "Foto sem título"}
        </Text>

        <Text style={styles.price}>R$ {photo.price?.toFixed(2) || "0,00"}</Text>

        <Text style={styles.author}>
          Por: {photo.users?.name || "Autor desconhecido"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  author: {
    fontSize: 13,
    color: "#666",
  },
});
