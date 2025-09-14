export type ConsumptionMethod = 'DINE_IN' | 'TAKE_AWAY';

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export type OrderProduct = {
  id?: number;
  productId: number;
  quantity: number;
  price?: number;
  subtotal?: number;
  product?: Product;
};

export type Order = {
  id: number;
  total: number;
  consumptionMethod: ConsumptionMethod;
  products: OrderProduct[];
};
