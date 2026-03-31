export type FeedPhotoVisibility = "public" | "unlisted" | "private";

export type FeedPhotoUser = {
  name: string | null;
  avatar_url: string | null;
};

type FeedPhotoSaleRow = {
  sales: number | null;
};

export type FeedPhotoRow = {
  id: string;
  title: string | null;
  description: string | null;
  preview_path: string | null;
  original_path: string | null;
  visibility: FeedPhotoVisibility;
  user_id: string;
  price: number | null;
  tags: string[] | null;
  created_at: string;
  users: FeedPhotoUser[] | FeedPhotoUser | null;
  photo_sales: FeedPhotoSaleRow[] | FeedPhotoSaleRow | null;
};

export type FeedPhoto = {
  id: string;
  title: string;
  description: string;
  preview_path: string;
  original_path: string;
  visibility: FeedPhotoVisibility;
  user_id: string;
  price: number;
  tags: string[];
  sales: number;
  created_at: string;
  public_image_url: string;
  users: FeedPhotoUser | null;
  searchableText: string;
};

export type FeedFetchResult = {
  items: FeedPhoto[];
  hasMore: boolean;
  nextPage: number;
};

export type FeedToast = {
  message: string;
  type: "success" | "error";
};
