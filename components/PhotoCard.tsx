import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface PhotoUser {
  name?: string | null;
  avatar_url?: string | null;
}

export interface Photo {
  id: string;
  title?: string | null;
  price?: number | null;
  image_url: string;
  users?: PhotoUser | null;
  sales?: number | null;
}

interface PhotoCardProps {
  photo: Photo;
  onPress?: () => void;
}

function PhotoCard({ photo, onPress }: PhotoCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri:
                photo.users?.avatar_url ||
                "https://ui-avatars.com/api/?name=User",
            }}
            style={styles.avatar}
          />

          <View>
            <Text numberOfLines={1} style={styles.title}>
              {photo.title || "Foto sem título"}
            </Text>

            <Text style={styles.author}>
              {photo.users?.name || "Autor desconhecido"}
            </Text>
          </View>
        </View>
      </View>

      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.image_url }} style={styles.image} />

        {/* PRICE */}
        <View style={styles.priceTag}>
          <FontAwesome name="shopping-cart" size={18} color="#000" />
          <Text style={styles.price}>
            R$ {photo.price?.toFixed(2) || "0,00"}
          </Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.salesContainer}>
          <FontAwesome name="shopping-bag" size={18} color="#000" />
          <Text style={styles.sales}>{photo.sales ?? 0} VENDIDAS</Text>
        </View>

        <TouchableOpacity
          onPress={() => console.log("Favoritado")}
          style={styles.favorite}
        >
          <FontAwesome name="heart-o" size={20} color="#F4A236" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    marginVertical: 8,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F5F5F5",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#EE9734",
  },

  title: {
    fontSize: 16,
    fontFamily: "Koulen-Regular",
    color: "#121212",
  },

  author: {
    fontSize: 12,
    color: "#121212",
    fontFamily: "Inter_400Regular",
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 230,
  },

  priceTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EE9734",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  price: {
    fontSize: 16,
    fontFamily: "Koulen-Regular",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F5F5F5",
  },

  salesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sales: {
    fontSize: 14,
    fontFamily: "Koulen-Regular",
    color: "#121212",
  },

  favorite: {
    padding: 6,
  },
});

export default React.memo(PhotoCard);
