import { GET as GET_BY_ID, DELETE } from '@/app/api/product/[id]/route';
import { POST, GET as GET_ALL } from '@/app/api/product/route';
import { NextRequest } from 'next/server';
import { expect } from '@jest/globals';

const MOCK_PRODUCT = {
  id: 1,
  name: 'Mocked Product',
  price: 10,
  image: 'img.png',
};

jest.mock('@/lib/db', () => ({
  prisma: {
    product: {
      create: jest.fn(async ({ data }) => ({ id: 1, ...data })),
      findUnique: jest.fn(async ({ where }) => {
        if (where.id === 1) {
          return MOCK_PRODUCT;
        }
        return null;
      }),
      delete: jest.fn(async ({ where }) => {
        if (where.id === 1) {
          return MOCK_PRODUCT;
        }
        throw new Error('Product not found');
      }),
    },
    orderProduct: {
      deleteMany: jest.fn(async () => ({ count: 0 })),
    },
    $transaction: jest.fn(async (callback) => {
      return await callback({
        product: {
          delete: jest.fn(async ({ where }) => {
            if (where.id === 1) {
              return MOCK_PRODUCT;
            }
            throw new Error('Product not found');
          }),
        },
        orderProduct: {
          deleteMany: jest.fn(async () => ({ count: 0 })),
        },
      });
    }),
  },
}));

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

function createMockFile(csv: string) {
  return {
    arrayBuffer: async () => Buffer.from(csv, 'utf-8'),
    type: 'text/csv',
  };
}

describe('POST /api/product', () => {
  it('should return 400 if Content-Type is not multipart/form-data', async () => {
    const req = {
      headers: { get: (_k: string) => 'application/json' },
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res?.json();
    expect(res?.status).toBe(400);
    expect(json.error).toMatch(/Content-Type must be multipart\/form-data/);
  });

  it('should insert products from valid CSV', async () => {
    const csv = 'name,price,image\nProduct 1,10.5,img1.png\nProduct 2,20,img2.png';
    const file = createMockFile(csv);
    const formData = {
      get: (key: string) => (key === 'file' ? file : undefined),
    };
    const req = {
      headers: { get: (_k: string) => 'multipart/form-data' },
      formData: async () => formData,
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res?.json();
    expect(json.inserted).toBe(2);
  });

  it('should return 400 if file is missing', async () => {
    const formData = {
      get: () => undefined,
    };
    const req = {
      headers: { get: () => 'multipart/form-data' },
      formData: async () => formData,
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res?.json();
    expect(res?.status).toBe(400);
    expect(json.error).toMatch(/CSV file is required/);
  });

  it('should return 400 for invalid CSV format', async () => {
    const invalidCsv = 'this is not a valid CSV\n"unclosed quote';
    const file = createMockFile(invalidCsv);
    const formData = {
      get: (key: string) => (key === 'file' ? file : undefined),
    };
    const req = {
      headers: { get: () => 'multipart/form-data' },
      formData: async () => formData,
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res?.json();
    expect(res?.status).toBe(400);
    expect(json.error).toMatch(/Invalid CSV format/);
  });

  it('should skip rows missing required columns', async () => {
    const csv = 'name,price,image\nProduct 1,10.5,img1.png\nProduct 2,20,';
    const file = createMockFile(csv);
    const formData = {
      get: (key: string) => (key === 'file' ? file : undefined),
    };
    const req = {
      headers: { get: () => 'multipart/form-data' },
      formData: async () => formData,
    } as unknown as NextRequest;
    const res = await POST(req);
    const json = await res?.json();
    expect(json.inserted).toBe(1);
  });

  it('should handle errors when creating products and log them', async () => {
    const { prisma } = jest.requireMock('@/lib/db');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    prisma.product.create
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce({ id: 2, name: 'Product 2', price: 20, image: 'img2.png' });

    const csv = 'name,price,image\nProduct 1,10.5,img1.png\nProduct 2,20,img2.png';
    const file = createMockFile(csv);
    const formData = {
      get: (key: string) => (key === 'file' ? file : undefined),
    };
    const req = {
      headers: { get: () => 'multipart/form-data' },
      formData: async () => formData,
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res?.json();

    expect(json.inserted).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar produto:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});

describe('GET /api/products/[id]', () => {
  it('should return the product when found', async () => {
    const req = {} as unknown as NextRequest;
    const res = await GET_BY_ID(req, { params: Promise.resolve({ id: '1' }) });

    expect(res?.status).toBe(200);
    const json = await res?.json();
    expect(json).toMatchObject(MOCK_PRODUCT);
  });

  it('should return 404 if product is not found', async () => {
    const req = {} as unknown as NextRequest;
    const res = await GET_BY_ID(req, { params: Promise.resolve({ id: '999' }) });

    expect(res?.status).toBe(404);
    const json = await res?.json();
    expect(json.error).toMatch(/not found/i);
  });

  it('should return 500 if id param is not a valid number', async () => {
    const req = {} as unknown as NextRequest;
    const res = await GET_BY_ID(req, { params: Promise.resolve({ id: 'abc' }) });

    expect(res?.status).toBe(500);
    const json = await res?.json();

    expect(json.error).toMatch(/invalid id/i);
  });
});

describe('DELETE /api/products/[id]', () => {
  it('should delete the product when found', async () => {
    const req = {} as unknown as NextRequest;
    const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });

    expect(res?.status).toBe(204);
    expect(res?.body).toBe(null);
  });

  it('should return 404 if product is not found', async () => {
    const req = {} as unknown as NextRequest;
    const res = await DELETE(req, { params: Promise.resolve({ id: '999' }) });

    expect(res?.status).toBe(404);
    const json = await res?.json();
    expect(json.error).toMatch(/not found/i);
  });

  it('should return 400 if id param is not a valid number', async () => {
    const req = {} as unknown as NextRequest;
    const res = await DELETE(req, { params: Promise.resolve({ id: 'abc' }) });

    expect(res?.status).toBe(400);
    const json = await res?.json();
    expect(json.error).toMatch(/invalid product id/i);
  });
});

describe('GET /api/product', () => {
  const { prisma } = jest.requireMock('@/lib/db');

  it('should return all products successfully', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 10.5, image: 'img1.png' },
      { id: 2, name: 'Product 2', price: 20, image: 'img2.png' },
      { id: 3, name: 'Product 3', price: 15.75, image: 'img3.png' },
    ];

    prisma.product.findMany = jest.fn().mockResolvedValue(mockProducts);

    const res = await GET_ALL();
    const json = await res?.json();

    expect(res?.status).toBe(200);
    expect(json).toEqual(mockProducts);
    expect(json).toHaveLength(3);
    expect(prisma.product.findMany).toHaveBeenCalled();
  });

  it('should return 500 when fetching products fails', async () => {
    prisma.product.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

    const res = await GET_ALL();
    const json = await res?.json();

    expect(res?.status).toBe(500);
    expect(json.error).toMatch(/Failed to fetch products/);
  });
});
