// Study plan generation algorithm
// Input: onboarding data → Output: personalized daily schedule

export function generateStudyPlan({ examDate, knowledgeLevel, studyTimeHours, learningStyle }) {
  const today = new Date();
  const exam = new Date(examDate);
  const daysRemaining = Math.floor((exam - today) / (1000 * 60 * 60 * 24));

  // Validate inputs
  if (daysRemaining < 1) {
    return { error: 'Exam date must be in the future' };
  }

  const TOTAL_QUESTIONS = 342;
  const MINUTES_PER_QUESTION = 6;

  // Pace multiplier based on knowledge level
  const paceMultiplier = {
    'Advanced': 0.7,
    'Intermediate': 1.0,
    'Beginner': 1.5,
  }[knowledgeLevel] || 1.0;

  // Calculate study targets
  const totalMinutesAvailable = daysRemaining * studyTimeHours * 60 * 0.8; // 20% buffer
  const totalMinutesNeeded = TOTAL_QUESTIONS * MINUTES_PER_QUESTION;
  const adjustedMinutesNeeded = totalMinutesNeeded * paceMultiplier;

  // If not enough time, compress schedule
  const questionsPerDay = Math.ceil(TOTAL_QUESTIONS / daysRemaining);
  const adjustedQuestionsPerDay = Math.ceil(questionsPerDay * paceMultiplier);

  // Section weights (official exam structure)
  const sectionWeights = {
    'I': 0.08,   // 8% - Economic factors
    'II': 0.17,  // 17% - Investment vehicles
    'III': 0.30, // 30% - Client recommendations
    'IV': 0.45,  // 45% - Laws & ethics
  };

  // Generate daily plan
  const plan = [];
  let questionsAssigned = 0;

  for (let day = 1; day <= daysRemaining; day++) {
    const daysLeft = daysRemaining - day + 1;
    const dailyTarget = Math.max(
      Math.ceil((TOTAL_QUESTIONS - questionsAssigned) / daysLeft),
      1
    );

    // Allocate questions by section (prioritize Section IV, then III)
    const sectionAllocation = {
      'I': Math.ceil(dailyTarget * sectionWeights['I']),
      'II': Math.ceil(dailyTarget * sectionWeights['II']),
      'III': Math.ceil(dailyTarget * sectionWeights['III']),
      'IV': Math.ceil(dailyTarget * sectionWeights['IV']),
    };

    // Adjust for rounding
    const allocated = Object.values(sectionAllocation).reduce((a, b) => a + b, 0);
    if (allocated > dailyTarget) {
      sectionAllocation['I']--; // Reduce section I first
    }

    const date = new Date(today);
    date.setDate(date.getDate() + day - 1);

    plan.push({
      day,
      date: date.toISOString().split('T')[0],
      target: {
        questionsCount: dailyTarget,
        estimatedMinutes: Math.round(dailyTarget * MINUTES_PER_QUESTION),
        sectionAllocation,
      },
      focus: 'balanced', // Will be overridden in Week 3 with weak section focus
      milestone: {
        daysRemaining: daysLeft,
        progressPct: Math.round((questionsAssigned / TOTAL_QUESTIONS) * 100),
      },
    });

    questionsAssigned += dailyTarget;
  }

  return {
    examDate,
    knowledgeLevel,
    studyTimeHours,
    learningStyle,
    daysRemaining,
    generatedAt: new Date().toISOString(),
    plan,
  };
}
