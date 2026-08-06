import { createClient } from 'redis';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Missing ID parameter' });
    }
    
    const redis = await getRedisClient();
    const dataStr = await redis.get(id);
    
    if (!dataStr) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    // The data is stored as a string, parse it before sending to match the frontend expectations
    return res.status(200).json(JSON.parse(dataStr));
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
