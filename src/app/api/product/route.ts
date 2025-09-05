import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parse } from 'csv-parse/sync';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'CSV file is required (field name: file)' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const csvText = Buffer.from(arrayBuffer).toString('utf-8');

  let records: Array<{ name: string; price: string; image: string }>;
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
  }

  const created = [];
  for (const row of records) {
    const { name, price, image } = row;
    if (!name || !price || !image) continue;
    try {
      const product = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          image,
        },
      });
      created.push(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  }

  return NextResponse.json({ inserted: created.length });
}

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
