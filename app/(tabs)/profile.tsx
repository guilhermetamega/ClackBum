import ProfileActionSheet from "@/components/profile/ProfileActionSheet";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePhotoCard from "@/components/profile/ProfilePhotoCard";
import ProfilePurchaseCard from "@/components/profile/ProfilePurchaseCard";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileToast from "@/components/profile/ProfileToast";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProfileController } from "@/hooks/useProfileController";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";

const DESKTOP_BREAKPOINT = 980;

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const contentWidth = isDesktop ? Math.min(width - 32, 1120) : width - 20;
  const cardWidth = isDesktop
    ? Math.min((contentWidth - 16) / 2, 540)
    : Math.max(Math.min(width - 24, 520), 280);

  const {
    activeTab,
    setActiveTab,
    photos,
    purchases,
    loading,
    refreshing,
    reloadContent,
    balance,
    balancePending,
    balanceLoading,
    loadBalance,
    menuVisible,
    openMenu,
    closeMenu,
    toast,
    handleShare,
    handleUpdateVisibility,
    handleDelete,
    handleDownload,
    handleWithdrawPress,
  } = useProfileController();

  const data = activeTab === "own" ? photos : purchases;
  const backgroundColor = isDark ? "#121212" : "#F5F5F5";

  const header = useMemo(
    () => (
      <View style={{ width: isDesktop ? contentWidth : cardWidth }}>
        <ProfileHeader
          balance={balance}
          balancePending={balancePending}
          balanceLoading={balanceLoading}
          isDark={isDark}
          onRefreshBalance={() => void loadBalance()}
          onOpenSettings={() => router.push("/settings")}
          onWithdrawPress={handleWithdrawPress}
        />

        <ProfileTabs
          activeTab={activeTab}
          isDark={isDark}
          onChange={setActiveTab}
        />
      </View>
    ),
    [
      activeTab,
      balance,
      balanceLoading,
      balancePending,
      cardWidth,
      contentWidth,
      handleWithdrawPress,
      isDark,
      isDesktop,
      loadBalance,
      router,
      setActiveTab,
    ],
  );

  if (loading && data.length === 0) {
    return <ProfileSkeleton isDark={isDark} />;
  }

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <FlatList
        data={data}
        key={isDesktop ? "desktop" : "mobile"}
        numColumns={isDesktop ? 2 : 1}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={() => void reloadContent()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        columnWrapperStyle={isDesktop ? styles.columnWrapper : undefined}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardSlot,
              {
                width: cardWidth,
                maxWidth: cardWidth,
              },
            ]}
          >
            {activeTab === "own" ? (
              <ProfilePhotoCard
                item={item}
                isDark={isDark}
                onShare={handleShare}
                onOpenMenu={openMenu}
              />
            ) : (
              <ProfilePurchaseCard
                item={item}
                isDark={isDark}
                onDownload={handleDownload}
              />
            )}
          </View>
        )}
      />

      <ProfileActionSheet
        visible={menuVisible}
        isDark={isDark}
        onClose={closeMenu}
        onMakePublic={() => void handleUpdateVisibility("public")}
        onMakeUnlisted={() => void handleUpdateVisibility("unlisted")}
        onMakePrivate={() => void handleUpdateVisibility("private")}
        onDelete={() => void handleDelete()}
      />

      <ProfileToast
        visible={toast.visible}
        message={toast.message}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: "center",
  },
  columnWrapper: {
    justifyContent: "center",
    gap: 16,
  },
  cardSlot: {
    paddingVertical: 8,
  },
});
