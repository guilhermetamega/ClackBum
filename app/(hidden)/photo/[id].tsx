import PhotoDetailsCTA from "@/components/photo-details/PhotoDetailsCTA";
import PhotoDetailsHero from "@/components/photo-details/PhotoDetailsHero";
import PhotoDetailsInfo from "@/components/photo-details/PhotoDetailsInfo";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePhotoDetailsController } from "@/hooks/usePhotoDetailsController";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export const unstable_settings = {
  ssr: false,
};

const DESKTOP_BREAKPOINT = 980;

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const pageBg = isDark ? "#121212" : "#F5F5F5";
  const contentWidth = isDesktop ? Math.min(width - 40, 1180) : width - 20;

  const {
    photo,
    loading,
    refreshing,
    buying,
    priceLabel,
    actionMode,
    reloadPhoto,
    handleBuy,
    handleDownload,
  } = usePhotoDetailsController(String(id));

  const desktopHeroHeight = Math.max(Math.min(height - 120, 760), 420);
  const mobileHeroHeight = Math.max(Math.min(height * 0.38, 360), 220);
  const maxDescriptionHeight = isDesktop
    ? Math.max(Math.min(height * 0.28, 280), 150)
    : Math.max(Math.min(height * 0.2, 180), 90);

  if (loading && !photo) {
    return (
      <View style={[styles.center, { backgroundColor: pageBg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#EE9734" />
      </View>
    );
  }

  if (!photo) {
    return (
      <View style={[styles.center, { backgroundColor: pageBg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text
          style={[styles.emptyText, { color: isDark ? "#F5F5F5" : "#121212" }]}
        >
          Foto não encontrada
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: pageBg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void reloadPhoto()}
            tintColor="#EE9734"
            colors={["#EE9734"]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {isDesktop ? (
          <View style={[styles.desktopShell, { width: contentWidth }]}>
            <View style={[styles.desktopLeft, { height: desktopHeroHeight }]}>
              <PhotoDetailsHero
                imageUrl={photo.imageUrl}
                isDark={isDark}
                isDesktop
              />
            </View>

            <View style={[styles.desktopRight, { height: desktopHeroHeight }]}>
              <PhotoDetailsInfo
                title={photo.title}
                userName={photo.user_name}
                userAvatarUrl={photo.user_avatar_url}
                tags={photo.tags}
                description={photo.description}
                isDark={isDark}
                maxDescriptionHeight={maxDescriptionHeight}
              />

              <PhotoDetailsCTA
                actionMode={actionMode}
                priceLabel={priceLabel}
                buying={buying}
                isDark={isDark}
                onBuy={() => void handleBuy()}
                onDownload={() => void handleDownload()}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.mobileShell, { width: contentWidth }]}>
            <View style={{ height: mobileHeroHeight }}>
              <PhotoDetailsHero
                imageUrl={photo.imageUrl}
                isDark={isDark}
                isDesktop={false}
              />
            </View>

            <PhotoDetailsInfo
              title={photo.title}
              userName={photo.user_name}
              userAvatarUrl={photo.user_avatar_url}
              tags={photo.tags}
              description={photo.description}
              isDark={isDark}
              maxDescriptionHeight={maxDescriptionHeight}
            />

            <PhotoDetailsCTA
              actionMode={actionMode}
              priceLabel={priceLabel}
              buying={buying}
              isDark={isDark}
              onBuy={() => void handleBuy()}
              onDownload={() => void handleDownload()}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 24,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
  },
  mobileShell: {
    gap: 12,
  },
  desktopShell: {
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
  },
  desktopLeft: {
    flex: 1.08,
  },
  desktopRight: {
    flex: 0.92,
    gap: 14,
    justifyContent: "space-between",
  },
});
