// Health check endpoint for Vercel
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'AIWatch API',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}