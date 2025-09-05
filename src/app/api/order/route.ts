import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const orderSchema = z.object({
      consumptionMethod: z.enum(['DINE_IN', 'TAKE_AWAY'], {
        message: 'consumptionMethod should be DINE_IN or TAKE_AWAY',
      }),
      products: z
        .array(
          z.object({
            productId: z.number({ message: 'productId must be a valid number' }),
            quantity: z.number().min(1, 'quantity should be positive'),
          })
        )
        .min(1, 'must have at least one product'),
    });

    const body = await req.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      const first = result.error.issues[0];
      const field = first?.path.join('.') || 'unknown';
      const message = first?.message || 'Invalid payload';
      return NextResponse.json({ error: `${field}: ${message}` }, { status: 400 });
    }

    const { consumptionMethod, products } = result.data;
    let total = 0;
    const orderProductsData = [];

    for (const item of products) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const subtotal = product.price * item.quantity;
      total += subtotal;
      orderProductsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    const order = await prisma.order.create({
      data: {
        consumptionMethod,
        total,
        products: {
          create: orderProductsData,
        },
      },
      include: { products: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
