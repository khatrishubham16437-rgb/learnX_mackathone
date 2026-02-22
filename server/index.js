const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');

const app = express();
const ollama = new Ollama();

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { topic, difficulty, exclude } = req.body;
  const excludeText = exclude && exclude.length > 0 ? exclude.join(", ") : "none";

  const prompt = `Generate 1 unique C++ MCQ. Topic: ${topic}, Level: ${difficulty}.
  Avoid these: [${excludeText}].
  Return ONLY JSON:
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "...",
    "explanation": "..."
  }`;

  try {
    const response = await ollama.generate({
      model: 'llama3.2',
      prompt: prompt,
      format: 'json',
      stream: false,
      options: { temperature: 0.9 }
    });
    res.json(JSON.parse(response.response));
  } catch (error) {
    res.status(500).json({ error: "AI Error" });
  }
});

app.listen(5000, () => console.log("Backend Running: 5000"));