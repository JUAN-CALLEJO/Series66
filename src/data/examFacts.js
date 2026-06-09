// Authoritative facts from the official NASAA Series 66 Study Guide
// (Uniform Combined State Law Examination Overview, Sept 1 2023)
// and Test Specifications (effective June 12, 2023).

export const EXAM_FACTS = {
  totalQuestions: 110,
  scoredQuestions: 100,
  pretestQuestions: 10,
  passScore: 73, // of 100 scored
  passPct: 73,
  minutes: 150,
  format: 'Multiple choice, closed book',
  retakeWaits: '30 / 30 / 180 days',
  administeredBy: 'FINRA (via WebCRD / Test Enrollment Services)',
  window: '120-day scheduling window once enrolled',
  corequisite: 'Series 7 (for dual BD-agent + IAR registration)',
  sources: [
    'Investment Advisers Act of 1940 (IAA)',
    'Securities Exchange Act of 1934 (SEA)',
    'Securities Act of 1933 (SA)',
    'SEC rules & regulations',
    'FINRA rules',
    'Uniform Securities Act of 1956, as amended by NASAA (USA)',
    'NASAA Model Rules & Statements of Policy',
    'Uniform Prudent Investor Act',
  ],
};

export const QUICK_FACTS = [
  { v: '110', l: 'Total questions (100 scored)' },
  { v: '73', l: 'Correct answers to pass' },
  { v: '150', l: 'Minutes allowed' },
  { v: '4', l: 'Subject areas' },
];
