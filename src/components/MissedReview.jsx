import { useMemo, useState } from 'react';
import { PartyPopper, FileQuestion, Trash2 } from 'lucide-react';
import { QUESTIONS } from '../data/questions.js';
import { QuizRunner } from './Quiz.jsx';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export function MissedReview({ missed, onCorrect, onMissed, go }) {
  const [seed, setSeed] = useState(0);

  // Snapshot the pool when the view mounts / restarts, so removing a
  // question mid-run (on a correct answer) doesn't reshuffle the deck.
  const pool = useMemo(
    () => shuffle(QUESTIONS.filter((q) => missed.has(q.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed]
  );

  if (pool.length === 0) {
    return (
      <div className="empty">
        <PartyPopper size={34} style={{ color: 'var(--green)' }} />
        <div className="big" style={{ marginTop: 12 }}>Nothing to review</div>
        <p style={{ maxWidth: 420, margin: '0 auto 18px' }}>
          You have no missed questions saved. Take a practice test — anything you miss is
          collected here so you can drill it until it sticks.
        </p>
        <button className="btn" onClick={() => go('practice')}>
          <FileQuestion size={15} /> Take a practice test
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <h1 className="topic-title" style={{ fontSize: 22 }}>Review Missed Questions</h1>
        <span className="pill" style={{ background: 'var(--red)', color: '#fff' }}>{missed.size} saved</span>
        <div style={{ flex: 1 }} />
        <button
          className="btn ghost sm"
          onClick={() => { missed.clear(); setSeed((s) => s + 1); }}
        >
          <Trash2 size={14} /> Clear all
        </button>
      </div>

      <QuizRunner
        key={seed}
        questions={pool}
        title="Missed Questions"
        onCorrect={onCorrect}
        onMissed={onMissed}
        go={go}
        onRestart={() => setSeed((s) => s + 1)}
      />
    </div>
  );
}
