import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

type AppContextType = {
  platform: "web" | "mobile";
};

const AppContext = createContext<AppContextType>({
  platform: "mobile",
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<"web" | "mobile">("mobile");

  useEffect(() => {
    setPlatform(Platform.OS === "web" ? "web" : "mobile");
  }, []);

  return (
    <AppContext.Provider value={{ platform }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
