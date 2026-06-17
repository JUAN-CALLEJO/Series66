import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DIAGNOSTIC_QUIZ } from '../data/diagnosticQuiz.js';

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
  const [diagnosticAnswers, setDiagnosticAnswers] = useState({});
  const [currentDiagnosticQuestion, setCurrentDiagnosticQuestion] = useState(0);

  // Calculate diagnostic score
  const diagnosticScore = useMemo(() => {
    let correct = 0;
    DIAGNOSTIC_QUIZ.forEach((q, i) => {
      if (diagnosticAnswers[i] === q.correct) correct++;
    });
    return Math.round((correct / DIAGNOSTIC_QUIZ.length) * 100);
  }, [diagnosticAnswers]);

  // Identify weak sections (< 70% on a section)
  const weakSections = useMemo(() => {
    const sections = { I: { correct: 0, total: 0 }, II: { correct: 0, total: 0 }, III: { correct: 0, total: 0 }, IV: { correct: 0, total: 0 } };
    DIAGNOSTIC_QUIZ.forEach((q, i) => {
      sections[q.sec].total++;
      if (diagnosticAnswers[i] === q.correct) sections[q.sec].correct++;
    });
    return Object.entries(sections)
      .filter(([_, data]) => (data.correct / data.total) < 0.7)
      .map(([sec, _]) => sec);
  }, [diagnosticAnswers]);

  const handleAnswerDiagnostic = (questionIndex, answerIndex) => {
    setDiagnosticAnswers({ ...diagnosticAnswers, [questionIndex]: answerIndex });
  };

  const nextDiagnosticQuestion = () => {
    if (currentDiagnosticQuestion < DIAGNOSTIC_QUIZ.length - 1) {
      setCurrentDiagnosticQuestion(currentDiagnosticQuestion + 1);
    } else {
      setStep(6);
    }
  };

  const prevDiagnosticQuestion = () => {
    if (currentDiagnosticQuestion > 0) {
      setCurrentDiagnosticQuestion(currentDiagnosticQuestion - 1);
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else setStep(6);
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
      diagnosticScore,
      weakSections,
    });
  };

  // Step 1: Exam Date
  if (step === 1) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>When's your exam date?</h2>
            <p className="step-counter">Step 1 of 6</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '16%' }} />
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
            <p className="step-counter">Step 2 of 6</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '32%' }} />
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
            <p className="step-counter">Step 3 of 6</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '48%' }} />
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
            <p className="step-counter">Step 4 of 6</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: '64%' }} />
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

  // Step 5: Diagnostic Quiz
  if (step === 5) {
    const q = DIAGNOSTIC_QUIZ[currentDiagnosticQuestion];
    const isAnswered = diagnosticAnswers[currentDiagnosticQuestion] !== undefined;
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>Quick assessment</h2>
            <p className="step-counter">Question {currentDiagnosticQuestion + 1} of {DIAGNOSTIC_QUIZ.length}</p>
          </div>
          <div className="onboarding-progress-bar" style={{ width: `${((currentDiagnosticQuestion + 1) / DIAGNOSTIC_QUIZ.length) * 100}%` }} />
          <div className="onboarding-body">
            <p className="onboarding-question">{q.q}</p>
            <div className="onboarding-options">
              {q.opts.map((opt, i) => (
                <label key={i} className={`onboarding-option ${diagnosticAnswers[currentDiagnosticQuestion] === i ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`q${currentDiagnosticQuestion}`}
                    value={i}
                    checked={diagnosticAnswers[currentDiagnosticQuestion] === i}
                    onChange={() => handleAnswerDiagnostic(currentDiagnosticQuestion, i)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="onboarding-footer">
            <button className="btn ghost" onClick={prevDiagnosticQuestion} disabled={currentDiagnosticQuestion === 0}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn" onClick={nextDiagnosticQuestion} disabled={!isAnswered}>
              {currentDiagnosticQuestion === DIAGNOSTIC_QUIZ.length - 1 ? 'Review' : 'Next'} <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 6: Review & Confirm
  if (step === 6) {
    return (
      <div className="onboarding-scrim">
        <motion.div className="onboarding-modal" variants={stepVariants} initial="hidden" animate="show" exit="exit">
          <div className="onboarding-header">
            <h2>Your study plan</h2>
            <p className="step-counter">Step 6 of 6</p>
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
              <div className="review-row">
                <span>Diagnostic score:</span>
                <strong style={{ color: diagnosticScore >= 70 ? 'var(--green)' : diagnosticScore >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                  {diagnosticScore}%
                </strong>
              </div>
              {weakSections.length > 0 && (
                <div className="review-row">
                  <span>Focus areas:</span>
                  <strong>Section{weakSections.length > 1 ? 's' : ''} {weakSections.join(', ')}</strong>
                </div>
              )}
            </div>
            <p style={{ marginTop: 18, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
              We'll create a personalized daily schedule based on your exam date and available study time.
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
