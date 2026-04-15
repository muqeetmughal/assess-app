import { useEffect, useMemo, useState } from 'react';
import { seedAssessments } from './seed';
import { loadJson, saveJson, storageKeys } from './storage';

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function computeResult(assessment, answers, startedAt) {
  const detailed = assessment.questions.map((question, index) => {
    const selectedIndex = answers[index];
    const correct = selectedIndex === question.correctIndex;
    return {
      prompt: question.prompt,
      skill: question.skill,
      selectedIndex,
      correctIndex: question.correctIndex,
      correct,
      explanation: question.explanation,
      options: question.options,
    };
  });

  const correctCount = detailed.filter((item) => item.correct).length;
  const score = Math.round((correctCount / assessment.questions.length) * 100);
  const skills = detailed.reduce((acc, item) => {
    acc[item.skill] ??= { total: 0, correct: 0 };
    acc[item.skill].total += 1;
    if (item.correct) acc[item.skill].correct += 1;
    return acc;
  }, {});

  return {
    id: uid('result'),
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    startedAt,
    completedAt: new Date().toISOString(),
    durationMinutes: assessment.durationMinutes,
    score,
    passed: score >= assessment.passingScore,
    correctCount,
    totalQuestions: assessment.questions.length,
    skillBreakdown: Object.entries(skills).map(([skill, value]) => ({
      skill,
      score: Math.round((value.correct / value.total) * 100),
      correct: value.correct,
      total: value.total,
    })),
    detailed,
  };
}

function getRecommendations(result) {
  return result.skillBreakdown
    .filter((item) => item.score < 70)
    .map((item) => `Review ${item.skill.toLowerCase()} fundamentals and retake a short practice assessment.`);
}

function StatCard({ label, value, hint }) {
  return (
    <div className="card stat-card">
      <div className="muted">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="small">{hint}</div>
    </div>
  );
}

