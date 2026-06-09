import { useState } from 'react';
import { Check, ArrowUpRight, CalendarDays } from 'lucide-react';
import { STUDY_PLAN, TOTAL_PLAN_TASKS } from '../data/studyPlan.js';
import { SECTIONS } from '../data/curriculum.js';

const SEC_ACCENT = SECTIONS.reduce((m, s) => ((m[s.id] = s.accent), m), {});

export function StudyPlan({ checks, setChecks, go }) {
  const [week, setWeek] = useState(1);
  const checkSet = new Set(checks);

  const toggle = (key) =>
    setChecks((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const doneCount = checks.length;
  const pct = Math.round((doneCount / TOTAL_PLAN_TASKS) * 100);
  const activeWeek = STUDY_PLAN.weeks.find((w) => w.week === week);

  return (
    <div>
      <div className="card plan-head">
        <div>
          <span className="section-eyebrow" style={{ color: 'var(--primary)' }}>
            <CalendarDays size={14} /> {STUDY_PLAN.durationLabel}
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '10px 0 6px', letterSpacing: '-0.5px' }}>
            Your 21-Day Path to Pass
          </h1>
          <p className="muted" style={{ maxWidth: '52ch' }}>
            Time is weighted toward the heaviest sections — Laws (45%) and Client Recommendations (30%) —
            front-loading the material and finishing with full practice exams. Check off tasks as you go;
            your progress is saved automatically.
          </p>
        </div>
        <div style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
          <div className="ring" style={{ '--p': pct }}>
            <div className="inner">
              <b>{pct}%</b>
              <span>{doneCount}/{TOTAL_PLAN_TASKS}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="week-tabs">
        {STUDY_PLAN.weeks.map((w) => (
          <button
            key={w.week}
            className={`week-tab${week === w.week ? ' active' : ''}`}
            onClick={() => setWeek(w.week)}
          >
            {w.label}
            <span>{w.theme}</span>
          </button>
        ))}
      </div>

      {activeWeek.days.map((d) => {
        const accent = SEC_ACCENT[d.sec] || 'var(--primary)';
        const dayTasks = d.tasks.map((_, i) => `${d.day}-${i}`);
        const dayDone = dayTasks.every((k) => checkSet.has(k));
        return (
          <div className={`day-card${dayDone ? ' done' : ''}`} key={d.day} style={{ '--accent': accent }}>
            <div className="day-top">
              <div className="day-num" style={{ background: accent }}>
                <small>DAY</small>
                {d.day}
              </div>
              <div className="day-titles">
                <div className="day-focus">{d.focus}</div>
                <div className="day-sub">{d.sub}</div>
              </div>
              <span className="day-tag" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
                Section {d.sec}
              </span>
            </div>

            {d.tasks.map((task, i) => {
              const key = `${d.day}-${i}`;
              const checked = checkSet.has(key);
              return (
                <div className={`task${checked ? ' checked' : ''}`} key={key}>
                  <span className="checkbox" onClick={() => toggle(key)}>
                    {checked && <Check size={13} color="#04221a" strokeWidth={3} />}
                  </span>
                  <span style={{ flex: 1 }} onClick={() => toggle(key)}>{task.t}</span>
                  {task.link && task.link !== 'dashboard' && (
                    <button
                      className="btn ghost sm"
                      style={{ padding: '3px 9px', fontSize: 11 }}
                      onClick={() => go(task.link)}
                      title="Open"
                    >
                      Open <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
