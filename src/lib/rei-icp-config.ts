export type REIICPType = 'wholesaler' | 'flipper' | 'buy_hold' | 'agent' | 'institutional';

export type REIStrategyId = 'balanced' | 'role_focused' | 'fresh_sources' | 'aggressive_geo';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type IntentHeat = 'cold' | 'warm' | 'hot';

export interface ICPConfig {
  id: REIICPType;
  label: string;
  entity_type: 'people';
  includeDomains: string[];
  allowUrlPatterns: string[];
  blockUrlPatterns: string[];
  positive_keywords: string[];
  role_titles: string[];
  negative_keywords: string[];
  scoring_rules: {
    keyword_match: number;
    role_match: number;
    geo_match: number;
    coaching_penalty: number;
    wrong_industry_penalty: number;
  };
  score_thresholds: {
    keep: number;
    low_confidence: number;
    drop: number;
  };
}

export const REI_ICP_CONFIG: Record<REIICPType, ICPConfig> = {
  wholesaler: {
    id: 'wholesaler',
    label: 'Wholesalers',
    entity_type: 'people',
    includeDomains: ['linkedin.com'],
    allowUrlPatterns: ['linkedin.com/in/'],
    blockUrlPatterns: ['linkedin.com/company', 'linkedin.com/jobs', 'linkedin.com/learning'],
    positive_keywords: [
      'wholesaler', 'wholesale real estate', 'assignment investor', 'contract flipper',
      'acquisitions', 'dispositions', 'dispo', 'deal sourcer', 'bird dog',
      'direct to seller', 'off market', 'motivated seller', 'distressed property',
      'assignment contract', 'wholesale deal', 'off-market deal', 'creative finance'
    ],
    role_titles: [
      'Wholesaler', 'Real Estate Wholesaler', 'Acquisitions Manager', 'Dispositions Manager',
      'Deal Sourcer', 'Real Estate Investor', 'Investment Property Specialist'
    ],
    negative_keywords: [
      'coach', 'mentor', 'course', 'academy', 'training', 'guru', 'mastermind',
      'commercial real estate', 'mortgage broker', 'loan officer'
    ],
    scoring_rules: {
      keyword_match: 2,
      role_match: 2,
      geo_match: 1,
      coaching_penalty: -3,
      wrong_industry_penalty: -2
    },
    score_thresholds: { keep: 4, low_confidence: 2, drop: 1 }
  },

  flipper: {
    id: 'flipper',
    label: 'Flippers',
    entity_type: 'people',
    includeDomains: ['linkedin.com'],
    allowUrlPatterns: ['linkedin.com/in/'],
    blockUrlPatterns: ['linkedin.com/company', 'linkedin.com/jobs', 'linkedin.com/learning'],
    positive_keywords: [
      'house flipper', 'fix and flip', 'flip investor', 'property flipper',
      'rehab', 'renovation', 'rehabber', 'renovation investor',
      'fixer upper', 'distressed home', 'value-add property',
      'flip project', 'rehab project', 'renovation deal'
    ],
    role_titles: [
      'House Flipper', 'Fix and Flip Investor', 'Renovation Specialist',
      'Real Estate Rehabber', 'Property Renovator', 'Real Estate Investor'
    ],
    negative_keywords: [
      'coach', 'mentor', 'course', 'academy', 'training', 'guru', 'mastermind',
      'commercial real estate', 'interior designer'
    ],
    scoring_rules: {
      keyword_match: 2,
      role_match: 2,
      geo_match: 1,
      coaching_penalty: -3,
      wrong_industry_penalty: -2
    },
    score_thresholds: { keep: 4, low_confidence: 2, drop: 1 }
  },

  buy_hold: {
    id: 'buy_hold',
    label: 'Buy & Hold / Landlords',
    entity_type: 'people',
    includeDomains: ['linkedin.com'],
    allowUrlPatterns: ['linkedin.com/in/'],
    blockUrlPatterns: ['linkedin.com/company', 'linkedin.com/jobs', 'linkedin.com/learning'],
    positive_keywords: [
      'landlord', 'buy and hold', 'rental investor', 'property owner',
      'rental portfolio', 'multifamily investor', 'passive investor',
      'cash flow investor', 'BRRRR', 'long-term hold', 'income property',
      'portfolio owner', 'multi-property owner', 'real estate portfolio'
    ],
    role_titles: [
      'Landlord', 'Rental Property Investor', 'Buy and Hold Investor',
      'Portfolio Owner', 'Multifamily Investor', 'Passive Real Estate Investor'
    ],
    negative_keywords: [
      'coach', 'mentor', 'course', 'academy', 'training', 'guru', 'mastermind',
      'property manager', 'property management company'
    ],
    scoring_rules: {
      keyword_match: 2,
      role_match: 2,
      geo_match: 1,
      coaching_penalty: -3,
      wrong_industry_penalty: -2
    },
    score_thresholds: { keep: 4, low_confidence: 2, drop: 1 }
  },

  agent: {
    id: 'agent',
    label: 'Real Estate Agents',
    entity_type: 'people',
    includeDomains: ['linkedin.com'],
    allowUrlPatterns: ['linkedin.com/in/'],
    blockUrlPatterns: ['linkedin.com/company', 'linkedin.com/jobs', 'linkedin.com/learning'],
    positive_keywords: [
      'realtor', 'real estate agent', 'broker', 'real estate professional',
      'listing agent', 'buyer agent', 'investment property agent',
      'residential real estate', 'investor-friendly agent', 'REO specialist',
      'team lead', 'top producer', 'broker associate'
    ],
    role_titles: [
      'Realtor', 'Real Estate Agent', 'Real Estate Broker', 'Listing Agent',
      'Buyer Agent', 'Real Estate Professional', 'Licensed Real Estate Agent'
    ],
    negative_keywords: [
      'coach', 'mentor', 'course', 'academy', 'training', 'guru', 'mastermind',
      'mortgage broker', 'loan officer', 'escrow officer'
    ],
    scoring_rules: {
      keyword_match: 2,
      role_match: 2,
      geo_match: 1,
      coaching_penalty: -3,
      wrong_industry_penalty: -2
    },
    score_thresholds: { keep: 4, low_confidence: 2, drop: 1 }
  },

  institutional: {
    id: 'institutional',
    label: 'Institutional / Hedge Fund',
    entity_type: 'people',
    includeDomains: ['linkedin.com'],
    allowUrlPatterns: ['linkedin.com/in/'],
    blockUrlPatterns: ['linkedin.com/company', 'linkedin.com/jobs', 'linkedin.com/learning'],
    positive_keywords: [
      'institutional investor', 'hedge fund', 'private equity', 'family office',
      'fund manager', 'asset manager', 'portfolio manager', 'CIO',
      'build-to-rent', 'SFR portfolio', 'bulk acquisitions', 'institutional capital',
      'large scale investor', 'portfolio acquisition', 'bulk buyer'
    ],
    role_titles: [
      'Fund Manager', 'Asset Manager', 'Portfolio Manager', 'CIO',
      'VP Acquisitions', 'Director of Acquisitions', 'Investment Manager',
      'Real Estate Fund Manager', 'Principal'
    ],
    negative_keywords: [
      'coach', 'mentor', 'course', 'academy', 'training', 'guru', 'mastermind',
      'financial advisor', 'wealth advisor'
    ],
    scoring_rules: {
      keyword_match: 2,
      role_match: 2,
      geo_match: 1,
      coaching_penalty: -3,
      wrong_industry_penalty: -2
    },
    score_thresholds: { keep: 4, low_confidence: 2, drop: 1 }
  }
};

export const REI_STRATEGIES: { id: REIStrategyId; label: string; description: string }[] = [
  { id: 'balanced', label: 'Balanced', description: 'Mix of targeted and discovery queries' },
  { id: 'role_focused', label: 'Role Focused', description: 'Prioritize specific job titles' },
  { id: 'fresh_sources', label: 'Fresh Sources', description: 'Emphasize new discovery' },
  { id: 'aggressive_geo', label: 'Aggressive Geo', description: 'Deep dive into specific locations' }
];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];
