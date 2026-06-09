import { useState, useMemo } from 'react';
import {
  Search, ChevronRight, LayoutDashboard, CalendarDays, FileQuestion, RotateCcw,
  LineChart, Briefcase, Target, Scale, FileCheck2, BarChart3, LogOut, Cloud, CloudOff,
} from 'lucide-react';
import { ALL_TOPICS } from '../data/curriculum.js';
import { useApp } from '../context/AppData.jsx';
import { TrustStrip } from './Logos.jsx';

const SECTION_ICONS = { LineChart, Briefcase, Target, Scale };

export function Sidebar({
  sections, view, activeTopicId, activeSectionId, search, setSearch, go,
  progressPct, missedCount, open, onAuth,
}) {
  const { user, online, logout } = useApp();
  const [expanded, setExpanded] = useState(() => new Set([activeSectionId].filter(Boolean)));

  const toggleSection = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Search filtering across topics
  const q = search.trim().toLowerCase();
  const matchedTopicIds = useMemo(() => {
    if (!q) return null;
    return new Set(
      ALL_TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.terms.some((term) => term.name.toLowerCase().includes(q))
      ).map((t) => t.id)
    );
  }, [q]);

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sb-brand" onClick={() => go('dashboard')}>
        <div className="logo">
          <div className="mark">66</div>
          <div>
            <h1>Series 66</h1>
            <p>Uniform Combined State Law</p>
          </div>
        </div>
      </div>

      <div className="sb-search">
        <div className="sb-search-wrap">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics & terms…"
          />
        </div>
      </div>

      <nav className="sb-nav">
        <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" active={view === 'dashboard'} onClick={() => go('dashboard')} />
        <NavItem icon={<CalendarDays size={16} />} label="3-Week Study Plan" active={view === 'plan'} onClick={() => go('plan')} />
        <NavItem icon={<FileCheck2 size={16} />} label="Mock Exams" active={view === 'mocks'} onClick={() => go('mocks')} />
        <NavItem icon={<FileQuestion size={16} />} label="Practice Test" active={view === 'quiz'} onClick={() => go('practice')} />
        <NavItem
          icon={<RotateCcw size={16} />}
          label="Review Missed"
          active={view === 'missed'}
          onClick={() => go('missed')}
          badge={missedCount}
        />
        <NavItem icon={<BarChart3 size={16} />} label="My Progress" active={view === 'progress'} onClick={() => go('progress')} />

        <div className="sb-sectionhdr">Curriculum · 4 Sections</div>

        {sections.map((s) => {
          const Icon = SECTION_ICONS[s.icon] || Briefcase;
          const isOpen = q ? true : expanded.has(s.id);
          const topics = matchedTopicIds
            ? s.topics.filter((t) => matchedTopicIds.has(t.id))
            : s.topics;
          if (matchedTopicIds && topics.length === 0) return null;
          return (
            <div className="sb-sec" key={s.id}>
              <button
                className={`sb-sec-btn${activeSectionId === s.id ? ' active' : ''}`}
                onClick={() => toggleSection(s.id)}
              >
                <span className="sb-sec-dot" style={{ background: s.accent }} />
                <Icon size={15} style={{ color: s.accent, flexShrink: 0 }} />
                <span className="sb-sec-title">{s.title}</span>
                <span className="sb-sec-weight">{s.weight}%</span>
                <ChevronRight size={14} className={`sb-sec-chev${isOpen ? ' open' : ''}`} />
              </button>
              {isOpen && (
                <div className="sb-topics" style={{ color: s.accent }}>
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      className={`sb-topic${activeTopicId === t.id ? ' active' : ''}`}
                      style={activeTopicId === t.id ? { color: s.accent } : undefined}
                      onClick={() => go(t.id)}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sb-foot">
        <div className="sb-prog-top">
          <span>Topics studied</span>
          <b>{progressPct}%</b>
        </div>
        <div className="track">
          <div style={{ width: `${progressPct}%` }} />
        </div>

        {user ? (
          <div className="acct-box">
            <div className="acct-avatar">{(user.name || user.email).slice(0, 1).toUpperCase()}</div>
            <div className="acct-info">
              <div className="acct-name">{user.name || user.email}</div>
              <div className="acct-sync"><Cloud size={11} /> Synced</div>
            </div>
            <button className="acct-logout" onClick={logout} title="Sign out"><LogOut size={15} /></button>
          </div>
        ) : (
          <button className="acct-signin" onClick={onAuth}>
            {online ? <Cloud size={15} /> : <CloudOff size={15} />}
            {online ? 'Sign in to sync progress' : 'Offline — progress saved locally'}
          </button>
        )}

        <TrustStrip compact />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button className={`sb-navitem${active ? ' active' : ''}`} onClick={onClick}>
      <span className="ico">{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {badge ? <span className="sb-sec-weight" style={{ background: 'var(--red)', color: '#fff' }}>{badge}</span> : null}
    </button>
  );
}
