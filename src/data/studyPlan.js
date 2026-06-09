// A detailed 3-week (21-day) Series 66 study plan.
// Time is weighted toward the heaviest sections: Laws (45%) and
// Client Recommendations (30%). Each day links to relevant content.
// `sec` colors the day to the primary section; `link` optionally
// targets a topic id or a special view (quiz:<sec>, missed, plan).

export const STUDY_PLAN = {
  durationLabel: '3-Week Plan',
  totalDays: 21,
  weeks: [
    {
      week: 1,
      label: 'Week 1',
      theme: 'Laws & Ethics (45%) + Economic Foundations (8%)',
      days: [
        {
          day: 1, sec: 'IV', focus: 'Exam logistics + Regulation of Investment Advisers',
          sub: 'How the exam works; who is an IA; federal vs. state; Form ADV',
          tasks: [
            { t: 'Read the Dashboard exam facts (110 Qs, 73 to pass, 150 min)', link: 'dashboard' },
            { t: 'Study "Regulation of Investment Advisers"', link: 'IV-1' },
            { t: 'Memorize the three-part IA test and the $100M / $110M thresholds' },
          ],
        },
        {
          day: 2, sec: 'IV', focus: 'IA books & records + Regulation of IARs',
          sub: 'Brochure rule, recordkeeping, IAR registration & CE',
          tasks: [
            { t: 'Study "Regulation of Investment Adviser Representatives"', link: 'IV-2' },
            { t: 'Learn the de minimis (≤5 clients) rule and IAR CE (6+6 credits)' },
            { t: 'Flashcards: Section IV terms', link: 'flash:IV' },
          ],
        },
        {
          day: 3, sec: 'IV', focus: 'Broker-Dealers + Agents',
          sub: 'BD vs. agent definitions, Form BD/U4, exclusions, supervision',
          tasks: [
            { t: 'Study "Regulation of Broker-Dealers"', link: 'IV-3' },
            { t: 'Study "Regulation of Agents of Broker-Dealers"', link: 'IV-4' },
            { t: 'Note the BD state-definition exclusions (no place of business + institutional only)' },
          ],
        },
        {
          day: 4, sec: 'IV', focus: 'Securities & Issuers',
          sub: 'Definition of a security, Howey, registration methods, Reg D, accredited investor',
          tasks: [
            { t: 'Study "Regulation of Securities & Issuers"', link: 'IV-5' },
            { t: 'Distinguish exempt securities vs. exempt transactions' },
            { t: 'Memorize accredited-investor thresholds and 506(b) vs. 506(c)' },
          ],
        },
        {
          day: 5, sec: 'IV', focus: 'Remedies & Administrative Provisions',
          sub: 'Administrator powers, actions, penalties, statute of limitations',
          tasks: [
            { t: 'Study "Remedies & Administrative Provisions"', link: 'IV-6' },
            { t: 'Memorize: 3 years / $5,000 criminal; 2-yr discovery / 3-yr sale civil SOL' },
            { t: 'Understand rescission vs. cease-and-desist vs. stop order' },
          ],
        },
        {
          day: 6, sec: 'IV', focus: 'Communication + Ethics & Fiduciary Duty',
          sub: 'Disclosures, advertising, custody, soft dollars, prohibited practices',
          tasks: [
            { t: 'Study "Communication with Clients & Prospects"', link: 'IV-7' },
            { t: 'Study "Ethical Practices & Fiduciary Obligations"', link: 'IV-8' },
            { t: 'List the prohibited practices (churning, selling away, front-running, etc.)' },
          ],
        },
        {
          day: 7, sec: 'I', focus: 'Economic Factors + Section IV checkpoint',
          sub: 'TVM, statistics, ratios; then test the big Laws section',
          tasks: [
            { t: 'Study all of Section I (TVM, statistics, financial & valuation ratios)', link: 'I-1' },
            { t: 'Take a Section IV practice quiz', link: 'quiz:IV' },
            { t: 'Review any missed questions', link: 'missed' },
          ],
        },
      ],
    },
    {
      week: 2,
      label: 'Week 2',
      theme: 'Investment Vehicles (17%) + Client Recommendations (30%)',
      days: [
        {
          day: 8, sec: 'II', focus: 'Cash equivalents + Fixed income',
          sub: 'Money markets; duration, YTM/YTC, ratings, premium/discount',
          tasks: [
            { t: 'Study "Cash & Cash Equivalents"', link: 'II-1' },
            { t: 'Study "Fixed-Income Securities & Valuation"', link: 'II-2' },
            { t: 'Master the premium/discount yield ordering' },
          ],
        },
        {
          day: 9, sec: 'II', focus: 'Equities + Public offerings',
          sub: 'Common/preferred, valuation, shareholder rights, IPO/SPAC',
          tasks: [
            { t: 'Study equity topics II-3, II-4, II-5', link: 'II-3' },
            { t: 'Study "Equity Public Offerings"', link: 'II-6' },
            { t: 'Flashcards: Section II terms', link: 'flash:II' },
          ],
        },
        {
          day: 10, sec: 'II', focus: 'Pooled investments',
          sub: 'Funds, ETFs, REITs, UITs; share classes, fees, NAV',
          tasks: [
            { t: 'Study "Pooled Investments: Types"', link: 'II-7' },
            { t: 'Study "Pooled Investments: Characteristics & Fees"', link: 'II-8' },
            { t: 'Compare open-end vs. closed-end vs. ETF pricing' },
          ],
        },
        {
          day: 11, sec: 'II', focus: 'Derivatives, alternatives, insurance + checkpoint',
          sub: 'Options/futures, leveraged/inverse/ETN, annuities & life, digital assets',
          tasks: [
            { t: 'Study topics II-9 through II-12', link: 'II-9' },
            { t: 'Take a Section II practice quiz', link: 'quiz:II' },
            { t: 'Review missed questions', link: 'missed' },
          ],
        },
        {
          day: 12, sec: 'III', focus: 'Client types + profile + capital market theory',
          sub: 'Entities, suitability, CAPM/MPT/EMH',
          tasks: [
            { t: 'Study topics III-1, III-2', link: 'III-1' },
            { t: 'Study "Capital Market Theory"', link: 'III-3' },
            { t: 'Be able to rank objectives by risk and explain the EMH forms' },
          ],
        },
        {
          day: 13, sec: 'III', focus: 'Strategies, trading & performance',
          sub: 'Allocation, styles, DCA; order types; return measures',
          tasks: [
            { t: 'Study "Portfolio Strategies, Styles & Techniques"', link: 'III-4' },
            { t: 'Study "Trading Securities" and "Portfolio Performance Measures"', link: 'III-10' },
            { t: 'Distinguish time-weighted vs. dollar-weighted return' },
          ],
        },
        {
          day: 14, sec: 'III', focus: 'Tax, retirement, ERISA, accounts, estate + checkpoint',
          sub: 'The dense planning topics, then a Section III quiz',
          tasks: [
            { t: 'Study topics III-5 through III-9 (tax, retirement, ERISA, special accounts, estate)', link: 'III-5' },
            { t: 'Take a Section III practice quiz', link: 'quiz:III' },
            { t: 'Review missed questions', link: 'missed' },
          ],
        },
      ],
    },
    {
      week: 3,
      label: 'Week 3',
      theme: 'Integration, full practice exams & weak-area repair',
      days: [
        {
          day: 15, sec: 'IV', focus: 'Full practice test #1',
          sub: 'Simulate the exam; identify weakest sections',
          tasks: [
            { t: 'Take a full-length mixed practice test (all sections)', link: 'quiz:ALL' },
            { t: 'Record your score per section on the results screen' },
            { t: 'Note the 1–2 weakest sections for tomorrow' },
          ],
        },
        {
          day: 16, sec: 'III', focus: 'Drill misses + repair weakest section',
          sub: 'Targeted review of what you got wrong',
          tasks: [
            { t: 'Work the Review Missed Questions queue to empty', link: 'missed' },
            { t: 'Re-read the topics behind your most-missed questions' },
            { t: 'Re-quiz your weakest section', link: 'quiz:III' },
          ],
        },
        {
          day: 17, sec: 'IV', focus: 'Laws deep review (highest weight)',
          sub: '45% of the exam — make it your strongest area',
          tasks: [
            { t: 'Re-read all eight Section IV topics', link: 'IV-1' },
            { t: 'Flashcard blitz: Section IV', link: 'flash:IV' },
            { t: 'Re-quiz Section IV', link: 'quiz:IV' },
          ],
        },
        {
          day: 18, sec: 'III', focus: 'Client strategies deep review',
          sub: 'Taxation & retirement edge cases',
          tasks: [
            { t: 'Re-read tax, retirement, and estate topics', link: 'III-5' },
            { t: 'Flashcard blitz: Section III', link: 'flash:III' },
            { t: 'Re-quiz Section III', link: 'quiz:III' },
          ],
        },
        {
          day: 19, sec: 'II', focus: 'Full practice test #2',
          sub: 'Compare against test #1; confirm improvement',
          tasks: [
            { t: 'Take a second full-length mixed practice test', link: 'quiz:ALL' },
            { t: 'Compare section scores to test #1' },
            { t: 'Review missed questions', link: 'missed' },
          ],
        },
        {
          day: 20, sec: 'I', focus: 'Final sweep + formula recall',
          sub: 'Statistics, ratios, and all remaining misses',
          tasks: [
            { t: 'Empty the Review Missed Questions queue', link: 'missed' },
            { t: 'Recall key formulas: CAPM, Sharpe, current/quick ratio, P/E' },
            { t: 'Quick flashcard pass over Sections I & II', link: 'flash:I' },
          ],
        },
        {
          day: 21, sec: 'IV', focus: 'Light review, logistics & rest',
          sub: 'Be exam-ready and calm',
          tasks: [
            { t: 'Skim your weakest-area notes only — no cramming' },
            { t: 'Confirm exam time, location/online setup, and ID' },
            { t: 'Rest well — you are prepared.' },
          ],
        },
      ],
    },
  ],
};

export const TOTAL_PLAN_TASKS = STUDY_PLAN.weeks.reduce(
  (sum, w) => sum + w.days.reduce((s, d) => s + d.tasks.length, 0),
  0
);
