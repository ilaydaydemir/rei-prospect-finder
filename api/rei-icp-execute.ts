import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);
const EXA_API_KEY = process.env.EXA_API_KEY;

type REIICPType = 'wholesaler' | 'flipper' | 'buy_hold' | 'agent' | 'institutional';

interface REIICPRequest {
  workspace_id: string;
  icps: REIICPType[];
  states: string[];
  city?: string;
  strategy: string;
  results_per_icp: number;
}

interface ICPConfig {
  positive_keywords: string[];
  role_titles: string[];
  negative_keywords: string[];
}

const ICP_CONFIGS: Record<REIICPType, ICPConfig> = {
  wholesaler: {
    positive_keywords: [
      'wholesaler', 'wholesale real estate', 'assignment investor',
      'acquisitions', 'dispositions', 'deal sourcer', 'off market'
    ],
    role_titles: ['Wholesaler', 'Acquisitions Manager', 'Dispositions Manager', 'Deal Sourcer'],
    negative_keywords: ['coach', 'mentor', 'course', 'academy', 'training', 'guru']
  },
  flipper: {
    positive_keywords: [
      'house flipper', 'fix and flip', 'rehab', 'renovation investor', 'property flipper'
    ],
    role_titles: ['House Flipper', 'Fix and Flip Investor', 'Renovation Specialist'],
    negative_keywords: ['coach', 'mentor', 'course', 'academy', 'training', 'guru']
  },
  buy_hold: {
    positive_keywords: [
      'landlord', 'buy and hold', 'rental investor', 'rental portfolio', 'BRRRR'
    ],
    role_titles: ['Landlord', 'Rental Property Investor', 'Portfolio Owner'],
    negative_keywords: ['coach', 'mentor', 'course', 'academy', 'training', 'guru']
  },
  agent: {
    positive_keywords: [
      'realtor', 'real estate agent', 'broker', 'listing agent', 'buyer agent'
    ],
    role_titles: ['Realtor', 'Real Estate Agent', 'Real Estate Broker'],
    negative_keywords: ['coach', 'mentor', 'course', 'academy', 'training', 'guru']
  },
  institutional: {
    positive_keywords: [
      'institutional investor', 'hedge fund', 'private equity', 'family office', 'fund manager'
    ],
    role_titles: ['Fund Manager', 'Asset Manager', 'Portfolio Manager', 'VP Acquisitions'],
    negative_keywords: ['coach', 'mentor', 'course', 'academy', 'training', 'guru']
  }
};

function buildQueries(icp: REIICPType, states: string[], city?: string): string[] {
  const config = ICP_CONFIGS[icp];
  const queries: string[] = [];

  const geoTerms = city ? [`${city}`] : states.slice(0, 3);

  for (const geo of geoTerms) {
    for (const keyword of config.positive_keywords.slice(0, 3)) {
      queries.push(`${geo} ${keyword}`);
    }
    for (const role of config.role_titles.slice(0, 2)) {
      queries.push(`${role} ${geo}`);
    }
  }

  return queries.slice(0, 10);
}

function calculateScore(
  text: string,
  icp: REIICPType,
  geoState: string | null
): { score: number; roleDetected: string | null; confidence: string } {
  const config = ICP_CONFIGS[icp];
  const lowerText = text.toLowerCase();
  let score = 0;
  let roleDetected: string | null = null;

  // Keyword matches (+2 each)
  for (const keyword of config.positive_keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 2;
      break;
    }
  }

  // Role matches (+2)
  for (const role of config.role_titles) {
    if (lowerText.includes(role.toLowerCase())) {
      score += 2;
      roleDetected = role;
      break;
    }
  }

  // Geo match (+1)
  if (geoState && lowerText.includes(geoState.toLowerCase())) {
    score += 1;
  }

  // Coaching penalty (-3)
  for (const neg of config.negative_keywords) {
    if (lowerText.includes(neg.toLowerCase())) {
      score -= 3;
      break;
    }
  }

  const confidence = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
  return { score, roleDetected, confidence };
}

