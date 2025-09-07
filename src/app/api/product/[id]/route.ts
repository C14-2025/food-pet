import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (Number.isNaN(Number(params.id))) {
      throw new Error('Invalid ID');
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(params.id) },
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
