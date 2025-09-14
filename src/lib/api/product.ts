import type { Product } from '@/features/orders/types';

export async function listProducts(): Promise<Product[]> {
  const res = await fetch('/api/product', { cache: 'no-store' });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao buscar produtos');
  }
  return (await res.json()) as Product[];
}

export async function getProductById(id: number): Promise<Product> {
  const res = await fetch(`/api/product/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao buscar produto');
  }
  return (await res.json()) as Product;
}

export async function uploadProductsCsv(file: File): Promise<{ inserted: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/product', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body?.error ?? 'Falha ao importar produtos');
  }

  return (await res.json()) as { inserted: number };
}
