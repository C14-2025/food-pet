import 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const createUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Client User',
      email: 'client@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });

  return { admin, client };
};

const createProducts = async () => {
  return prisma.product.createMany({ data: [] });
};

async function main() {
  console.log('Seeding database...');

  const { admin, client } = await createUsers();
  console.log(`Created or found users: admin (${admin.email}) and client (${client.email})`);

  const products = await createProducts();
  console.log(`Created ${products.count} products`);
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
