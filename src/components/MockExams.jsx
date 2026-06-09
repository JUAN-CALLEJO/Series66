import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock, ArrowRight, ArrowLeft, Flag, CheckCircle2, XCircle, Trophy,
  ListChecks, RotateCcw, AlertTriangle, ChevronDown,
} from 'lucide-react';
import { MOCK_EXAMS, buildExam } from '../data/mocks.js';
import { SECTIONS } from '../data/curriculum.js';
import { useApp } from '../context/AppData.jsx';

const SEC_META = SECTIONS.reduce((m, s) => ((m[s.id] = s), m), {});
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function MockExams() {
  const { results, recordResult } = useApp();
  const [phase, setPhase] = useState('list'); // list | exam | result
  const [exam, setExam] = useState(null); // {def, questions}
  const [answers, setAnswers] = useState([]);
  const [finalResult, setFinalResult] = useState(null);

  const mockHistory = results.filter((r) => r.kind === 'mock');

  const startExam = (def) => {
    const questions = buildExam(def.size);
    setExam({ def, questions });
    setAnswers(new Array(questions.length).fill(null));
    setFinalResult(null);
    setPhase('exam');
  };

  const submitExam = (finalAnswers, durationSec) => {
    const qs = exam.questions;
    let score = 0;
    const bySection = {};
    qs.forEach((q, i) => {
      bySection[q.sec] = bySection[q.sec] || { correct: 0, total: 0 };
      bySection[q.sec].total += 1;
      if (finalAnswers[i] === q.correct) {
        score += 1;
        bySection[q.sec].correct += 1;
      }
    });
    const result = {
      kind: 'mock', label: exam.def.name, score, total: qs.length, bySection, durationSec,
    };
    recordResult(result);
    setFinalResult({ ...result, answers: finalAnswers, questions: qs });
    setPhase('result');
  };

  if (phase === 'exam')
    return <ExamRunner exam={exam} answers={answers} setAnswers={setAnswers} onSubmit={submitExam} onAbort={() => setPhase('list')} />;
  if (phase === 'result')
    return <ExamResult result={finalResult} onRetake={() => startExam(exam.def)} onDone={() => setPhase('list')} />;

  return (
    <div>
      <h1 className="topic-title" style={{ fontSize: 23, marginBottom: 4 }}>Full Mock Exams</h1>
      <p className="muted" style={{ marginBottom: 20, maxWidth: '60ch' }}>
        Timed, exam-realistic simulations. Each is a fresh weighted draw (8 / 17 / 30 / 45) from the
        full question bank, scored against the real <b>73%</b> pass mark. Results are saved to your account.
      </p>

      <div className="mock-grid">
        {MOCK_EXAMS.map((m) => {
          const best = mockHistory.filter((r) => r.label === m.name).reduce((mx, r) => Math.max(mx, r.pct), -1);
          return (
            <div className="mock-card" key={m.id}>
              <div className="mock-card-top">
                <span className="mock-level">{m.level}</span>
                {best >= 0 && <span className={`mock-best${best >= 73 ? ' pass' : ''}`}>Best {best}%</span>}
              </div>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
              <div className="mock-meta">
                <span><ListChecks size={14} /> {m.size} questions</span>
                <span><Clock size={14} /> {m.minutes} min</span>
              </div>
              <button className="btn" style={{ width: '100%', marginTop: 14 }} onClick={() => startExam(m)}>
                Start exam <ArrowRight size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {mockHistory.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="kp-head" style={{ color: 'var(--primary)' }}><Trophy size={15} /> Recent mock attempts</div>
          <table className="tbl" style={{ marginTop: 8 }}>
            <thead><tr><th>Exam</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>
              {mockHistory.slice(0, 8).map((r) => (
                <tr key={r.id}>
                  <td>{r.label}</td>
                  <td>{r.score}/{r.total} ({r.pct}%)</td>
                  <td>
                    <span className="pill" style={{ background: r.passed ? 'rgba(43,217,168,.15)' : 'rgba(255,107,125,.15)', color: r.passed ? 'var(--green)' : 'var(--red)' }}>
                      {r.passed ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------- Timed exam runner ----------------
function ExamRunner({ exam, answers, setAnswers, onSubmit, onAbort }) {
  const { questions, def } = exam;
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(def.minutes * 60);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startRef = useRef(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          const dur = Math.round((Date.now() - startRef.current) / 1000);
          onSubmit(answersRef.current, dur);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[idx];
  const meta = SEC_META[q.sec];
  const answeredCount = answers.filter((a) => a !== null).length;
  const lowTime = secondsLeft <= 300;

  const pick = (i) => setAnswers((prev) => prev.map((a, k) => (k === idx ? i : a)));
  const finish = () => onSubmit(answers, Math.round((Date.now() - startRef.current) / 1000));

  return (
    <div className="exam-wrap" style={{ '--accent': meta.accent }}>
      <div className="exam-bar">
        <div className={`exam-timer${lowTime ? ' low' : ''}`}>
          <Clock size={16} /> {fmt(secondsLeft)}
        </div>
        <div className="exam-title">{def.name}</div>
        <div className="exam-count">{answeredCount}/{questions.length} answered</div>
        <button className="btn sm" onClick={() => setConfirmSubmit(true)}>Submit exam</button>
      </div>

      <div className="exam-body">
        <div className="exam-main">
          <div className="qtag" style={{ color: meta.accent }}>Question {idx + 1} · Section {meta.roman}</div>
          <div className="qtext">{q.q}</div>
          <div className="qopts">
            {q.opts.map((opt, i) => (
              <button key={i} className={`qopt${answers[idx] === i ? ' picked' : ''}`} onClick={() => pick(i)}>
                <span className="key">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
          <div className="exam-nav">
            <button className="btn ghost sm" disabled={idx === 0} onClick={() => setIdx((n) => n - 1)}>
              <ArrowLeft size={15} /> Previous
            </button>
            <button className="btn ghost sm" onClick={() => pick(null)}>Clear</button>
            <button className="btn sm" disabled={idx === questions.length - 1} onClick={() => setIdx((n) => n + 1)}>
              Next <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="exam-palette">
          <div className="palette-head">Question navigator</div>
          <div className="palette-grid">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`pal${answers[i] !== null ? ' done' : ''}${i === idx ? ' cur' : ''}`}
                onClick={() => setIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="palette-legend">
            <span><i className="dot done" /> Answered</span>
            <span><i className="dot" /> Unanswered</span>
          </div>
        </div>
      </div>

      {confirmSubmit && (
        <div className="modal-scrim" onClick={() => setConfirmSubmit(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={26} style={{ color: 'var(--yellow)' }} />
            <h3>Submit exam?</h3>
            <p>You've answered <b>{answeredCount}</b> of <b>{questions.length}</b>. Unanswered questions are marked incorrect.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
              <button className="btn ghost" onClick={() => setConfirmSubmit(false)}>Keep working</button>
              <button className="btn" onClick={finish}>Submit now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Result + answer review ----------------
function ExamResult({ result, onRetake, onDone }) {
  const { score, total, answers, questions } = result;
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 73;
  const [showReview, setShowReview] = useState(false);
  const color = pass ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';

  const bySec = result.bySection;

  return (
    <div className="fade-in">
      <div className="result" style={{ marginBottom: 10 }}>
        <Trophy size={30} style={{ color }} />
        <div className="ring-num" style={{ color }}>{pct}%</div>
        <div className="verdict">{pass ? 'Pass — you cleared 73%!' : 'Below the 73% pass mark'}</div>
        <div className="sub">{score} / {total} correct{result.durationSec ? ` · ${fmt(result.durationSec)} taken` : ''}</div>
      </div>

      <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'left' }}>
        <div className="kp-head" style={{ color: 'var(--primary)' }}>Section breakdown</div>
        <div className="result-breakdown">
          {Object.entries(bySec).map(([sec, v]) => {
            const p = Math.round((v.correct / v.total) * 100);
            return (
              <div className="rb-row" key={sec}>
                <span className="nm">{SEC_META[sec].roman}. {SEC_META[sec].title}</span>
                <span className="bar"><div style={{ width: `${p}%`, background: SEC_META[sec].accent }} /></span>
                <span className="sc">{v.correct}/{v.total}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
        <button className="btn" onClick={onRetake}><RotateCcw size={15} /> Retake</button>
        <button className="btn ghost" onClick={() => setShowReview((s) => !s)}>
          <ListChecks size={15} /> {showReview ? 'Hide' : 'Review'} answers <ChevronDown size={14} />
        </button>
        <button className="btn ghost" onClick={onDone}>Back to mocks</button>
      </div>

      {showReview && (
        <div style={{ maxWidth: 760, margin: '22px auto 0' }}>
          {questions.map((q, i) => {
            const yours = answers[i];
            const right = yours === q.correct;
            return (
              <div className="review-item" key={q.id}>
                <div className="review-q">
                  {right ? <CheckCircle2 size={16} style={{ color: 'var(--green)' }} /> : <XCircle size={16} style={{ color: 'var(--red)' }} />}
                  <span><b>Q{i + 1}.</b> {q.q}</span>
                </div>
                <div className="review-ans">
                  <div>Correct: <b style={{ color: 'var(--green)' }}>{String.fromCharCode(65 + q.correct)}. {q.opts[q.correct]}</b></div>
                  {!right && (
                    <div>Your answer: <b style={{ color: 'var(--red)' }}>{yours === null ? '— (blank)' : `${String.fromCharCode(65 + yours)}. ${q.opts[yours]}`}</b></div>
                  )}
                  <div className="review-exp">{q.exp}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
