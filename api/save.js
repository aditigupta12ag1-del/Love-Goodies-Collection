import { createClient } from 'redis';
import { nanoid } from 'nanoid';

let client;
async function getRedisClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, cart } = req.body;
    const id = nanoid(8);
    const payload = JSON.stringify({ to, from, cart });
    
    const redis = await getRedisClient();
    
    // Save to Redis, keep it for 30 days (2592000 seconds)
    await redis.set(id, payload, { EX: 2592000 });
    
    return res.status(200).json({ id });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
