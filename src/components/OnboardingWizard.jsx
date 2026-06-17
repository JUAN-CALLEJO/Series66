import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [examDate, setExamDate] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState('');
  const [studyTimeHours, setStudyTimeHours] = useState('');
  const [learningStyle, setLearningStyle] = useState('');

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else setStep(5); // Review step
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete({
      examDate,
      knowledgeLevel,
      studyTimeHours: parseInt(studyTimeHours),
      learningStyle,
    });
  };

  // Step 1: Exam Date
  if (step === 1) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>When's your exam date?</h2>
            <p className="step-counter">Step 1 of 5</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '20%' }} />
          <div className="onboarding-body">
            <p className="onboarding-label">Choose your target exam date</p>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="onboarding-input"
              style={{ fontSize: 16 }}
            />
          </div>
          <div className="onboarding-footer">
            <button className="btn ghost" onClick={handlePrev} disabled>
              Back
            </button>
            <button className="btn" onClick={handleNext} disabled={!examDate}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 2: Knowledge Level
  if (step === 2) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>What's your current level?</h2>
            <p className="step-counter">Step 2 of 5</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '40%' }} />
          <div className="onboarding-body">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <label key={level} className={`onboarding-radio ${knowledgeLevel === level ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="knowledge"
                  value={level}
                  checked={knowledgeLevel === level}
                  onChange={(e) => setKnowledgeLevel(e.target.value)}
                />
                <span className="radio-label">{level}</span>
              </label>
            ))}
          </div>
          <div className="onboarding-footer">
            <button className="btn ghost" onClick={handlePrev}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn" onClick={handleNext} disabled={!knowledgeLevel}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 3: Study Time
  if (step === 3) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>How much can you study daily?</h2>
            <p className="step-counter">Step 3 of 5</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '60%' }} />
          <div className="onboarding-body">
            {['1', '2', '3'].map((hours) => (
              <label key={hours} className={`onboarding-radio ${studyTimeHours === hours ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="studyTime"
                  value={hours}
                  checked={studyTimeHours === hours}
                  onChange={(e) => setStudyTimeHours(e.target.value)}
                />
                <span className="radio-label">{hours} hour{hours > 1 ? 's' : ''} per day</span>
              </label>
            ))}
          </div>
          <div className="onboarding-footer">
            <button className="btn ghost" onClick={handlePrev}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn" onClick={handleNext} disabled={!studyTimeHours}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 4: Learning Style
  if (step === 4) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>How do you learn best?</h2>
            <p className="step-counter">Step 4 of 5</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '80%' }} />
          <div className="onboarding-body">
            {['Visual', 'Text-heavy', 'Hands-on', 'Mixed'].map((style) => (
              <label key={style} className={`onboarding-radio ${learningStyle === style ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="style"
                  value={style}
                  checked={learningStyle === style}
                  onChange={(e) => setLearningStyle(e.target.value)}
                />
                <span className="radio-label">{style}</span>
              </label>
            ))}
          </div>
          <div className="onboarding-footer">
            <button className="btn ghost" onClick={handlePrev}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn" onClick={handleNext} disabled={!learningStyle}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 5: Review & Confirm
  if (step === 5) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>Ready to begin?</h2>
            <p className="step-counter">Step 5 of 5</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '100%' }} />
          <div className="onboarding-body">
            <div className="review-summary">
              <div className="review-row">
                <span>Exam date:</span>
                <strong>{new Date(examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div className="review-row">
                <span>Knowledge level:</span>
                <strong>{knowledgeLevel}</strong>
              </div>
              <div className="review-row">
                <span>Daily study time:</span>
                <strong>{studyTimeHours} hour{studyTimeHours > 1 ? 's' : ''}</strong>
              </div>
              <div className="review-row">
                <span>Learning style:</span>
                <strong>{learningStyle}</strong>
              </div>
            </div>
            <p style={{ marginTop: 18, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
              We'll create a personalized daily schedule tailored to your exam date and available study time.
            </p>
          </div>
          <div className="onboarding-footer">
            <button className="btn ghost" onClick={handlePrev}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn" onClick={handleComplete}>
              Create my plan ✓
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
}
