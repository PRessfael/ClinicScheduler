import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, validateInsertUser } from './_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { id, username } = (req.query || {}) as { id?: string; username?: string };

      if (id) {
        const user = await storage.getUser(String(id));
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ user });
      }
      if (username) {
        const user = await storage.getUserByUsername(String(username));
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ user });
      }
      return res.status(400).json({ message: 'Provide id or username' });
    }

    if (req.method === 'POST') {
      const insertUser = validateInsertUser(req.body);
      const user = await storage.createUser(insertUser);
      return res.status(201).json({ user });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ message: err?.message || 'Internal Server Error' });
  }
}
