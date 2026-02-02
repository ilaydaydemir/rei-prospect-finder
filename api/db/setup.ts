import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const SCHEMA = 'rei_prospects';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check for setup key to prevent unauthorized access
  const setupKey = req.headers['x-setup-key'];
  if (setupKey !== process.env.DB_SETUP_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create schema
    await sql`CREATE SCHEMA IF NOT EXISTS rei_prospects`;

    // Create workspaces table
    await sql`
      CREATE TABLE IF NOT EXISTS rei_prospects.workspaces (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `;

    // Create default workspace
    await sql`
      INSERT INTO rei_prospects.workspaces (id, name)
      VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Default Workspace')
      ON CONFLICT (id) DO NOTHING
    `;

    // Create people_prospects table
    await sql`
      CREATE TABLE IF NOT EXISTS rei_prospects.people_prospects (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id uuid NOT NULL REFERENCES rei_prospects.workspaces(id),
        full_name text,
        linkedin_url text,
        linkedin_url_canonical text,
        icp text,
        role_detected text,
        icp_match_score integer,
        icp_confidence text CHECK (icp_confidence IN ('high', 'medium', 'low')),
        intent_heat text CHECK (intent_heat IN ('cold', 'warm', 'hot')) DEFAULT 'cold',
        source_url text,
        geo_state text,
        geo_city text,
        times_seen integer DEFAULT 1,
        first_seen_at timestamptz DEFAULT now(),
        created_at timestamptz DEFAULT now()
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_people_prospects_workspace
      ON rei_prospects.people_prospects (workspace_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_people_prospects_icp
      ON rei_prospects.people_prospects (workspace_id, icp)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_people_prospects_linkedin
      ON rei_prospects.people_prospects (workspace_id, linkedin_url_canonical)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_people_prospects_intent
      ON rei_prospects.people_prospects (workspace_id, intent_heat)
    `;

    // Create query_history table for future query rotation tracking
    await sql`
      CREATE TABLE IF NOT EXISTS rei_prospects.query_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id uuid NOT NULL REFERENCES rei_prospects.workspaces(id),
        fingerprint text NOT NULL,
        icp text NOT NULL,
        geo_state text,
        geo_city text,
        variant_type text NOT NULL,
        last_used_at timestamptz NOT NULL DEFAULT now(),
        runs_count integer DEFAULT 1,
        kept_results_total integer DEFAULT 0,
        dropped_results_total integer DEFAULT 0,
        success_rate numeric,
        UNIQUE(workspace_id, fingerprint)
      )
    `;

    return res.status(200).json({
      success: true,
      message: 'Database setup completed successfully',
      schema: SCHEMA,
      tables: ['rei_prospects.workspaces', 'rei_prospects.people_prospects', 'rei_prospects.query_history']
    });

  } catch (error: any) {
    console.error('Database setup error:', error);
    return res.status(500).json({ error: error.message || 'Database setup failed' });
  }
}
