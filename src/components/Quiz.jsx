import { useState, useMemo, useEffect, useRef } from 'react';
import { Check, X, ArrowRight, RotateCcw, Home, Trophy, Lightbulb } from 'lucide-react';
import { QUESTIONS } from '../data/questions.js';
import { SECTIONS } from '../data/curriculum.js';

const SEC_META = SECTIONS.reduce((m, s) => {
  m[s.id] = { title: s.title, accent: s.accent, roman: s.roman };
  return m;
}, {});

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ============================================================
// Reusable quiz runner — used by Practice Test and Missed Review
// ============================================================
export function QuizRunner({ questions, title, onMissed, onCorrect, onComplete, go, onRestart, emptyAction }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [log, setLog] = useState([]); // {sec, correct:boolean}
  const reported = useRef(false);

  const finished = questions.length > 0 && idx >= questions.length;

  // Report the result once, when the quiz finishes.
  useEffect(() => {
    if (finished && !reported.current && onComplete) {
      reported.current = true;
      const score = log.filter((l) => l.correct).length;
      const bySection = {};
      log.forEach((l) => {
        bySection[l.sec] = bySection[l.sec] || { correct: 0, total: 0 };
        bySection[l.sec].total += 1;
        if (l.correct) bySection[l.sec].correct += 1;
      });
      onComplete({ label: title, score, total: questions.length, bySection });
    }
  }, [finished, onComplete, log, questions.length, title]);

  if (questions.length === 0) {
    return emptyAction || null;
  }

  if (finished) {
    return <Results log={log} total={questions.length} go={go} onRestart={onRestart} />;
  }

  const q = questions[idx];
  const meta = SEC_META[q.sec];

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === q.correct;
    setLog((l) => [...l, { sec: q.sec, correct }]);
    if (correct) onCorrect?.(q.id);
    else onMissed?.(q.id);
  };

  const next = () => {
    setIdx((n) => n + 1);
    setSelected(null);
    setAnswered(false);
  };

  const pct = (idx / questions.length) * 100;
  const score = log.filter((l) => l.correct).length;

  return (
    <div className="quiz-wrap" style={{ '--accent': meta.accent }}>
      <div className="quiz-meta">
        <span className="quiz-badge">{title}</span>
        <span className="quiz-badge">Question <b>{idx + 1}</b> / {questions.length}</span>
        <span className="quiz-badge">Score <b>{score}</b></span>
      </div>
      <div className="qprog"><div style={{ width: `${pct}%` }} /></div>

      <div className="qtag" style={{ color: meta.accent }}>
        Section {meta.roman} · {meta.title}
      </div>
      <div className="qtext">{q.q}</div>

      <div className="qopts">
        {q.opts.map((opt, i) => {
          let cls = 'qopt';
          if (answered && i === q.correct) cls += ' correct';
          else if (answered && i === selected) cls += ' wrong';
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => choose(i)}>
              <span className="key">
                {answered && i === q.correct ? <Check size={14} /> :
                 answered && i === selected ? <X size={14} /> :
                 String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="explain fade-in">
          <div className="lead">
            <Lightbulb size={15} />
            {selected === q.correct ? 'Correct' : 'Not quite'}
          </div>
          {q.exp}
        </div>
      )}

      <div className="quiz-actions">
        {answered && (
          <button className="btn" onClick={next}>
            {idx + 1 === questions.length ? 'See results' : 'Next question'} <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Results screen with per-section breakdown
// ============================================================
function Results({ log, total, go, onRestart }) {
  const score = log.filter((l) => l.correct).length;
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 73;

  const bySec = {};
  log.forEach((l) => {
    bySec[l.sec] = bySec[l.sec] || { correct: 0, total: 0 };
    bySec[l.sec].total += 1;
    if (l.correct) bySec[l.sec].correct += 1;
  });

  const color = pass ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
  const verdict = pass ? 'Passing score! 🎉' : pct >= 60 ? 'Close — keep drilling' : 'More review needed';

  return (
    <div className="result fade-in">
      <Trophy size={30} style={{ color }} />
      <div className="ring-num" style={{ color }}>{pct}%</div>
      <div className="verdict">{verdict}</div>
      <div className="sub">{score} / {total} correct · passing threshold is 73%</div>

      <div className="card" style={{ marginTop: 22, textAlign: 'left' }}>
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
        <button className="btn" onClick={onRestart}><RotateCcw size={15} /> New test</button>
        <button className="btn ghost" onClick={() => go('missed')}>Review missed</button>
        <button className="btn ghost" onClick={() => go('dashboard')}><Home size={15} /> Home</button>
      </div>
    </div>
  );
}

// ============================================================
// Practice Test — config screen + runner
// ============================================================
export function Quiz({ scope, onMissed, onCorrect, onComplete, go }) {
  const [length, setLength] = useState(10);
  const [pickSec, setPickSec] = useState('ALL');
  const [started, setStarted] = useState(scope != null);
  const [activeScope, setActiveScope] = useState(scope ?? 'ALL');
  const [activeLength, setActiveLength] = useState(scope ? 999 : 10);
  const [seed, setSeed] = useState(0);

  const pool = useMemo(() => {
    const base = activeScope === 'ALL' ? QUESTIONS : QUESTIONS.filter((q) => q.sec === activeScope);
    return shuffle(base).slice(0, activeLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScope, activeLength, seed]);

  const start = () => {
    setActiveScope(pickSec);
    setActiveLength(length);
    setSeed((s) => s + 1);
    setStarted(true);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setStarted(false);
  };

  if (!started) {
    const maxAll = QUESTIONS.length;
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 className="topic-title" style={{ fontSize: 22, marginBottom: 4 }}>Build a Practice Test</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Questions are randomized. Any you miss are saved to <b>Review Missed</b> automatically; getting one right later clears it.
        </p>

        <div className="card">
          <div className="cfg-grp">
            <label>Focus</label>
            <div className="chips">
              <button className={`chip${pickSec === 'ALL' ? ' active' : ''}`} onClick={() => setPickSec('ALL')}>
                All sections
              </button>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  className={`chip${pickSec === s.id ? ' active' : ''}`}
                  onClick={() => setPickSec(s.id)}
                >
                  <span className="cdot" style={{ background: s.accent }} /> {s.roman}
                </button>
              ))}
            </div>
          </div>

          <div className="cfg-grp" style={{ marginBottom: 4 }}>
            <label>Number of questions</label>
            <div className="chips">
              {[10, 20, maxAll].map((n) => (
                <button key={n} className={`chip${length === n ? ' active' : ''}`} onClick={() => setLength(n)}>
                  {n === maxAll ? `All ${maxAll}` : n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn" style={{ marginTop: 18 }} onClick={start}>
          Start test <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const title =
    activeScope === 'ALL' ? 'Mixed Practice Test' : `Section ${SEC_META[activeScope].roman} Quiz`;

  return (
    <QuizRunner
      key={seed}
      questions={pool}
      title={title}
      onMissed={onMissed}
      onCorrect={onCorrect}
      onComplete={onComplete}
      go={go}
      onRestart={restart}
    />
  );
}
