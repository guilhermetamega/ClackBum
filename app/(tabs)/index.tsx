import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { IconButton, Menu, Provider } from "react-native-paper";
import PhotoCard from "../../components/PhotoCard";
import { supabase } from "../../lib/supabaseClient";

export default function HomeScreen() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState<any>(null);

  const limit = 10;
  const router = useRouter();

  async function fetchUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchPhotos() {
    setLoading(true);

    const start = page * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from("photos")
      .select(`*, users(name)`)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(start, end);

    if (!error && data) {
      const enhancedPhotos = data.map((item) => {
        const { data: publicUrl } = supabase.storage
          .from("photos")
          .getPublicUrl(item.image);

        return {
          ...item,
          image_url: publicUrl?.publicUrl || null,
        };
      });

      setPhotos((prev) => [...prev, ...enhancedPhotos]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();
  }, [page]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <Provider>
      <View style={styles.container}>
        {/* 🔹 Menu / Login Button */}
        <View style={styles.header}>
          {!user ? (
            <IconButton
              icon="login"
              size={28}
              onPress={() => router.push("/auth")}
            />
          ) : (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="account-circle"
                  size={32}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              {/* <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  router.push("/publish");
                }}
                title="Publicar foto"
              /> */}
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  handleLogout();
                }}
                title="Logout"
              />
            </Menu>
          )}
        </View>

        {/* 🔹 Photo Feed */}
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PhotoCard
              photo={item}
              onPress={() => router.push(`/photo/${item.id}`)}
            />
          )}
          onEndReached={() => setPage((prev) => prev + 1)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" style={{ margin: 20 }} />
            ) : null
          }
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    width: "100%",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
});
