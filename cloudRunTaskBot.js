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
    // Step 1: Fetch scenario rules from GitHub
    // IMPORTANT: Replace YOUR_USERNAME/YOUR_REPO with your actual GitHub username and repository name
    const ghResponse = await fetch(`https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/scenarios/${scenario}.md`);
    const scenarioPrompt = await ghResponse.text();

    // Step 2: Build Together.ai payload
    const togetherResponse = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-Instruct",
        prompt: `You are ${assignedTo}. Complete the following task:

${scenarioPrompt}`,
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const data = await togetherResponse.json();
    const responseText = data.choices?.[0]?.text?.trim() || "No response generated.";

    // Step 3: Log or send the result
    console.log(`[${assignedTo}] (${taskType}) → Scenario: ${scenario}`);
    console.log("Response:", responseText);

    if (silent) {
      return res.status(204).send(); // No Content
    } else {
      return res.status(200).json({ success: true, result: responseText });
    }

  } catch (error) {
    console.error("Task bot error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🌤️ Task Bot running on port ${PORT}`);
});
