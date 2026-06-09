import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid,
} from 'recharts';
import { TrendingUp, Target, Award, BookOpenCheck, RotateCcw, FileQuestion, Gauge } from 'lucide-react';
import { useApp } from '../context/AppData.jsx';
import { SECTIONS, TOTAL_TOPICS } from '../data/curriculum.js';

const SEC_META = SECTIONS.reduce((m, s) => ((m[s.id] = s), m), {});

export function ProgressDashboard({ go }) {
  const { results, visited, missed } = useApp();

  const stats = useMemo(() => {
    const all = results || [];
    const mocks = all.filter((r) => r.kind === 'mock');
    const best = all.reduce((mx, r) => Math.max(mx, r.pct), 0);
    const avg = all.length ? Math.round(all.reduce((s, r) => s + r.pct, 0) / all.length) : 0;
    const recentMocks = mocks.slice(0, 3);
    const recentMockAvg = recentMocks.length
      ? Math.round(recentMocks.reduce((s, r) => s + r.pct, 0) / recentMocks.length)
      : null;

    // section mastery from all attempts' bySection
    const secAgg = {};
    all.forEach((r) =>
      Object.entries(r.bySection || {}).forEach(([sec, v]) => {
        secAgg[sec] = secAgg[sec] || { correct: 0, total: 0 };
        secAgg[sec].correct += v.correct;
        secAgg[sec].total += v.total;
      })
    );

    const topicsPct = Math.round((visited.size / TOTAL_TOPICS) * 100);
    const readiness =
      recentMockAvg != null
        ? Math.round(recentMockAvg * 0.7 + topicsPct * 0.3)
        : Math.round((avg || 0) * 0.5 + topicsPct * 0.5);

    return { all, mocks, best, avg, recentMockAvg, secAgg, topicsPct, readiness };
  }, [results, visited.size]);

  const trend = useMemo(
    () =>
      [...stats.all]
        .reverse()
        .map((r, i) => ({ n: i + 1, pct: r.pct, label: r.label })),
    [stats.all]
  );

  if (stats.all.length === 0) {
    return (
      <div>
        <h1 className="topic-title" style={{ fontSize: 23, marginBottom: 4 }}>Your Progress</h1>
        <p className="muted" style={{ marginBottom: 20 }}>Track scores, readiness, and section mastery over time.</p>
        <div className="empty">
          <Gauge size={34} style={{ color: 'var(--primary)' }} />
          <div className="big" style={{ marginTop: 12 }}>No attempts yet</div>
          <p style={{ maxWidth: 440, margin: '0 auto 18px' }}>
            Take a practice test or a full mock exam and your scores, trends, and section mastery
            will appear here — saved to your account.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => go('mocks')}><FileQuestion size={15} /> Take a mock exam</button>
            <button className="btn ghost" onClick={() => go('practice')}>Quick practice</button>
          </div>
        </div>
      </div>
    );
  }

  const readyColor = stats.readiness >= 73 ? 'var(--green)' : stats.readiness >= 60 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div>
      <h1 className="topic-title" style={{ fontSize: 23, marginBottom: 4 }}>Your Progress</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        {stats.all.length} attempt{stats.all.length > 1 ? 's' : ''} logged · {stats.mocks.length} full mock{stats.mocks.length === 1 ? '' : 's'}
      </p>

      <div className="analytics-grid">
        <div className="card readiness-card">
          <div className="kp-head" style={{ color: 'var(--primary)' }}><Gauge size={15} /> Exam readiness</div>
          <div className="ring" style={{ '--p': stats.readiness, margin: '12px auto 8px', width: 120, height: 120 }}>
            <div className="inner" style={{ width: 96, height: 96 }}>
              <b style={{ fontSize: 26, color: readyColor }}>{stats.readiness}%</b>
              <span>readiness</span>
            </div>
          </div>
          <p className="muted" style={{ textAlign: 'center' }}>
            {stats.readiness >= 73 ? 'On track to pass — keep it steady.' : 'Below the 73% target — focus weak sections.'}
          </p>
        </div>

        <div className="stat-stack">
          <StatTile icon={<Award size={16} />} label="Best score" value={`${stats.best}%`} />
          <StatTile icon={<Target size={16} />} label="Average score" value={`${stats.avg}%`} />
          <StatTile icon={<BookOpenCheck size={16} />} label="Topics studied" value={`${stats.topicsPct}%`} />
          <StatTile icon={<RotateCcw size={16} />} label="Missed queue" value={missed.size} accent="var(--red)" />
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="kp-head" style={{ color: 'var(--primary)' }}><TrendingUp size={15} /> Score trend</div>
        <div style={{ width: '100%', height: 240, marginTop: 8 }}>
          <ResponsiveContainer>
            <LineChart data={trend} margin={{ top: 8, right: 14, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1e2330" vertical={false} />
              <XAxis dataKey="n" stroke="#6b7185" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#6b7185" fontSize={11} tickLine={false} />
              <ReferenceLine y={73} stroke="#2bd9a8" strokeDasharray="4 4" label={{ value: 'Pass 73%', fill: '#2bd9a8', fontSize: 11, position: 'insideTopRight' }} />
              <Tooltip
                contentStyle={{ background: '#161a24', border: '1px solid #252b3b', borderRadius: 10, fontSize: 12, color: '#eef0f7' }}
                formatter={(v) => [`${v}%`, 'Score']}
                labelFormatter={(l) => `Attempt ${l}`}
              />
              <Line type="monotone" dataKey="pct" stroke="#7c6cff" strokeWidth={2.5} dot={{ r: 3, fill: '#7c6cff' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="kp-head" style={{ color: 'var(--primary)' }}><Target size={15} /> Section mastery</div>
        <div className="result-breakdown" style={{ marginTop: 10 }}>
          {SECTIONS.map((s) => {
            const v = stats.secAgg[s.id];
            const p = v ? Math.round((v.correct / v.total) * 100) : 0;
            return (
              <div className="rb-row" key={s.id}>
                <span className="nm">{s.roman}. {s.title}</span>
                <span className="bar"><div style={{ width: `${p}%`, background: s.accent }} /></span>
                <span className="sc" style={{ color: p >= 73 ? 'var(--green)' : p >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                  {v ? `${p}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ marginTop: 12 }}>Aim for 73%+ in every section. Drill the lowest with targeted quizzes and the missed-question queue.</p>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, accent }) {
  return (
    <div className="stat-tile">
      <span className="stat-ico" style={accent ? { color: accent } : undefined}>{icon}</span>
      <div>
        <div className="stat-val" style={accent ? { color: accent } : undefined}>{value}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
}
