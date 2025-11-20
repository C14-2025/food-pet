import 'dotenv';
import { PrismaClient, consumptionMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const createUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const client = await prisma.user.create({
    data: {
      name: 'Client User',
      email: 'client@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });

  return { admin, client };
};

const createOrders = async (clientUserId: number) => {
  // 2. Fetch products to use them in orders
  const allProducts = await prisma.product.findMany();
  // 3. Create an order with products
  const order1 = await prisma.order.create({
    data: {
      total: 35.0 + 6.0,
      consumptionMethod: consumptionMethod.DINE_IN,
      products: {
        create: [
          {
            quantity: 1,
            price: 35.0,
            subtotal: 35.0,
            productId: allProducts.find((p) => p.name === 'Margherita Pizza')!.id,
            userId: clientUserId,
          },
          {
            quantity: 1,
            price: 6.0,
            subtotal: 6.0,
            productId: allProducts.find((p) => p.name === 'Coca-Cola 350ml')!.id,
            userId: clientUserId,
          },
        ],
      },
    },
    include: { products: true },
  });

  const order2 = await prisma.order.create({
    data: {
      total: 42.0 + 15.0,
      consumptionMethod: consumptionMethod.TAKE_AWAY,
      products: {
        create: [
          {
            quantity: 1,
            price: 42.0,
            subtotal: 42.0,
            productId: allProducts.find((p) => p.name === 'Pepperoni Pizza')!.id,
            userId: clientUserId,
          },
          {
            quantity: 1,
            price: 15.0,
            subtotal: 15.0,
            productId: allProducts.find((p) => p.name === 'Chocolate Cake')!.id,
            userId: clientUserId,
          },
        ],
      },
    },
    include: { products: true },
  });

  return [order1, order2];
};

const createProducts = async () => {
  // 1. Create products
  const products = await prisma.product.createMany({
    data: [
      { name: 'Margherita Pizza', price: 35.0, image: '/images/margherita.jpg' },
      { name: 'Pepperoni Pizza', price: 42.0, image: '/images/pepperoni.jpg' },
      { name: 'Coca-Cola 350ml', price: 6.0, image: '/images/coke.jpg' },
      { name: 'Chocolate Cake', price: 15.0, image: '/images/cake.jpg' },
    ],
  });

  return products;
};

async function main() {
  console.log('🌱 Seeding database...');

  const { admin, client } = await createUsers();

  console.log(`✅ Created users: admin (${admin.email}) and client (${client.email})`);

  const products = await createProducts();

  console.log(`✅ Created ${products.count} products`);

  const [order1, order2] = await createOrders(client.id);

  console.log('✅ Created orders with products:', { order1, order2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