function Dashboard({ assessments, results, onStart }) {
  const avgScore = results.length
    ? `${Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length)}%`
    : 'No data';
  const passRate = results.length
    ? `${Math.round((results.filter((item) => item.passed).length / results.length) * 100)}%`
    : 'No data';
  const recent = [...results].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 5);

  return (
    <div className="stack-lg">
      <section className="hero card">
        <div>
          <span className="badge">Assess App</span>
          <h1>Build, run, and review assessments in one place.</h1>
          <p>Create practical quizzes for hiring, training, customer support, onboarding, or internal certification. Everything runs locally and stores data in the browser.</p>
        </div>
      </section>

      <section className="grid stats-grid">
        <StatCard label="Assessments" value={assessments.length} hint="Reusable templates and custom tests" />
        <StatCard label="Attempts" value={results.length} hint="Every attempt is saved locally" />
        <StatCard label="Average score" value={avgScore} hint="Across all completed assessments" />
        <StatCard label="Pass rate" value={passRate} hint="Compared to per-assessment thresholds" />
      </section>

      <section className="stack">
        <div className="section-head">
          <h2>Assessment library</h2>
          <p className="muted">Pick a template and start instantly.</p>
        </div>
        <div className="grid library-grid">
          {assessments.map((assessment) => (
            <article className="card library-card" key={assessment.id}>
              <div className="space-between">
                <span className="pill">{assessment.category}</span>
                <span className="small">{assessment.durationMinutes} min</span>
              </div>
              <h3>{assessment.title}</h3>
              <p>{assessment.description}</p>
              <div className="small muted">{assessment.questions.length} questions • Pass at {assessment.passingScore}%</div>
              <button onClick={() => onStart(assessment.id)}>Start assessment</button>
            </article>
          ))}
        </div>
      </section>

      <section className="stack">
        <div className="section-head">
          <h2>Recent attempts</h2>
          <p className="muted">Quick performance snapshot.</p>
        </div>
        <div className="card list-card">
          {recent.length === 0 ? (
            <p className="muted">No attempts yet. Complete an assessment to see trend data.</p>
          ) : (
            recent.map((item) => (
              <div className="result-row" key={item.id}>
                <div>
                  <strong>{item.assessmentTitle}</strong>
                  <div className="small muted">{new Date(item.completedAt).toLocaleString()}</div>
                </div>
                <div className={`score-chip ${item.passed ? 'pass' : 'fail'}`}>{item.score}%</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CreateAssessment({ onSave }) {
  const blankQuestion = () => ({ prompt: '', skill: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Custom',
    passingScore: 70,
    durationMinutes: 10,
    questions: [blankQuestion(), blankQuestion()],
  });

  const updateQuestion = (index, updater) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, qIndex) => (qIndex === index ? updater(question) : question)),
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    const cleanQuestions = form.questions
      .map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
        skill: question.skill.trim() || 'General',
        explanation: question.explanation.trim(),
        options: question.options.map((option) => option.trim()),
      }))
      .filter((question) => question.prompt && question.options.every(Boolean));

    if (!form.title.trim() || cleanQuestions.length < 2) {
      alert('Add a title and at least two complete questions.');
      return;
    }

    onSave({
      id: uid('assessment'),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'Custom',
      passingScore: Number(form.passingScore),
      durationMinutes: Number(form.durationMinutes),
      questions: cleanQuestions,
    });

    setForm({
      title: '',
      description: '',
      category: 'Custom',
      passingScore: 70,
      durationMinutes: 10,
      questions: [blankQuestion(), blankQuestion()],
    });
  };

  return (
    <form className="stack-lg" onSubmit={submit}>
      <section className="card stack">
        <div className="section-head">
          <h2>Create assessment</h2>
          <p className="muted">Spin up a training or hiring quiz in minutes.</p>
        </div>
        <div className="grid two-col">
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Support onboarding check" />
          </label>
          <label>
            Category
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Operations" />
          </label>
          <label className="full-width">
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this assessment evaluate?" rows="3" />
          </label>
          <label>
            Passing score (%)
            <input type="number" min="0" max="100" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} />
          </label>
          <label>
            Duration (minutes)
            <input type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="stack">
        {form.questions.map((question, index) => (
          <div className="card stack" key={index}>
            <div className="space-between">
              <h3>Question {index + 1}</h3>
              {form.questions.length > 2 && (
                <button type="button" className="ghost" onClick={() => setForm({ ...form, questions: form.questions.filter((_, qIndex) => qIndex !== index) })}>
                  Remove
                </button>
              )}
            </div>
            <label>
              Prompt
              <textarea value={question.prompt} onChange={(e) => updateQuestion(index, (current) => ({ ...current, prompt: e.target.value }))} rows="2" />
            </label>
            <div className="grid two-col">
              <label>
                Skill area
                <input value={question.skill} onChange={(e) => updateQuestion(index, (current) => ({ ...current, skill: e.target.value }))} placeholder="Communication" />
              </label>
              <label>
                Correct answer
                <select value={question.correctIndex} onChange={(e) => updateQuestion(index, (current) => ({ ...current, correctIndex: Number(e.target.value) }))}>
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </label>
            </div>
            <div className="grid two-col">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex}>
                  Option {optionIndex + 1}
                  <input
                    value={option}
                    onChange={(e) => updateQuestion(index, (current) => ({
                      ...current,
                      options: current.options.map((item, itemIndex) => (itemIndex === optionIndex ? e.target.value : item)),
                    }))}
                  />
                </label>
              ))}
            </div>
            <label>
              Explanation
              <textarea value={question.explanation} onChange={(e) => updateQuestion(index, (current) => ({ ...current, explanation: e.target.value }))} rows="2" placeholder="Shown in results review" />
            </label>
          </div>
        ))}
        <div className="row">
          <button type="button" className="secondary" onClick={() => setForm({ ...form, questions: [...form.questions, blankQuestion()] })}>
            Add question
          </button>
          <button type="submit">Save assessment</button>
        </div>
      </section>
    </form>
  );
}

