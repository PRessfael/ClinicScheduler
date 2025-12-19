import { insertUserSchema, type InsertUser, type User } from '../../shared/schema';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const now = new Date();
    const user: User = {
      id,
      email: '',
      username: insertUser.username ?? null,
      user_type: insertUser.user_type ?? 'user',
      created_at: now,
      phone: insertUser.phone ?? null,
    } as User;
    this.users.set(id, user);
    return user;
  }
}

export const storage: IStorage = new MemStorage();

export function validateInsertUser(payload: unknown): InsertUser {
  const parsed = insertUserSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    const err = new Error(message) as any;
    err.status = 400;
    throw err;
  }
  return parsed.data;
}
