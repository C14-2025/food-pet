import {
  listOrders,
  getOrderById,
  deleteOrder,
  createOrder,
  listProducts,
  type CreateOrderPayload,
} from '@/lib/api/orders';
import type { Order, Product } from '@/features/orders/types';

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

// Util: instala um mock para global.fetch
const mockFetch = (impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = jest.fn(impl);
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('orders API client', () => {
  test('listOrders retorna lista', async () => {
    const orders: Order[] = [
      { id: 1, total: 10, consumptionMethod: 'DINE_IN', products: [] },
      { id: 2, total: 20, consumptionMethod: 'TAKE_AWAY', products: [] },
    ];
    mockFetch(async () => okJson(orders));

    await expect(listOrders()).resolves.toEqual(orders);
    expect(fetch).toHaveBeenCalledWith('/api/order', { cache: 'no-store' });
  });

  test('listOrders lança erro quando não ok', async () => {
    mockFetch(async () => errJson('Falha ao buscar pedidos', 500));
    await expect(listOrders()).rejects.toThrow('Falha ao buscar pedidos');
  });

  test('getOrderById retorna um pedido', async () => {
    const order: Order = { id: 7, total: 33, consumptionMethod: 'DINE_IN', products: [] };
    mockFetch(async () => okJson(order));

    await expect(getOrderById(7)).resolves.toEqual(order);
    expect(fetch).toHaveBeenCalledWith('/api/order/7', { cache: 'no-store' });
  });

  test('deleteOrder resolve void quando sucesso', async () => {
    mockFetch(async () => new Response(null, { status: 204 }));

    await expect(deleteOrder(10)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/api/order/10', { method: 'DELETE' });
  });

  test('deleteOrder lança erro quando falha', async () => {
    mockFetch(async () => errJson('Falha ao apagar pedido', 400));
    await expect(deleteOrder(10)).rejects.toThrow('Falha ao apagar pedido');
  });

  test('createOrder envia payload e retorna pedido criado', async () => {
    const payload: CreateOrderPayload = {
      consumptionMethod: 'TAKE_AWAY',
      products: [{ productId: 1, quantity: 2 }],
    };
    const created: Order = { id: 99, total: 40, consumptionMethod: 'TAKE_AWAY', products: [] };

    mockFetch(async (_input, init) => {
      // valida método/headers/body
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
      expect(JSON.parse(String(init?.body))).toEqual(payload);
      return okJson(created);
    });

    await expect(createOrder(payload)).resolves.toEqual(created);
  });

  test('createOrder lança erro quando API retorna erro', async () => {
    mockFetch(async () => errJson('Falha ao criar pedido', 400));
    await expect(createOrder({ consumptionMethod: 'DINE_IN', products: [] })).rejects.toThrow('Falha ao criar pedido');
  });

  test('listProducts retorna produtos', async () => {
    const products: Product[] = [
      { id: 1, name: 'Café', price: 10, image: 'a' },
      { id: 2, name: 'Pão', price: 5.5, image: 'b' },
    ];
    mockFetch(async () => okJson(products));

    await expect(listProducts()).resolves.toEqual(products);
    expect(fetch).toHaveBeenCalledWith('/api/product', { cache: 'no-store' });
  });

  test('listProducts lança erro quando falha', async () => {
    mockFetch(async () => errJson('Falha ao carregar produtos', 500));
    await expect(listProducts()).rejects.toThrow('Falha ao carregar produtos');
  });
});
