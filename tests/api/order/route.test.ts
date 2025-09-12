import { NextRequest } from 'next/server';
import { POST } from '../../../src/app/api/order/route';
import { DELETE, GET } from '../../../src/app/api/order/[id]/route';
import { prisma } from '@/lib/db';

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
