import { GET } from '@/app/api/sales-summary/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    orderProduct: {
      aggregate: jest.fn(),
    },
  },
}));

describe('GET /api/sales-summary', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('returns aggregated data for all time (no filter)', async () => {
    (prisma.order.count as jest.Mock).mockResolvedValue(5);
    (prisma.orderProduct.aggregate as jest.Mock).mockResolvedValue({ _sum: { quantity: 10 } });
    (prisma.order.aggregate as jest.Mock).mockResolvedValue({ _sum: { total: 100 } });

    const req = new NextRequest('http://localhost/api/sales-summary');
    const res = await GET(req);
    const data = await res.json();

    expect(data.totalOrders).toBe(5);
    expect(data.totalProducts).toBe(10);
    expect(data.totalProfit).toBe(100);
    expect(data.period).toBe('all time');
  });

  it('returns aggregated data for period=day', async () => {
    (prisma.order.count as jest.Mock).mockResolvedValue(2);
    (prisma.orderProduct.aggregate as jest.Mock).mockResolvedValue({ _sum: { quantity: 6 } });
    (prisma.order.aggregate as jest.Mock).mockResolvedValue({ _sum: { total: 68.9 } });

    const req = new NextRequest('http://localhost/api/sales-summary?period=day');
    const res = await GET(req);
    const data = await res.json();

    expect(data.totalOrders).toBe(2);
    expect(data.totalProducts).toBe(6);
    expect(data.totalProfit).toBe(68.9);
    expect(data.period).toBe('day');
  });

  it('returns aggregated data for custom from/to dates', async () => {
    (prisma.order.count as jest.Mock).mockResolvedValue(3);
    (prisma.orderProduct.aggregate as jest.Mock).mockResolvedValue({ _sum: { quantity: 8 } });
    (prisma.order.aggregate as jest.Mock).mockResolvedValue({ _sum: { total: 120 } });

    const req = new NextRequest('http://localhost/api/sales-summary?from=2025-09-01&to=2025-09-21');
    const res = await GET(req);
    const data = await res.json();

    expect(data.totalOrders).toBe(3);
    expect(data.totalProducts).toBe(8);
    expect(data.totalProfit).toBe(120);
    expect(data.period).toBe('2025-09-01 -> 2025-09-21');
  });

  it('returns 400 for invalid period', async () => {
    const req = new NextRequest('http://localhost/api/sales-summary?period=invalid');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Invalid period');
  });

  it('returns 400 for invalid from/to date', async () => {
    const req = new NextRequest('http://localhost/api/sales-summary?from=abc&to=def');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Invalid date format. Use YYYY-MM-DD.');
  });

  it('returns 500 if Prisma throws an error', async () => {
    (prisma.order.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const req = new NextRequest('http://localhost/api/sales-summary');
    const res = await GET(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
