import type { FeedPhoto } from "@/types/feed";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  photo: FeedPhoto;
  onPress?: () => void;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function PhotoCard({ photo, onPress }: Props) {
  const fallbackAvatar =
    "https://ui-avatars.com/api/?background=EE9734&color=121212&name=" +
    encodeURIComponent(photo.users?.name || "ClackBum");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <View style={styles.authorBlock}>
          <Image
            source={{ uri: photo.users?.avatar_url || fallbackAvatar }}
            style={styles.avatar}
          />

          <View style={styles.authorTextGroup}>
            <Text numberOfLines={1} style={styles.title}>
              {photo.title}
            </Text>

            <Text numberOfLines={1} style={styles.author}>
              {photo.users?.name || "Autor desconhecido"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.imageWrap}>
        {photo.public_image_url ? (
          <Image
            source={{ uri: photo.public_image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageFallback} />
        )}

        <View style={styles.pricePill}>
          <ShoppingCart size={18} color="#121212" strokeWidth={2.2} />
          <Text style={styles.priceText}>{formatPrice(photo.price)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.salesWrap}>
          <ShoppingBag size={18} color="#111111" strokeWidth={2.2} />
          <Text style={styles.salesText}>
            {photo.sales} vendida{photo.sales === 1 ? "" : "s"}
          </Text>
        </View>

        <Heart size={21} color="#EE9734" strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#E9E9E9",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.97,
    transform: [{ scale: 0.994 }],
  },
  header: {
    minHeight: 66,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E9E9E9",
  },
  authorBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EE9734",
    backgroundColor: "#111111",
  },
  authorTextGroup: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  title: {
    color: "#111111",
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  author: {
    color: "#111111",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    opacity: 0.92,
  },
  menuWrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
  },
  menuDots: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    lineHeight: 18,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1.1,
    position: "relative",
    backgroundColor: "#474747",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    backgroundColor: "#474747",
  },
  pricePill: {
    position: "absolute",
    left: 16,
    bottom: 14,
    height: 38,
    borderRadius: 16,
    backgroundColor: "#EE9734",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  priceText: {
    color: "#121212",
    fontSize: 15,
    lineHeight: 16,
    fontWeight: "800",
  },
  footer: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E9E9E9",
  },
  salesWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  salesText: {
    color: "#111111",
    fontSize: 13,
    lineHeight: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});

export default React.memo(PhotoCard);
