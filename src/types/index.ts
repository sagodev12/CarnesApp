export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name"> | null;
};
