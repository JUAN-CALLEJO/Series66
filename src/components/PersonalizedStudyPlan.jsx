import { motion } from 'framer-motion';
import { CalendarDays, Zap, TrendingUp, CheckCircle } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export function PersonalizedStudyPlan({ plan, onboardingData, go }) {
  if (!plan || !plan.plan || plan.plan.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-3)' }}>No plan generated yet. Complete onboarding to get started.</p>
      </div>
    );
  }

  const examDate = new Date(onboardingData?.examDate);
  const today = new Date();
  const daysUntilExam = Math.floor((examDate - today) / (1000 * 60 * 60 * 24));
  const todayPlan = plan.plan[0]; // First day is today
  const upcomingDays = plan.plan.slice(0, 7); // Next 7 days

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <motion.div className="card" variants={fadeIn} initial="hidden" animate="show">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>Your personalized study plan</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Customized for {onboardingData?.knowledgeLevel || 'your level'}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13 }}>
            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{daysUntilExam} days left</div>
            <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Exam {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>
      </motion.div>

      {/* Today's Goal */}
      {todayPlan && (
        <motion.div
          className="card"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          custom={1}
          style={{ borderLeft: '4px solid var(--primary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Zap size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>TODAY'S GOAL</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
                {todayPlan.target.questionsCount}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>questions</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
                ~{todayPlan.target.estimatedMinutes}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>minutes</div>
            </div>
          </div>
          <button
            className="btn"
            onClick={() => go('practice')}
            style={{ marginTop: 16, width: '100%' }}
          >
            Start studying →
          </button>
        </motion.div>
      )}

      {/* Upcoming Week */}
      <motion.div
        className="card"
        variants={fadeIn}
        initial="hidden"
        animate="show"
        custom={2}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Next 7 days</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcomingDays.map((day, i) => {
            const dayDate = new Date(day.date);
            const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const isToday = i === 0;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: isToday ? 'var(--primary-soft)' : 'var(--surface-2)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: isToday ? '1px solid var(--primary)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => !isToday && (e.currentTarget.style.background = 'var(--surface-3)')}
                onMouseLeave={(e) => !isToday && (e.currentTarget.style.background = 'var(--surface-2)')}
              >
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>{isToday ? 'Today' : dayName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {day.target.questionsCount} Qs
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {day.target.estimatedMinutes} min
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Exam Readiness Info */}
      <motion.div
        className="card"
        variants={fadeIn}
        initial="hidden"
        animate="show"
        custom={3}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your pace</h3>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          <p>
            At {onboardingData?.studyTimeHours} hour{onboardingData?.studyTimeHours > 1 ? 's' : ''} per day, you'll complete ~{Math.round(plan.plan[0]?.target.questionsCount * daysUntilExam)} questions.
          </p>
          <p style={{ marginTop: 8, color: 'var(--green)', fontWeight: 500 }}>
            ✓ You're on track to be exam-ready by {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Study Tips */}
      <motion.div
        className="card"
        variants={fadeIn}
        initial="hidden"
        animate="show"
        custom={4}
        style={{ background: 'var(--surface-2)' }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Pro tips</h3>
        <ul style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.8, paddingLeft: 20 }}>
          <li>Study at the same time each day to build a habit</li>
          <li>Review missed questions before moving to new material</li>
          <li>Take full-length mock exams every 2 weeks to track progress</li>
        </ul>
      </motion.div>
    </div>
  );
}
