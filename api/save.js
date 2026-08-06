const { createClient } = require('redis');
const crypto = require('crypto');

let client;
async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is missing. Please check Vercel settings.');
  }
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }
  return client;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, cart } = req.body;
    const id = crypto.randomBytes(4).toString('hex'); // Generate 8-character ID
    const payload = JSON.stringify({ to, from, cart });
    
    const redis = await getRedisClient();
    
    // Save to Redis, keep it for 24 hours (86400 seconds)
    await redis.set(id, payload, { EX: 86400 });
    
    return res.status(200).json({ id });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
