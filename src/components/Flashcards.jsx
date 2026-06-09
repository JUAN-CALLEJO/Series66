import { useState } from 'react';
import { RotateCw, FileQuestion } from 'lucide-react';

export function Flashcards({ title, accent, terms, go, sectionId }) {
  const [flipped, setFlipped] = useState(() => new Set());

  const toggle = (i) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const flipAll = () =>
    setFlipped((prev) => (prev.size === terms.length ? new Set() : new Set(terms.map((_, i) => i))));

  return (
    <div style={{ '--accent': accent }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
        <h1 className="topic-title" style={{ fontSize: 22 }}>{title}</h1>
        <span className="pill" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
          {terms.length} cards
        </span>
        <div className="spacer" style={{ flex: 1 }} />
        <button className="btn ghost sm" onClick={flipAll}>
          <RotateCw size={14} /> Flip all
        </button>
        <button className="btn sm" onClick={() => go(`quiz:${sectionId}`)}>
          <FileQuestion size={14} /> Quiz this section
        </button>
      </div>
      <p className="muted" style={{ marginBottom: 18 }}>Click a card to reveal its definition.</p>

      <div className="fc-grid">
        {terms.map((term, i) => (
          <div className={`fc${flipped.has(i) ? ' flipped' : ''}`} key={i} onClick={() => toggle(i)}>
            <div className="fc-inner">
              <div className="fc-face fc-front">
                <div className="fc-top">
                  <span className="fc-tag">{term.topic || 'Term'}</span>
                </div>
                <div className="fc-term">{term.name}</div>
                <div className="fc-cue">
                  <RotateCw size={12} /> tap to flip
                </div>
              </div>
              <div className="fc-face fc-back">
                <div className="fc-top">
                  <span className="fc-tag">{term.name}</span>
                </div>
                <div className="fc-def">{term.def}</div>
                <div className="fc-foot">tap to flip back</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
