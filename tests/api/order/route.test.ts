import { NextRequest } from 'next/server';
import { POST, GET as GET_ALL } from '../../../src/app/api/order/route';
import { DELETE, GET } from '../../../src/app/api/order/[id]/route';
import { prisma } from '@/lib/db';
import { expect } from '@jest/globals';

jest.mock('@/lib/db', () => {
  const deleteManyMock = jest.fn().mockResolvedValue({ count: 1 });
  const deleteOrderMock = jest.fn().mockResolvedValue({});

  const product = {
    findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
      where.id === 1 ? { id: 1, name: 'Product 1', price: 10 } : null,
    ),
  };

  const order = {
    create: jest.fn(async ({ data }) => ({ id: 1, ...data })),
    findUnique: jest.fn(async () => null),
    delete: deleteOrderMock,
  };

  const orderProduct = {
    deleteMany: deleteManyMock,
  };

  const $transaction = jest.fn(async (arg) => {
    if (typeof arg === 'function') {
      return arg({ orderProduct, order });
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return undefined;
  });

  const prisma = { product, order, orderProduct, $transaction };
  (prisma as { __mocks: object } & typeof prisma).__mocks = { deleteManyMock, deleteOrderMock, $transaction };

  return { prisma };
});

jest.mock('@/lib/auth/endpoints.auth.helper', () => ({
  checkAuth: jest.fn(() =>
    Promise.resolve({
      authorized: true,
      session: {
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' as const },
        expires: '2024-12-31',
      },
      user: { id: '1', email: 'admin@example.com', role: 'ADMIN' as const },
    }),
  ),
}));

describe('POST /api/order', () => {
  it('should create an order with valid payload', async () => {
    const req = {
      json: async () => ({
        consumptionMethod: 'DINE_IN',
        products: [{ productId: 1, quantity: 2 }],
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toHaveProperty('id');
  });

  it('should return error for invalid consumptionMethod', async () => {
    const req = {
      json: async () => ({
        consumptionMethod: 'INVALID',
        products: [{ productId: 1, quantity: 2 }],
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/consumptionMethod/);
  });

  it('should return error for missing products', async () => {
    const req = {
      json: async () => ({
        consumptionMethod: 'DINE_IN',
        products: [],
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/must have at least one product/);
  });

  it('should return error for invalid quantity', async () => {
    const req = {
      json: async () => ({
        consumptionMethod: 'DINE_IN',
        products: [{ productId: 1, quantity: 0 }],
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/quantity should be positive/);
  });

  it('should return 500 when order creation fails', async () => {
    prisma.order.create = jest.fn().mockRejectedValue(new Error('Database error'));

    const req = {
      json: async () => ({
        consumptionMethod: 'DINE_IN',
        products: [{ productId: 1, quantity: 2 }],
      }),
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to create order/);
  });
});

describe('GET api/order/[id]', () => {
  it('should return 200 and order for valid id', async () => {
    prisma.order.findUnique = jest.fn(async () => ({
      id: 1,
      total: 20,
      consumptionMethod: 'DINE_IN',
      products: [],
    })) as unknown as typeof prisma.order.findUnique;
    const req = {} as unknown as NextRequest;
    const params = Promise.resolve({ id: '1' });
    const res = await GET(req, { params });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toHaveProperty('id', 1);
  });

  it('should return 404 for non-existent order', async () => {
    prisma.order.findUnique = jest.fn(async () => null) as unknown as typeof prisma.order.findUnique;
    const req = {} as unknown as NextRequest;
    const params = Promise.resolve({ id: '999' });
    const res = await GET(req, { params });
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toMatch(/Order not found/);
  });
});

describe('DELETE api/order/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 204 for successful deletion', async () => {
    const req = {} as unknown as NextRequest;
    const params = Promise.resolve({ id: '1' });

    const res = await DELETE(req, { params });

    expect(res.status).toBe(204);
  });

  it('should return 400 for invalid id', async () => {
    const req = {} as unknown as NextRequest;
    const params = Promise.resolve({ id: 'abc' });

    const res = await DELETE(req, { params });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/order', () => {
  it('should return all orders successfully', async () => {
    const mockOrders = [
      {
        id: 1,
        total: 20,
        consumptionMethod: 'DINE_IN',
        products: [{ id: 1, productId: 1, orderId: 1, quantity: 2, price: 10, subtotal: 20 }],
      },
      {
        id: 2,
        total: 30,
        consumptionMethod: 'TAKE_OUT',
        products: [{ id: 2, productId: 2, orderId: 2, quantity: 3, price: 10, subtotal: 30 }],
      },
    ];

    prisma.order.findMany = jest.fn().mockResolvedValue(mockOrders);

    const res = await GET_ALL();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockOrders);
    expect(json).toHaveLength(2);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      include: { products: true },
    });
  });

  it('should return 500 when retrieving orders fails', async () => {
    prisma.order.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

    const res = await GET_ALL();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to retrieve orders/);
  });
});
