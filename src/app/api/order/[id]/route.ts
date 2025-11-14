import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { checkAuth } from '@/lib/auth/endpoints.auth.helper';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAuth(['ADMIN', 'CLIENT']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const { id } = await context.params;

  if (Number.isNaN(Number(id))) {
    return NextResponse.json({ error: `Invalid order id ${id}` }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      products: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAuth(['ADMIN', 'CLIENT']);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  
  const { id } = await context.params;

  if (Number.isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.orderProduct.deleteMany({ where: { orderId: Number(id) } });
      await tx.order.delete({ where: { id: Number(id) } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to delete order: ${error}` }, { status: 500 });
  }
}
