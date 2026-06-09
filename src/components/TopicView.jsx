import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lightbulb, BookMarked, Layers, FileQuestion } from 'lucide-react';

// Render **bold** segments inside a string.
function RichText({ children }) {
  const parts = String(children).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>
  );
}

export function TopicView({ topic, section, go, prevTopic, nextTopic }) {
  const accent = section.accent;
  return (
    <div style={{ '--accent': accent }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="topic-head">
          <span className="accent-bar" />
          <div>
            <div className="topic-kicker">
              Section {section.roman} · {section.title}
            </div>
            <h1 className="topic-title">{topic.title}</h1>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <p className="topic-summary">
            <RichText>{topic.summary}</RichText>
          </p>
        </div>

        <div className="card">
          <div className="kp-head">
            <Lightbulb size={15} /> Key Points
          </div>
          <div>
            {topic.keyPoints.map((kp, i) => (
              <div className="kp" key={i}>
                <span className="dot" />
                <span>
                  <RichText>{kp}</RichText>
                </span>
              </div>
            ))}
          </div>
        </div>

        {topic.terms.length > 0 && (
          <div className="card">
            <div className="kp-head">
              <BookMarked size={15} /> Key Terms
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: '26%' }}>Term</th>
                  <th>Definition</th>
                </tr>
              </thead>
              <tbody>
                {topic.terms.map((t) => (
                  <tr key={t.name}>
                    <td>{t.name}</td>
                    <td>{t.def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn ghost sm" onClick={() => go(`flash:${section.id}`)}>
            <Layers size={15} /> Flashcards for this section
          </button>
          <button className="btn ghost sm" onClick={() => go(`quiz:${section.id}`)}>
            <FileQuestion size={15} /> Quiz this section
          </button>
        </div>

        <div className="topic-nav">
          {prevTopic ? (
            <button className="btn ghost sm" onClick={() => go(prevTopic.id)}>
              <ArrowLeft size={15} /> {prevTopic.title}
            </button>
          ) : <span />}
          {nextTopic ? (
            <button className="btn sm" onClick={() => go(nextTopic.id)}>
              {nextTopic.title} <ArrowRight size={15} />
            </button>
          ) : <span />}
        </div>
      </motion.div>
    </div>
  );
}
