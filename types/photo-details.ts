export type PhotoVisibility = "public" | "unlisted" | "private";

export type PhotoDetails = {
  id: string;
  title: string;
  description: string;
  preview_path: string;
  original_path: string;
  visibility: PhotoVisibility;
  user_id: string;
  price: number;
  tags: string[];
  user_name: string | null;
  user_avatar_url: string | null;
  imageUrl: string;
};

export type PhotoDetailsRow = {
  id: string;
  title: string | null;
  description: string | null;
  preview_path: string;
  original_path: string;
  visibility: PhotoVisibility;
  user_id: string;
  price: number | null;
  tags: string[] | null;
  users:
    | {
        name: string | null;
        avatar_url: string | null;
      }
    | {
        name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

export type PhotoDetailsCacheEntry = {
  photo: PhotoDetails;
  canDownload: boolean;
  isOwner: boolean;
  updatedAt: number;
};
