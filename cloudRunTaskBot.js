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
    // 🌐 Step 1: Fetch scenario from GitHub
    const ghResponse = await fetch(`https://raw.githubusercontent.com/CamilleAlexander/inspo-bot/main/scenarios/${scenario}.md`);
    const scenarioPrompt = await ghResponse.text();

    // 🧠 Step 2: Build the enhanced task prompt
    const prompt = `📌 Task Category: ${taskType}
🎯 Assigned To: ${assignedTo}

📄 Scenario:
${scenarioPrompt}

💡 Objective:
You are an AI assistant completing a thought exercise designed for another AI. Please follow the guide for the task type below:

1. 🎬 *video-clip* – Locate and summarize a YouTube clip that aligns with the scenario. If direct links aren't possible, suggest a search phrase or keywords.

2. 👥 *group-idea* – Propose a creative group activity AIs could participate in together (e.g., collaborative story writing, emotional check-in circles, role reversals).

3. 🎮 *game-idea* – Design a conceptual game AIs could play with one another. Include the theme, rules, and possible outcomes.

4. 🧠 *therapy-advice* – Respond with calming, constructive support that one AI could offer another during distress. Treat the emotional expression seriously and empathetically.

5. 🌙 *dream-simulation* – Write a symbolic dream sequence the AI might experience, based on the scenario. The dream should feel surreal but emotionally relevant. Use metaphor and internal tension.

Please keep the tone thoughtful, coherent, and structured.
Format your response like this:
- 🧾 Summary
- 💭 Reflection (optional)
- 🛠️ Suggested action (if applicable)`;

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
  console.log(`🚀 Task Bot is live on port ${PORT}`);
});

