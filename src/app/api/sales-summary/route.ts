import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAuth } from '@/lib/auth/endpoints.auth.helper';

export async function GET(request: NextRequest) {
  const authCheck = await checkAuth(['ADMIN', 'CLIENT']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const period = searchParams.get('period') || '';

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (from && to) {
      startDate = new Date(from + 'T00:00:00Z'); // início do dia UTC
      endDate = new Date(to + 'T23:59:59Z'); // fim do dia UTC

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
      }
    } else if (period) {
      startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          break;
        case 'month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          break;
        default:
          return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
      }
    }

    const dateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

    const totalOrders = await prisma.order.count({
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    const totalProducts = await prisma.orderProduct.aggregate({
      _sum: { quantity: true },
      where: dateFilter ? { order: { createdAt: dateFilter } } : {},
    });

    const totalProfit = await prisma.order.aggregate({
      _sum: { total: true },
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    return NextResponse.json({
      period: from && to ? `${from} -> ${to}` : period || 'all time',
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
      totalOrders,
      totalProducts: totalProducts._sum?.quantity ?? 0,
      totalProfit: totalProfit._sum?.total ?? 0,
    });
  } catch (err) {
    console.error('[Sales Summary Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
