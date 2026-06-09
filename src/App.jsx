import { useState, useMemo, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { SECTIONS, ALL_TOPICS, TOTAL_TOPICS } from './data/curriculum.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { TopicView } from './components/TopicView.jsx';
import { Flashcards } from './components/Flashcards.jsx';
import { Quiz } from './components/Quiz.jsx';
import { MissedReview } from './components/MissedReview.jsx';
import { StudyPlan } from './components/StudyPlan.jsx';
import { MockExams } from './components/MockExams.jsx';
import { ProgressDashboard } from './components/ProgressDashboard.jsx';
import { AuthModal } from './components/Auth.jsx';
import { useApp } from './context/AppData.jsx';

export default function App() {
  const { visited, missed, plan, setPlan, recordResult } = useApp();

  const [view, setView] = useState('dashboard');
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [flashScope, setFlashScope] = useState(null);
  const [quizScope, setQuizScope] = useState(null);
  const [quizSeed, setQuizSeed] = useState(0);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const activeTopic = useMemo(() => ALL_TOPICS.find((t) => t.id === activeTopicId) || null, [activeTopicId]);
  const activeSection = useMemo(() => SECTIONS.find((s) => s.id === activeTopic?.sectionId) || null, [activeTopic]);
  const progressPct = Math.round((visited.size / TOTAL_TOPICS) * 100);

  const go = useCallback(
    (target) => {
      setSidebarOpen(false);
      if (!target || target === 'dashboard') return setView('dashboard');
      if (target === 'plan') return setView('plan');
      if (target === 'missed') return setView('missed');
      if (target === 'mocks') return setView('mocks');
      if (target === 'progress') return setView('progress');
      if (target === 'practice') {
        setQuizScope(null);
        setQuizSeed((s) => s + 1);
        return setView('quiz');
      }
      if (target.startsWith('quiz:')) {
        setQuizScope(target.slice(5));
        setQuizSeed((s) => s + 1);
        return setView('quiz');
      }
      if (target.startsWith('flash:')) {
        setFlashScope(target.slice(6));
        return setView('flash');
      }
      const topic = ALL_TOPICS.find((t) => t.id === target);
      if (topic) {
        setActiveTopicId(target);
        visited.add(target);
        setFlashScope(null);
        return setView('topic');
      }
    },
    [visited]
  );

  const topicIndex = activeTopic ? ALL_TOPICS.findIndex((t) => t.id === activeTopic.id) : -1;
  const prevTopic = topicIndex > 0 ? ALL_TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex >= 0 && topicIndex < ALL_TOPICS.length - 1 ? ALL_TOPICS[topicIndex + 1] : null;

  const flashSection = SECTIONS.find((s) => s.id === flashScope);
  const flashTerms = flashSection
    ? flashSection.topics.flatMap((t) => t.terms.map((term) => ({ ...term, topic: t.title })))
    : [];

  const crumb = (() => {
    if (view === 'dashboard') return { a: 'Dashboard', b: null };
    if (view === 'plan') return { a: 'Study Plan', b: '3-Week Schedule' };
    if (view === 'mocks') return { a: 'Practice', b: 'Mock Exams' };
    if (view === 'progress') return { a: 'Account', b: 'My Progress' };
    if (view === 'missed') return { a: 'Practice', b: 'Review Missed' };
    if (view === 'quiz') return { a: 'Practice', b: quizScope ? `Section ${quizScope === 'ALL' ? 'Mixed' : quizScope}` : 'Build a Test' };
    if (view === 'flash' && flashSection) return { a: flashSection.title, b: 'Flashcards' };
    if (view === 'topic' && activeSection) return { a: activeSection.title, b: activeTopic?.title };
    return { a: 'Series 66', b: null };
  })();

  // Save quick-quiz / section-quiz results too (kind: 'quiz')
  const onQuizComplete = useCallback(
    (payload) => recordResult({ kind: 'quiz', label: payload.label || 'Practice quiz', ...payload }),
    [recordResult]
  );

  return (
    <div className="app">
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        sections={SECTIONS}
        view={view}
        activeTopicId={activeTopicId}
        activeSectionId={activeSection?.id}
        search={search}
        setSearch={setSearch}
        go={go}
        progressPct={progressPct}
        missedCount={missed.size}
        open={sidebarOpen}
        onAuth={() => setAuthOpen(true)}
      />

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen((o) => !o)} aria-label="Menu"><Menu size={18} /></button>
          <div className="crumb">
            <b>{crumb.a}</b>
            {crumb.b ? <> &nbsp;/&nbsp; {crumb.b}</> : null}
          </div>
          <div className="spacer" />
          {view === 'topic' && activeTopic && (
            <div className="mode-tabs">
              <button className="mode-tab active">Content</button>
              <button className="mode-tab" onClick={() => go(`flash:${activeSection.id}`)}>Flashcards</button>
              <button className="mode-tab" onClick={() => go(`quiz:${activeSection.id}`)}>Quiz</button>
            </div>
          )}
        </header>

        <div className="content-scroll">
          <div className="content-pad fade-in" key={`${view}-${activeTopicId}-${quizSeed}-${flashScope}`}>
            {view === 'dashboard' && <Dashboard sections={SECTIONS} go={go} visited={visited} />}
            {view === 'plan' && <StudyPlan checks={plan} setChecks={setPlan} go={go} />}
            {view === 'mocks' && <MockExams />}
            {view === 'progress' && <ProgressDashboard go={go} />}

            {view === 'topic' && activeTopic && activeSection && (
              <TopicView topic={activeTopic} section={activeSection} go={go} prevTopic={prevTopic} nextTopic={nextTopic} />
            )}

            {view === 'flash' && flashSection && (
              <Flashcards title={flashSection.title} accent={flashSection.accent} terms={flashTerms} go={go} sectionId={flashSection.id} />
            )}

            {view === 'quiz' && (
              <Quiz
                key={quizSeed}
                scope={quizScope}
                onMissed={(id) => missed.add(id)}
                onCorrect={(id) => missed.remove(id)}
                onComplete={onQuizComplete}
                go={go}
              />
            )}

            {view === 'missed' && (
              <MissedReview missed={missed} onCorrect={(id) => missed.remove(id)} onMissed={(id) => missed.add(id)} go={go} />
            )}
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
