// Readiness scoring algorithm
// Calculates pass likelihood based on recent quiz performance

export function calculateReadinessScore(results) {
  if (!Array.isArray(results) || results.length === 0) return 0;

  // Use last 5 quizzes, weighted by recency
  const recent = results.slice(0, 5);
  const weights = [0.35, 0.25, 0.20, 0.12, 0.08];

  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < recent.length; i++) {
    const pct = recent[i].pct || 0;
    const weight = weights[i] || 0;
    weightedSum += pct * weight;
    weightSum += weight;
  }

  return Math.round(weightedSum / weightSum);
}

export function calculateForecast(readinessScore, daysRemaining) {
  // Forecast based on current score and time remaining
  if (daysRemaining <= 0) return 'exam_today';
  if (readinessScore >= 73) return 'likely_pass';
  if (readinessScore >= 65) return 'on_track';
  if (readinessScore >= 55) return 'needs_improvement';
  return 'at_risk';
}

export function getForecastMessage(forecast, daysRemaining) {
  const messages = {
    likely_pass: '✓ You\'re likely to pass on exam day',
    on_track: '→ You\'re on track to pass',
    needs_improvement: '⚠ You need to increase your study pace',
    at_risk: '⚠ Urgent: Focus on weak sections immediately',
    exam_today: '🎯 Good luck on your exam today!'
  };
  return messages[forecast] || '';
}

export function getReadinessColor(readinessScore) {
  if (readinessScore >= 73) return 'var(--green)';
  if (readinessScore >= 65) return 'var(--yellow)';
  if (readinessScore >= 55) return 'var(--orange)';
  return 'var(--red)';
}