async function searchExa(query: string): Promise<any[]> {
  if (!EXA_API_KEY) {
    console.log('No EXA_API_KEY, returning mock results');
    return [];
  }

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXA_API_KEY
      },
      body: JSON.stringify({
        query,
        type: 'neural',
        numResults: 10,
        includeDomains: ['linkedin.com'],
        contents: {
          text: { maxCharacters: 500 }
        }
      })
    });

    if (!response.ok) {
      console.error('Exa API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Exa search error:', error);
    return [];
  }
}

function extractNameFromUrl(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
  if (!match) return null;
  return match[1]
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as REIICPRequest;
    const { workspace_id, icps, states, city, results_per_icp } = body;

    if (!workspace_id || !icps || !states || icps.length === 0 || states.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const runId = crypto.randomUUID();
    const lanes: any[] = [];

    // Process each ICP lane
    for (const icp of icps) {
      const laneResult = {
        icp,
        status: 'completed',
        queries_executed: 0,
        results_found: 0,
        kept: 0,
        dropped: 0
      };

      const queries = buildQueries(icp, states, city);
      laneResult.queries_executed = queries.length;

      for (const query of queries) {
        const results = await searchExa(query);
        laneResult.results_found += results.length;

        for (const result of results) {
          // Filter: must be LinkedIn profile
          if (!result.url?.includes('linkedin.com/in/')) {
            laneResult.dropped++;
            continue;
          }

          const fullText = `${result.title || ''} ${result.text || ''}`;
          const { score, roleDetected, confidence } = calculateScore(fullText, icp, states[0]);

          // Drop if score too low
          if (score <= 1) {
            laneResult.dropped++;
            continue;
          }

          // Extract name from URL
          const fullName = extractNameFromUrl(result.url) || result.title || 'Unknown';

          // Canonical LinkedIn URL
          const linkedinMatch = result.url.match(/(linkedin\.com\/in\/[^\/\?]+)/);
          const linkedinUrlCanonical = linkedinMatch ? `https://www.${linkedinMatch[1]}` : result.url;

          // Check for existing prospect
          const existing = await sql`
            SELECT id, times_seen, first_seen_at
            FROM people_prospects
            WHERE workspace_id = ${workspace_id}::uuid
              AND linkedin_url_canonical = ${linkedinUrlCanonical}
            LIMIT 1
          `;

          if (existing.length > 0) {
            // Update existing
            const timesSeen = (existing[0].times_seen || 1) + 1;
            const firstSeen = new Date(existing[0].first_seen_at);
            const daysSinceFirst = (Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24);

            let intentHeat = 'cold';
            if (timesSeen >= 3 && daysSinceFirst <= 14) {
              intentHeat = 'hot';
            } else if (timesSeen >= 2 && daysSinceFirst <= 30) {
              intentHeat = 'warm';
            }

            await sql`
              UPDATE people_prospects
              SET times_seen = ${timesSeen},
                  intent_heat = ${intentHeat},
                  icp_match_score = ${score},
                  icp_confidence = ${confidence}
              WHERE id = ${existing[0].id}::uuid
            `;
          } else {
            // Insert new prospect
            await sql`
              INSERT INTO people_prospects (
                workspace_id, full_name, linkedin_url, linkedin_url_canonical,
                icp, role_detected, icp_match_score, icp_confidence, intent_heat,
                source_url, geo_state, geo_city, times_seen, first_seen_at
              ) VALUES (
                ${workspace_id}::uuid, ${fullName}, ${result.url}, ${linkedinUrlCanonical},
                ${icp}, ${roleDetected}, ${score}, ${confidence}, 'cold',
                ${result.url}, ${states[0]}, ${city || null}, 1, NOW()
              )
            `;
          }

          laneResult.kept++;

          // Stop if we have enough results for this ICP
          if (laneResult.kept >= results_per_icp) break;
        }

        if (laneResult.kept >= results_per_icp) break;
      }

      lanes.push(laneResult);
    }

    const totalKept = lanes.reduce((sum, lane) => sum + lane.kept, 0);
    const totalDropped = lanes.reduce((sum, lane) => sum + lane.dropped, 0);

    return res.status(200).json({
      run_id: runId,
      status: 'completed',
      lanes,
      total_kept: totalKept,
      total_dropped: totalDropped
    });

  } catch (error: any) {
    console.error('REI ICP Execute error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
