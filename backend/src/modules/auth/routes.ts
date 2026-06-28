import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ok, fail } from '../../utils/http';
import { comparePassword, hashPassword, publicUser, signAccessToken } from './service';
import { createUser, findUserByEmail } from '../users/repository';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const memoryUsers = new Map<string, { id: string; email: string; name: string; passwordHash: string; plan: string }>();

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (req, reply) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Payload register tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    }

    const existingDbUser = await findUserByEmail(parsed.data.email);
    if (existingDbUser) return reply.status(409).send(fail('Email sudah terdaftar', 'EMAIL_EXISTS'));

    const passwordHash = await hashPassword(parsed.data.password);
    const dbUser = await createUser({
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      plan: 'free'
    });

    if (dbUser) {
      const token = signAccessToken({ sub: dbUser.id, email: dbUser.email, plan: dbUser.plan, name: dbUser.name });
      return ok({ user: publicUser(dbUser), token });
    }

    const existingMemory = Array.from(memoryUsers.values()).find((u) => u.email === parsed.data.email);
    if (existingMemory) return reply.status(409).send(fail('Email sudah terdaftar', 'EMAIL_EXISTS'));

    const user = {
      id: `mem-${Date.now()}`,
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      plan: 'free'
    };
    memoryUsers.set(user.id, user);
    const token = signAccessToken({ sub: user.id, email: user.email, plan: user.plan, name: user.name });
    return ok({ user: publicUser(user), token, mode: 'memory-fallback' });
  });

  app.post('/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Payload login tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    }

    const dbUser = await findUserByEmail(parsed.data.email);
    if (dbUser) {
      const match = await comparePassword(parsed.data.password, dbUser.passwordHash);
      if (!match) return reply.status(401).send(fail('Email atau password salah', 'INVALID_CREDENTIALS'));
      const token = signAccessToken({ sub: dbUser.id, email: dbUser.email, plan: dbUser.plan, name: dbUser.name });
      return ok({ user: publicUser(dbUser), token });
    }

    const user = Array.from(memoryUsers.values()).find((u) => u.email === parsed.data.email);
    if (!user) return reply.status(401).send(fail('Email atau password salah', 'INVALID_CREDENTIALS'));
    const match = await comparePassword(parsed.data.password, user.passwordHash);
    if (!match) return reply.status(401).send(fail('Email atau password salah', 'INVALID_CREDENTIALS'));
    const token = signAccessToken({ sub: user.id, email: user.email, plan: user.plan, name: user.name });
    return ok({ user: publicUser(user), token, mode: 'memory-fallback' });
  });
};

export default authRoutes;
