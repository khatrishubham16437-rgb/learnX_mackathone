const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');

const app = express();
const ollama = new Ollama();

app.use(cors()); // Isse Frontend aur Backend bina kisi error ke baat kar payenge
app.use(express.json());

// Ye wo raasta (API) hai jise React use karega questions mangne ke liye
app.post('/api/generate', async (req, res) => {
  const { topic, difficulty } = req.body;

  // AI ko instructions dena (Prompting)
  const prompt = `You are a teacher. Generate a ${difficulty} level MCQ about ${topic}.
Return ONLY JSON. 
CRITICAL: The "answer" field MUST be EXACTLY the same string as one of the options.

Format:
{
  "question": "...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Option A" 
}`;
  try {
    const response = await ollama.generate({
      model: 'llama3.2', // Make sure aapne 'ollama pull llama3.2' kiya ho
      prompt: prompt,
      format: 'json',
      stream: false
    });
    
    res.json(JSON.parse(response.response));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ollama connected nahi hai!" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server started on http://localhost:${PORT}`));