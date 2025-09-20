import { listProducts, getProductById, uploadProductsCsv, deleteProductById } from '@/lib/api/product';
import type { Product } from '@/features/orders/types';

// Helpers para mock do fetch
const okJson = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

const errJson = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const noContent = (init?: ResponseInit) =>
  new Response(null, {
    status: 204,
    ...init,
  });

// Util: instala um mock para global.fetch
const mockFetch = (impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = jest.fn(impl);
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('products API client', () => {
  test('listProducts retorna lista', async () => {
    const products: Product[] = [
      { id: 1, name: 'Café', price: 10, image: 'a' },
      { id: 2, name: 'Pão', price: 5.5, image: 'b' },
    ];
    mockFetch(async () => okJson(products));

    await expect(listProducts()).resolves.toEqual(products);
    expect(fetch).toHaveBeenCalledWith('/api/product', { cache: 'no-store' });
  });

  test('listProducts lança erro quando não ok', async () => {
    mockFetch(async () => errJson('Falha ao buscar produtos', 500));
    await expect(listProducts()).rejects.toThrow('Falha ao buscar produtos');
  });

  test('getProductById retorna produto', async () => {
    const product: Product = { id: 99, name: 'Suco', price: 12.5, image: 'img' };
    mockFetch(async () => okJson(product));

    await expect(getProductById(99)).resolves.toEqual(product);
    expect(fetch).toHaveBeenCalledWith('/api/product/99', { cache: 'no-store' });
  });

  test('getProductById lança erro quando não ok', async () => {
    mockFetch(async () => errJson('Falha ao buscar produto', 404));
    await expect(getProductById(77)).rejects.toThrow('Falha ao buscar produto');
  });

  test('uploadProductsCsv envia arquivo e retorna inserted', async () => {
    const fakeFile = new File(['name,price,image\nCafé,10,img.jpg'], 'products.csv', {
      type: 'text/csv',
    });
    const response = { inserted: 3 };

    mockFetch(async (_input, init) => {
      // valida método e body
      expect(init?.method).toBe('POST');
      expect(init?.body).toBeInstanceOf(FormData);
      const body = init?.body as FormData;
      expect(body.get('file')).toBe(fakeFile);
      return okJson(response);
    });

    await expect(uploadProductsCsv(fakeFile)).resolves.toEqual(response);
  });

  test('uploadProductsCsv lança erro quando falha', async () => {
    const fakeFile = new File(['invalid'], 'products.csv', { type: 'text/csv' });

    mockFetch(async () => errJson('Falha ao importar produtos', 400));
    await expect(uploadProductsCsv(fakeFile)).rejects.toThrow('Falha ao importar produtos');
  });

  test('deleteProductById retorna null quando sucesso (204)', async () => {
    mockFetch(async () => noContent());
    await expect(deleteProductById('10')).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/product/10', { method: 'DELETE', cache: 'no-store' });
  });

  test('deleteProductById lança erro quando não ok', async () => {
    mockFetch(async () => errJson('Produto não encontrado', 404));
    await expect(deleteProductById('123')).rejects.toThrow('Produto não encontrado');
  });
});
