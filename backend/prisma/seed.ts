import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.create({
    data: {
      name: 'Cuenta Test Owner',
      plan: 'early_adopter',
      planPrice: 6990,
      billingStatus: 'trial',
    },
  });

  await prisma.user.create({
    data: {
      email: 'dueno1@test.cl',
      role: 'owner',
      accountId: account.id,
    },
  });

  console.log('Seed ejecutado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });