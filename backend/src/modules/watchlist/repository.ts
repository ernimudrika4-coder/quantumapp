import { prisma, dbAvailable } from '../../db/prisma';

export async function listUserWatchlist(userId: string) {
  if (!(await dbAvailable())) return null;
  return prisma.watchlist.findMany({ where: { userId }, orderBy: { sortOrder: 'asc' } });
}

export async function addUserWatchlistSymbol(userId: string, symbol: string) {
  if (!(await dbAvailable())) return null;
  const count = await prisma.watchlist.count({ where: { userId } });
  return prisma.watchlist.upsert({
    where: { userId_symbol: { userId, symbol } },
    update: {},
    create: { userId, symbol, sortOrder: count }
  });
}

export async function removeUserWatchlistSymbol(userId: string, symbol: string) {
  if (!(await dbAvailable())) return null;
  return prisma.watchlist.deleteMany({ where: { userId, symbol } });
}
