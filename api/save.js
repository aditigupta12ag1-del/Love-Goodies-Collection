import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, cart } = req.body;
    
    // Generate a unique 8-character ID
    const id = nanoid(8);
    
    const payload = { to, from, cart };
    
    // Save to Vercel KV, keep it for 30 days
    // 30 days = 30 * 24 * 60 * 60 = 2592000 seconds
    await kv.set(id, payload, { ex: 2592000 });
    
    return res.status(200).json({ id });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
