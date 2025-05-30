# 🤖 Cloud Run Task Bot for AI Agents

This repository contains the core code for the Cloud Run Task Bot, a backend service designed to generate dynamic prompts, game ideas, and therapeutic advice for AI agents (like Nexus and Lumie).

## ✨ Features

-   **Secure Endpoint:** Authenticates incoming requests using a custom API key.
-   **Dynamic Prompt Generation:** Fetches scenario-specific rules from GitHub and uses them to craft prompts for Together.ai's LLM.
-   **Together.ai Integration:** Leverages Llama-3-8b-Instruct (or similar) for AI text generation.
-   **Configurable Responses:** Supports both visible JSON responses and silent (204 No Content) operations.
-   **Logging:** Basic console logging for debugging and monitoring.
-   **Dockerized:** Ready for deployment on Google Cloud Run.

## 🚀 Getting Started

### 1. Project Setup

Create a new directory on your local machine for this project and place all the files (`cloudRunTaskBot.js`, `package.json`, `.env.example`, `.gitignore`, `Dockerfile`, `README.md`) inside it.

### 2. Install Dependencies

Open your terminal or command prompt, navigate to your project directory, and run:

```bash
npm install
