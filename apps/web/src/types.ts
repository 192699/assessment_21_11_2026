export type Product = {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: "USD";
  };
  category: {
    id: string;
    name: string;
  };
  imageUrl: string;
  rating: {
    score: number;
    count: number;
  };
};

export type Category = {
  id: string;
  name: string;
};

export type EnquiryPayload = {
  productId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
};
