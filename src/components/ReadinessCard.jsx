import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateReadinessScore, calculateForecast, getForecastMessage, getReadinessColor } from '../lib/readinessScore.js';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ReadinessCard({ results, onboardingData }) {
  if (!Array.isArray(results) || results.length === 0) {
    return (
      <motion.div className="card" variants={fadeIn} initial="hidden" animate="show" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <TrendingUp size={18} style={{ color: 'var(--text-3)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>EXAM READINESS</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Complete your first quiz to see your readiness score.
        </p>
      </motion.div>
    );
  }

  const readinessScore = calculateReadinessScore(results);
  const examDate = onboardingData?.examDate ? new Date(onboardingData.examDate) : null;
  const today = new Date();
  const daysRemaining = examDate ? Math.floor((examDate - today) / (1000 * 60 * 60 * 24)) : 0;
  const forecast = calculateForecast(readinessScore, daysRemaining);
  const forecastMessage = getForecastMessage(forecast, daysRemaining);
  const scoreColor = getReadinessColor(readinessScore);

  // Trend: compare last 3 quizzes to previous 3
  const recent = results.slice(0, 3);
  const previous = results.slice(3, 6);
  const recentAvg = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + r.pct, 0) / recent.length) : 0;
  const prevAvg = previous.length > 0 ? Math.round(previous.reduce((s, r) => s + r.pct, 0) / previous.length) : 0;
  const trend = recentAvg > prevAvg ? 'up' : recentAvg < prevAvg ? 'down' : 'stable';
  const trendSymbol = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '→';

  return (
    <motion.div className="card" variants={fadeIn} initial="hidden" animate="show" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <TrendingUp size={18} style={{ color: scoreColor }} />
        <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>EXAM READINESS</span>
      </div>

      {/* Score Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Score */}
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: scoreColor, marginBottom: 4 }}>
            {readinessScore}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>/ 100</div>
        </div>

        {/* Trend */}
        <div>
          <div style={{ fontSize: 28, marginBottom: 4 }}>
            {trendSymbol}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
          </div>
        </div>
      </div>

      {/* Forecast Status */}
      <div style={{
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        background: scoreColor === 'var(--green)' ? 'var(--success-soft)' :
                   scoreColor === 'var(--yellow)' ? 'var(--warning-soft)' :
                   'var(--danger-soft)',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}>
        <div style={{ marginTop: 1 }}>
          {scoreColor === 'var(--green)' && <CheckCircle size={16} style={{ color: 'var(--green)' }} />}
          {scoreColor !== 'var(--green)' && <AlertCircle size={16} style={{ color: scoreColor }} />}
        </div>
        <div style={{ fontSize: 13, color: scoreColor, fontWeight: 500 }}>
          {forecastMessage}
        </div>
      </div>

      {/* Details */}
      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        <div>
          Based on {results.length} quiz{results.length !== 1 ? 'zes' : ''} • {daysRemaining} days to exam
        </div>
        {readinessScore < 73 && (
          <div style={{ marginTop: 8, color: 'var(--text-2)' }}>
            💡 Focus on <strong>Section IV (Laws & Ethics)</strong> — highest value on exam
          </div>
        )}
      </div>
    </motion.div>
  );
}
