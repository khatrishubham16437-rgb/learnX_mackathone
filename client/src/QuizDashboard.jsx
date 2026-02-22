import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedLanguage = location.state?.language || 'C++';
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: selectedLanguage })
    })
    .then(res => res.json())
    .then(data => {
      setQuestions(Array.isArray(data) ? data : [data]);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [selectedLanguage]);

  if (loading) return <div className="min-h-screen bg-[#0b1120] text-white flex items-center justify-center text-2xl italic animate-pulse">Llama3 is thinking...</div>;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black">Practice <span className="text-blue-500">{selectedLanguage}</span></h1>
        <button onClick={() => navigate('/')} className="bg-red-500 px-6 py-2 rounded-xl font-bold">Exit</button>
      </header>
      <div className="grid gap-6">
        {questions.map((q, i) => (
          <div key={i} className="bg-slate-900/60 p-8 rounded-3xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">{q.question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {q.options?.map((opt, j) => (
                <button key={j} className="text-left bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500 transition-all">{opt}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizDashboard;