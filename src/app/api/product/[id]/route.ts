import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    if (Number.isNaN(Number(id))) {
      throw new Error('Invalid ID');
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message || 'Failed to fetch product',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (Number.isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  try {
    // Check if product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.orderProduct.deleteMany({ where: { productId: Number(id) } });
      await tx.product.delete({ where: { id: Number(id) } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to delete product: ${(error as Error).message}`,
      },
      { status: 500 },
    );
  }
}
