export type StripeStatus = {
  blocked: boolean;
};

export type PublishFormValues = {
  title: string;
  description: string;
  price: string;
  tagsText: string;
  imageUri: string | null;
};

export type PublishPayload = {
  file: {
    uri: string;
  };
  title: string;
  description: string;
  price: number;
  tags: string[];
  visibility: "private" | "public" | "unlisted";
};
