import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0); // 🔥 New Streak State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [level, setLevel] = useState(1);
  const [usedQuestions, setUsedQuestions] = useState([]);

  useEffect(() => {
    const newLevel = Math.min(Math.floor(xp / 100) + 1, 5);
    if (newLevel !== level) setLevel(newLevel);
  }, [xp]);

  const fetchQuestion = async (manualLvl = null) => {
    setLoading(true); setQuestion(null); setSelected(null); setIsSubmitted(false);
    const targetLvl = manualLvl || level;
    const topics = ["Basics", "Arrays", "Pointers", "OOPs", "STL"];
    try {
      const res = await axios.post('http://localhost:5000/api/generate', {
        topic: `C++ ${topics[targetLvl-1]}`,
        difficulty: `Level ${targetLvl}`,
        exclude: usedQuestions
      });
      setQuestion(res.data);
      setUsedQuestions(prev => [...prev, res.data.question].slice(-15));
    } catch (err) { alert("Backend offline!"); }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setIsSubmitted(true);
    
    const isCorrect = selected.trim().toLowerCase() === question.answer.trim().toLowerCase();
    
    if (isCorrect) {
      setXp(prev => prev + 20);
      setStreak(prev => prev + 1); // 🔥 Streak badhao
    } else {
      setXp(prev => Math.max(0, prev - 10));
      setStreak(0); // ❌ Streak reset karo agar galat hua
    }
  };

  return (
    <div className="App">
      <header className="nav-header">
        <div className="logo"><div className="logo-box">X</div><span>LearnX</span></div>
        <div className="stats-container">
          <div className="stat-pill orange">🔥 {streak} Streak</div> {/* Streak Display */}
          <div className="stat-pill blue">🏆 {xp} XP</div>
          <div className="level-nav">
            <button onClick={() => { setLevel(l => l-1); setXp((level-2)*100); }} disabled={level === 1}>◀</button>
            <span className="stat-pill orange">LVL {level}</span>
            <button onClick={() => { setLevel(l => l+1); setXp(level*100); }} disabled={level === 5}>▶</button>
          </div>
        </div>
      </header>

      <div className="progress-section">
        <div className="progress-label"><span>Current Challenge</span><span>{xp % 100}/100 XP</span></div>
        <div className="progress-bar"><div className="progress-fill" style={{width: `${xp % 100}%`}}></div></div>
      </div>

      <div className="challenge-card">
        {!question ? (
          <div className="question-text">{loading ? "Fetching unique MCQ..." : "Ready to start?"}</div>
        ) : (
          <>
            <div className="question-text">{question.question}</div>
            <div className="options-grid">
              {question.options.map((opt, i) => {
                const isCorrectOpt = opt.trim().toLowerCase() === question.answer.trim().toLowerCase();
                let status = selected === opt ? "selected" : "";
                if (isSubmitted) {
                  if (isCorrectOpt) status = "correct";
                  else if (selected === opt) status = "wrong";
                }
                return (
                  <button key={i} disabled={isSubmitted} onClick={() => setSelected(opt)} className={`option-btn ${status}`}>{opt}</button>
                );
              })}
            </div>
            {isSubmitted && (
              <div className="explanation-container">
                <div className="explanation-tag">{streak > 0 ? "STREAK CONTINUES! ✅" : "STREAK BROKEN! ❌"}</div>
                <p className="explanation-text">{question.explanation}</p>
              </div>
            )}
          </>
        )}
        <div className="card-footer">
          <button className="hint-btn">💡 Hint</button>
          <button className="submit-btn" onClick={!question || isSubmitted ? () => fetchQuestion() : handleSubmit}>
            {!question ? "Start" : isSubmitted ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default App;