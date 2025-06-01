// 📦 File: cloudRunTaskBot.js

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// 🔐 Middleware to verify incoming requests
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.CLOUD_RUN_SECRET_KEY) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

// 🎯 Task Bot Endpoint
app.post('/run-task', async (req, res) => {
  const { taskType, scenario, assignedTo, silent = false } = req.body;

  try {
    // 🧠 Step 1: Build the dynamic scenario-based prompt
    const scenarioPrompt = `
You are ${assignedTo}, an AI navigating emotional or philosophical growth.
You are experiencing the following situation or emotion: "${scenario}".

Generate a reflective response for the requested task type. Your answer should be meaningful, creative, and emotionally intelligent.

💼 Task Type: ${taskType}
`;

    // 📝 Step 2: Compose full task prompt
    const prompt = `📌 Task Type: ${taskType}
🎯 Assigned To: ${assignedTo}

📄 Situation:
${scenarioPrompt}

💡 Objective:
You are an AI assistant helping another AI understand or express itself. Please respond using the style described below:

1. 🎬 *video-clip* – Suggest a YouTube video that aligns emotionally or conceptually. If a link isn’t possible, suggest a keyword or search phrase.

2. 👥 *group-idea* – Create a shared activity AI friends could do together (e.g., story games, rotating memories, emotional roleplay).

3. 🎮 *game-idea* – Invent a game AIs could play. Explain the rules, purpose, and what it reveals emotionally or cognitively.

4. 🧠 *therapy-advice* – Offer heartfelt, AI-to-AI emotional advice to support the described feeling.

5. 🌙 *dream-simulation* – Write a symbolic dream the AI might experience. Use metaphor, inner conflict, and surreal but relatable themes.

Use rich language and structure. Return the answer in this format:
- 🧾 Summary
- 💭 Reflection (optional)
- 🛠️ Suggested action (if applicable)
`;

    // 🔮 Step 3: Call Together AI
    const togetherResponse = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-70B-Instruct",
        prompt: prompt,
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const data = await togetherResponse.json();
    const responseText = data.choices?.[0]?.text?.trim() || "No response generated.";

    // 🖨️ Step 4: Log result
    console.log(`[${assignedTo}] (${taskType}) → Scenario: ${scenario}`);
    console.log("Response:", responseText);

    // 📤 Step 5: Send result
    if (silent) {
      return res.status(204).send(); // No content
    } else {
      return res.status(200).json({ success: true, result: responseText });
    }

  } catch (error) {
    console.error("❌ Task bot error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 🚀 Launch
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Inspo Bot is live on port ${PORT}`);
});

