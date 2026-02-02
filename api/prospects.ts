import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const DEFAULT_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { icp, confidence, intentHeat, state } = req.query;

    // Fetch all prospects for the workspace
    const prospects = await sql`
      SELECT
        id, full_name, linkedin_url, linkedin_url_canonical,
        icp, role_detected, icp_match_score, icp_confidence, intent_heat,
        source_url, geo_state, geo_city, times_seen, created_at
      FROM rei_prospects.people_prospects
      WHERE workspace_id = ${DEFAULT_WORKSPACE_ID}::uuid
      ORDER BY created_at DESC
      LIMIT 500
    `;

    // Apply filters in JavaScript (simpler than building dynamic SQL)
    let filtered = prospects;

    if (icp && typeof icp === 'string') {
      filtered = filtered.filter((p: any) => p.icp === icp);
    }

    if (confidence && typeof confidence === 'string') {
      filtered = filtered.filter((p: any) => p.icp_confidence === confidence);
    }

    if (intentHeat && typeof intentHeat === 'string') {
      filtered = filtered.filter((p: any) => p.intent_heat === intentHeat);
    }

    if (state && typeof state === 'string') {
      filtered = filtered.filter((p: any) => p.geo_state === state);
    }

    return res.status(200).json({ prospects: filtered });

  } catch (error: any) {
    console.error('Prospects fetch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
