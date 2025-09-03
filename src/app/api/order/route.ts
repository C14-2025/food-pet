import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { consumptionMethod, products } = await req.json();

    if (!consumptionMethod || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
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
