import 'dotenv';
import { PrismaClient } from '@prisma/client';
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

const createProducts = async () => {
  // No default products to keep the catalog clean after seeding
  return prisma.product.createMany({ data: [] });
};

async function main() {
  console.log('Seeding database...');

  const { admin, client } = await createUsers();
  console.log(`Created users: admin (${admin.email}) and client (${client.email})`);

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
