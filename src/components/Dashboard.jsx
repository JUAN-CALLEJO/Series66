import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, FileQuestion, BookOpen } from 'lucide-react';
import { WeightingChart } from './WeightingChart.jsx';
import { TrustStrip } from './Logos.jsx';
import { EXAM_FACTS, QUICK_FACTS } from '../data/examFacts.js';

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export function Dashboard({ sections, go, visited }) {
  return (
    <div>
      {/* HERO */}
      <motion.div className="hero" variants={fade} initial="hidden" animate="show">
        <div className="card hero-left">
          <span className="section-eyebrow" style={{ color: 'var(--primary)' }}>
            NASAA · Effective June 2023 specs
          </span>
          <h1 style={{ marginTop: 10 }}>
            Master the <span>Series 66</span> exam
          </h1>
          <p>
            The Uniform Combined State Law Examination qualifies you as a dually-registered
            broker-dealer agent and investment adviser representative. This platform is built
            directly on the official NASAA test specifications — four weighted subject areas,
            comprehensive content, flashcards, practice tests, and a 3-week study plan.
          </p>
          <div className="facts">
            {QUICK_FACTS.map((f) => (
              <div className="fact" key={f.l}>
                <div className="v">{f.v}</div>
                <div className="l">{f.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => go('plan')}>
              <CalendarDays size={16} /> Start the 3-Week Plan
            </button>
            <button className="btn ghost" onClick={() => go('practice')}>
              <FileQuestion size={16} /> Take a Practice Test
            </button>
          </div>
        </div>

        <div className="chart-card">
          <span className="section-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 4 }}>
            Exam weighting
          </span>
          <WeightingChart sections={sections} />
          <div className="chart-legend">
            {sections.map((s) => (
              <div className="leg-row" key={s.id}>
                <span className="sw" style={{ background: s.accent }} />
                <span className="nm">
                  {s.roman}. {s.title}
                </span>
                <span className="wt" style={{ color: s.accent }}>
                  {s.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SECTION CARDS */}
      <div style={{ margin: '26px 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <BookOpen size={18} style={{ color: 'var(--primary)' }} />
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>The Four Subject Areas</h2>
      </div>

      <div className="sec-grid">
        {sections.map((s, i) => {
          const total = s.topics.length;
          const done = s.topics.filter((t) => visited.has(t.id)).length;
          const pct = Math.round((done / total) * 100);
          return (
            <motion.div
              key={s.id}
              className="sec-card"
              style={{ '--accent': s.accent }}
              variants={fade}
              custom={i + 1}
              initial="hidden"
              animate="show"
              onClick={() => go(s.topics[0].id)}
            >
              <span className="bar" />
              <div className="sec-top">
                <span className="romnum">Section {s.roman}</span>
                <span className="wbadge">{s.weight}% · {s.questions} Qs</span>
              </div>
              <h3>{s.title}</h3>
              <div className="meta">{s.blurb}</div>
              <div className="sec-prog">
                <div className="sb-prog-top" style={{ fontSize: 11 }}>
                  <span>{total} topics</span>
                  <span>{done}/{total} studied</span>
                </div>
                <div className="track">
                  <div style={{ width: `${pct}%`, background: s.accent }} />
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, color: s.accent, fontSize: 13, fontWeight: 600 }}>
                Explore section <ArrowRight size={15} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* TRUST STRIP */}
      <div style={{ marginTop: 22 }}>
        <TrustStrip />
      </div>

      {/* EXAM SOURCES */}
      <div className="card" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>What the exam draws from</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          Pass mark: {EXAM_FACTS.passScore}/100 · {EXAM_FACTS.minutes} minutes · {EXAM_FACTS.format} · administered by {EXAM_FACTS.administeredBy}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXAM_FACTS.sources.map((src) => (
            <span className="pill" key={src} style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              {src}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
