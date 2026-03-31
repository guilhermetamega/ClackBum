import FeedEmptyState from "@/components/feed/FeedEmptyState";
import FeedSkeletonCard from "@/components/feed/FeedSkeletonCard";
import PhotoCard from "@/components/PhotoCard";
import type { FeedPhoto } from "@/types/feed";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Props = {
  data: FeedPhoto[];
  loadingInitial: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  hasMore: boolean;
  hasQuery: boolean;
  contentWidth: number;
  topInset: number;
  onResetSearch: () => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onPressPhoto: (item: FeedPhoto) => void;
};

const DESKTOP_BREAKPOINT = 980;

export default function FeedList({
  data,
  loadingInitial,
  loadingMore,
  refreshing,
  hasMore,
  hasQuery,
  contentWidth,
  topInset,
  onResetSearch,
  onRefresh,
  onEndReached,
  onPressPhoto,
}: Props) {
  const { width } = useWindowDimensions();

  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const numColumns = isDesktop ? 2 : 1;

  const mobileCardWidth = Math.max(Math.min(width - 24, 520), 280);
  const desktopCardWidth = Math.min((contentWidth - 16) / 2, 540);
  const cardWidth = isDesktop ? desktopCardWidth : mobileCardWidth;

  const footer = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#EE9734" />
        </View>
      );
    }

    if (!hasMore && data.length > 0) {
      return (
        <View style={styles.footerLoading}>
          <Text style={styles.footerText}>Você chegou ao fim do feed.</Text>
        </View>
      );
    }

    return <View style={styles.footerSpacing} />;
  }, [data.length, hasMore, loadingMore]);

  if (loadingInitial) {
    return (
      <View
        style={[
          styles.skeletonWrap,
          {
            width: isDesktop ? contentWidth : mobileCardWidth,
            paddingTop: topInset,
          },
        ]}
      >
        {Array.from({ length: numColumns === 1 ? 3 : 4 }).map((_, index) => (
          <View
            key={index}
            style={{
              width: cardWidth,
              alignSelf: "center",
            }}
          >
            <FeedSkeletonCard />
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      key={numColumns}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={[
            styles.itemWrap,
            isDesktop
              ? {
                  width: desktopCardWidth,
                  maxWidth: desktopCardWidth,
                }
              : {
                  width: mobileCardWidth,
                  maxWidth: mobileCardWidth,
                  alignSelf: "center",
                },
          ]}
        >
          <PhotoCard photo={item} onPress={() => onPressPhoto(item)} />
        </View>
      )}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topInset,
          paddingBottom: 28,
        },
      ]}
      columnWrapperStyle={numColumns === 2 ? styles.columnWrapper : undefined}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
      onEndReached={onEndReached}
      onEndReachedThreshold={0.35}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <FeedEmptyState
          hasQuery={hasQuery}
          onResetSearch={onResetSearch}
          contentWidth={isDesktop ? contentWidth : mobileCardWidth}
        />
      }
      ListFooterComponent={footer}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      updateCellsBatchingPeriod={40}
      removeClippedSubviews={Platform.OS !== "web"}
    />
  );
}

const styles = StyleSheet.create({
  skeletonWrap: {
    alignSelf: "center",
    paddingBottom: 28,
  },
  content: {
    alignItems: "center",
  },
  columnWrapper: {
    justifyContent: "center",
    gap: 16,
  },
  itemWrap: {
    paddingVertical: 8,
  },
  footerLoading: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#8A8A8A",
    fontSize: 13,
    fontWeight: "600",
  },
  footerSpacing: {
    height: 12,
  },
});