function TakeAssessment({ assessment, onFinish, onExit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(assessment.durationMinutes * 60);
  const [startedAt] = useState(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          onFinish(computeResult(assessment, answers, startedAt));
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assessment, answers, onFinish, startedAt]);

  const question = assessment.questions[current];
  const progress = Math.round((Object.keys(answers).length / assessment.questions.length) * 100);

  return (
    <div className="stack-lg">
      <section className="card quiz-header">
        <div>
          <span className="badge">In progress</span>
          <h2>{assessment.title}</h2>
          <p>{assessment.description}</p>
        </div>
        <div className="quiz-meta">
          <div className="timer">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</div>
          <div className="small muted">{progress}% answered</div>
        </div>
      </section>

      <section className="card stack">
        <div className="space-between">
          <strong>Question {current + 1} of {assessment.questions.length}</strong>
          <span className="pill">{question.skill}</span>
        </div>
        <h3>{question.prompt}</h3>
        <div className="options">
          {question.options.map((option, index) => (
            <button
              type="button"
              key={option}
              className={`option ${answers[current] === index ? 'selected' : ''}`}
              onClick={() => setAnswers({ ...answers, [current]: index })}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
        <div className="row">
          <button className="ghost" onClick={onExit}>Exit</button>
          <div className="row right">
            <button className="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Back</button>
            {current < assessment.questions.length - 1 ? (
              <button onClick={() => setCurrent(current + 1)}>Next</button>
            ) : (
              <button onClick={() => onFinish(computeResult(assessment, answers, startedAt))}>Submit</button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Results({ result, onReset }) {
  const recommendations = getRecommendations(result);
  return (
    <div className="stack-lg">
      <section className="card hero">
        <div>
          <span className={`badge ${result.passed ? 'success' : 'danger'}`}>{result.passed ? 'Passed' : 'Needs work'}</span>
          <h1>{result.assessmentTitle}</h1>
          <p>Score: {result.score}% ({result.correctCount}/{result.totalQuestions} correct)</p>
        </div>
        <button onClick={onReset}>Back to dashboard</button>
      </section>

      <section className="grid stats-grid">
        {result.skillBreakdown.map((item) => (
          <StatCard key={item.skill} label={item.skill} value={`${item.score}%`} hint={`${item.correct}/${item.total} correct`} />
        ))}
      </section>

      <section className="card stack">
        <div className="section-head">
          <h2>Recommendations</h2>
        </div>
        {recommendations.length ? recommendations.map((item, index) => <p key={index}>{item}</p>) : <p>Great job. This attempt shows balanced performance across all skill areas.</p>}
      </section>

      <section className="card stack">
        <div className="section-head">
          <h2>Question review</h2>
        </div>
        {result.detailed.map((item, index) => (
          <div key={index} className="review-item">
            <div className="space-between">
              <strong>{index + 1}. {item.prompt}</strong>
              <span className={`score-chip ${item.correct ? 'pass' : 'fail'}`}>{item.correct ? 'Correct' : 'Incorrect'}</span>
            </div>
            <div className="small">Your answer: {item.selectedIndex !== undefined ? item.options[item.selectedIndex] : 'No answer selected'}</div>
            <div className="small">Correct answer: {item.options[item.correctIndex]}</div>
            <div className="small muted">{item.explanation}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [assessments, setAssessments] = useState(() => loadJson(storageKeys.assessments, seedAssessments));
  const [results, setResults] = useState(() => loadJson(storageKeys.results, []));
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => saveJson(storageKeys.assessments, assessments), [assessments]);
  useEffect(() => saveJson(storageKeys.results, results), [results]);

  const activeAssessment = useMemo(
    () => assessments.find((item) => item.id === activeAssessmentId),
    [activeAssessmentId, assessments]
  );

  const finishAssessment = (result) => {
    setResults((current) => [result, ...current]);
    setLastResult(result);
    setActiveAssessmentId(null);
    setTab('results');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="logo">A</div>
          <div>
            <strong>Assess App</strong>
            <div className="small muted">Assessment studio</div>
          </div>
        </div>
        <nav>
          <button className={tab === 'dashboard' ? 'nav active' : 'nav'} onClick={() => { setActiveAssessmentId(null); setTab('dashboard'); }}>Dashboard</button>
          <button className={tab === 'create' ? 'nav active' : 'nav'} onClick={() => { setActiveAssessmentId(null); setTab('create'); }}>Create</button>
          <button className={tab === 'results' ? 'nav active' : 'nav'} onClick={() => { setActiveAssessmentId(null); setTab('results'); }}>Results</button>
        </nav>
      </aside>

      <main className="main-content">
        {activeAssessment && <TakeAssessment assessment={activeAssessment} onFinish={finishAssessment} onExit={() => setActiveAssessmentId(null)} />}
        {!activeAssessment && tab === 'dashboard' && <Dashboard assessments={assessments} results={results} onStart={(id) => setActiveAssessmentId(id)} />}
        {!activeAssessment && tab === 'create' && <CreateAssessment onSave={(assessment) => { setAssessments([assessment, ...assessments]); setTab('dashboard'); }} />}
        {!activeAssessment && tab === 'results' && (lastResult ? <Results result={lastResult} onReset={() => setTab('dashboard')} /> : <div className="card"><p className="muted">Complete an assessment to see detailed results.</p></div>)}
      </main>
    </div>
  );
}
