import type { Order, Product, ConsumptionMethod } from '@/features/orders/types';

export const currency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function listOrders(): Promise<Order[]> {
  const res = await fetch('/api/order', { cache: 'no-store' });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao buscar pedidos');
  }
  return (await res.json()) as Order[];
}

export async function getOrderById(id: number): Promise<Order> {
  const res = await fetch(`/api/order/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao buscar pedido');
  }
  return (await res.json()) as Order;
}

export async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`/api/order/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao apagar pedido');
  }
}

export type CreateOrderPayload = {
  consumptionMethod: ConsumptionMethod;
  products: Array<{ productId: number; quantity: number }>;
};

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao criar pedido');
  }
  return (await res.json()) as Order;
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch('/api/product', { cache: 'no-store' });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao carregar produtos');
  }
  return (await res.json()) as Product[];
}
