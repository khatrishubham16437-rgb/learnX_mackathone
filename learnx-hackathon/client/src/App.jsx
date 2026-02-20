// client/src/App.jsx
import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const getNewQuestion = async () => {
    setLoading(true);
    setQuestion(null);
    setSelected(null);
    try {
      const res = await axios.post('http://localhost:5000/api/generate', {
        topic: 'C++ Programming',
        difficulty: score >= 3 ? 'Intermediate' : 'Beginner'
      });
      setQuestion(res.data);
    } catch (err) {
      alert("Error: Backend se connect nahi ho raha!");
    }
    setLoading(false);
  };

  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt.trim() === question.answer.trim()) {
      setScore(s => s + 1);
    }
  };

  return (
    <div className="App">
      <h1>LearnX Dashboard</h1>
      
      <div className="score-container">STREAK: {score} 🔥</div>

      <div className="progress-wrapper">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min((score / 10) * 100, 100)}%` }}
        ></div>
      </div>

      {!question ? (
        <button className="action-btn" onClick={getNewQuestion} disabled={loading}>
          {loading ? "GENERATING CHALLENGE..." : "START LEARNING SESSION"}
        </button>
      ) : (
        <div className="question-card">
          <h2>{question.question}</h2>
          <div className="options-layout">
            {question.options.map((opt, i) => {
              let status = "";
              if (selected) {
                if (opt.trim() === question.answer.trim()) status = "correct";
                else if (opt === selected) status = "wrong";
              }
              return (
                <button 
                  key={i} 
                  className={`option-button ${status}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          
          {selected && (
            <div style={{textAlign: 'center'}}>
              <button className="action-btn" onClick={getNewQuestion}>
                CONTINUE TO NEXT LEVEL ➡️
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;