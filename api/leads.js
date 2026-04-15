import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'nodejs', maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Simple token auth for admin page
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const leads = await sql`SELECT * FROM leads ORDER BY created_at DESC`;

    return res.status(200).json({ success: true, leads, total: leads.length });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch leads', detail: error.message });
  }
}
