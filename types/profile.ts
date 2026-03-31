export type Visibility = "public" | "private" | "unlisted";

export type ProfileTab = "own" | "purchases";

export type ProfilePhoto = {
  id: string;
  title: string;
  original_path: string;
  preview_path: string;
  status?: "pending" | "approved" | "rejected";
  visibility?: Visibility;
  imageUrl: string;
};

export type ProfilePurchaseRow = {
  photo_id: string;
  photos: {
    id: string;
    title: string;
    original_path: string;
    preview_path: string;
  } | null;
};

export type ProfilePhotoRow = {
  id: string;
  title: string;
  original_path: string;
  preview_path: string;
  status: "pending" | "approved" | "rejected";
  visibility: Visibility;
};

export type BalanceData = {
  available: number;
  pending: number;
};

export type VisibilityConfig = {
  label: string;
  icon: "globe-outline" | "link-outline" | "lock-closed-outline";
  color: string;
};

export type ProfileToastState = {
  visible: boolean;
  message: string;
};

export type ProfileCacheState = {
  photos: ProfilePhoto[];
  purchases: ProfilePhoto[];
  balance: number;
  balancePending: number;
  updatedAt: number;
};
