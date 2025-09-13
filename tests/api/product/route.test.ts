import { GET } from '@/app/api/product/[id]/route';
import { POST } from '@/app/api/product/route';
import { NextRequest } from 'next/server';

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
    },
  },
}));

function createMockFile(csv: string) {
  return {
    arrayBuffer: async () => Buffer.from(csv, 'utf-8'),
    type: 'text/csv',
  };
}

describe('POST /api/product', () => {
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
    const json = await res.json();
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
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/CSV file is required/);
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
    const json = await res.json();
    expect(json.inserted).toBe(1);
  });
});

describe('GET /api/products/[id]', () => {
  it('should return the product when found', async () => {
    const req = {} as unknown as NextRequest;
    const res = await GET(req, { params: Promise.resolve({ id: '1' }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject(MOCK_PRODUCT);
  });

  it('should return 404 if product is not found', async () => {
    const req = {} as unknown as NextRequest;
    const res = await GET(req, { params: Promise.resolve({ id: '999' }) });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toMatch(/not found/i);
  });

  it('should return 500 if id param is not a valid number', async () => {
    const req = {} as unknown as NextRequest;
    const res = await GET(req, { params: Promise.resolve({ id: 'abc' }) });

    expect(res.status).toBe(500);
    const json = await res.json();

    expect(json.error).toMatch(/invalid id/i);
  });
});
