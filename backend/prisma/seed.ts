import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('quantum12345', 10);

  await prisma.user.upsert({
    where: { email: 'demo@quantum.local' },
    update: {},
    create: {
      email: 'demo@quantum.local',
      passwordHash,
      name: 'Quantum Demo',
      plan: 'pro'
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
