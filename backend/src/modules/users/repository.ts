import { prisma, dbAvailable } from '../../db/prisma';

export interface UserRepoCreateInput {
  email: string;
  passwordHash: string;
  name: string;
  plan?: string;
}

export async function findUserByEmail(email: string) {
  if (!(await dbAvailable())) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  if (!(await dbAvailable())) return null;
  return prisma.user.findUnique({
    where: { id },
    include: {
      watchlists: { orderBy: { sortOrder: 'asc' } },
      follows: true,
      notifications: true,
      devices: true,
    }
  });
}

export async function createUser(input: UserRepoCreateInput) {
  if (!(await dbAvailable())) return null;
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name,
      plan: input.plan ?? 'free'
    }
  });
}
