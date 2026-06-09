// Full-length mock exam definitions + a weighted question assembler.
// Each attempt draws a fresh weighted sample from the shared question bank,
// matching the official section weighting (8 / 17 / 30 / 45).
import { QUESTIONS } from './questions.js';
import { SECTIONS } from './curriculum.js';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const WEIGHTS = SECTIONS.reduce((m, s) => ((m[s.id] = s.weight), m), {});

// Build a weighted exam of `size` questions matching section weightings.
export function buildExam(size = 100) {
  const ids = Object.keys(WEIGHTS);
  // target count per section
  const targets = {};
  let assigned = 0;
  ids.forEach((id) => {
    targets[id] = Math.round((WEIGHTS[id] / 100) * size);
    assigned += targets[id];
  });
  // fix rounding drift on the largest section (IV)
  targets.IV += size - assigned;

  let pool = [];
  ids.forEach((id) => {
    const secQs = QUESTIONS.filter((q) => q.sec === id);
    const take = Math.min(targets[id], secQs.length);
    pool = pool.concat(shuffle(secQs).slice(0, take));
  });
  return shuffle(pool);
}

export const MOCK_EXAMS = [
  {
    id: 'mock-1', name: 'Full Mock Exam 1', size: 100, minutes: 150,
    desc: 'Full-length, weighted 8 / 17 / 30 / 45 across all four sections.', level: 'Exam-realistic',
  },
  {
    id: 'mock-2', name: 'Full Mock Exam 2', size: 100, minutes: 150,
    desc: 'A fresh weighted draw — a different paper every attempt.', level: 'Exam-realistic',
  },
  {
    id: 'mock-3', name: 'Full Mock Exam 3', size: 100, minutes: 150,
    desc: 'Simulate test-day conditions: 100 questions, 150 minutes.', level: 'Exam-realistic',
  },
  {
    id: 'mock-4', name: 'Full Mock Exam 4', size: 100, minutes: 150,
    desc: 'Final readiness check before your exam date.', level: 'Exam-realistic',
  },
  {
    id: 'half-1', name: 'Half-Length Sprint', size: 50, minutes: 75,
    desc: 'A shorter timed exam when you only have an hour.', level: 'Quick check',
  },
  {
    id: 'diag-1', name: 'Diagnostic (25)', size: 25, minutes: 35,
    desc: 'Fast baseline across all sections to find weak spots.', level: 'Baseline',
  },
];
