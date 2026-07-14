# AI Q&A Chatbot Assistant (Mini Project)

A full-stack AI-integrated chatbot web application built with **Node.js + Express** on
the backend and the **Google Gemini API** for the AI/NLP capability. Includes a
simple browser-based chat UI on the frontend.

---

## 1. Project Overview

This project demonstrates how a web backend can integrate a third-party AI API to
build an intelligent Q&A assistant. Users type a question in the browser, the
message travels to the Express backend, the backend calls the Gemini API for a
response, and the reply is sent back and displayed in the chat window.

**Core features**
- REST API backend (Express.js)
- Real AI integration (Google Gemini API)
- Per-session conversation memory (so the AI remembers earlier turns in the chat)
- Simple, responsive chat UI (HTML/CSS/JS, no framework needed)
- Clean separation of concerns: routes / services / config

---

## 2. Architecture

```
Browser (public/index.html, script.js)
        |
        |  POST /api/chat  { message, sessionId }
        v
Express Server (server.js)
        |
        v
Chat Route (routes/chat.js)
        |
        |-- sessionStore.js  (keeps conversation history per session, in-memory)
        |
        v
geminiService.js  --->  Google Gemini API (generativelanguage.googleapis.com)
        |
        v
   AI-generated reply
        |
        v
   JSON response back to browser --> rendered in chat window
```

**Folder structure**
```
ai-chatbot-assistant/
├── config/
│   └── config.js          # loads environment variables
├── routes/
│   └── chat.js             # /api/chat and /api/chat/reset endpoints
├── services/
│   ├── geminiService.js      # talks to the Gemini API
│   └── sessionStore.js      # in-memory per-session chat history
├── public/
│   ├── index.html           # chat UI
│   ├── style.css
│   └── script.js
├── server.js                # Express app entry point
├── package.json
├── .env.example              # template for your API key
└── README.md
```

---

## 3. Setup Instructions

### Prerequisites
- Node.js v16 or higher installed
- A free Gemini API key (get one at https://aistudio.google.com/apikey — Google AI
  Studio gives a free tier, so no billing setup is required to get started)

### Steps

1. **Install dependencies**
   ```bash
   cd ai-chatbot-assistant
   npm install
   ```

2. **Configure your API key**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and paste your API key:
     ```
     GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

3. **Run the server**
   ```bash
   npm start
   ```
   You should see:
   ```
   ✅ Server running at http://localhost:3000
   ```

4. **Open the app**
   - Go to `http://localhost:3000` in your browser and start chatting.

---

## 4. API Endpoints (for your report / documentation)

| Method | Endpoint          | Body                              | Description                              |
|--------|-------------------|------------------------------------|-------------------------------------------|
| POST   | `/api/chat`       | `{ "message": "...", "sessionId": "optional" }` | Sends a user message, returns AI reply + sessionId |
| POST   | `/api/chat/reset` | `{ "sessionId": "..." }`           | Clears conversation history for a session |
| GET    | `/api/health`     | —                                   | Health check, confirms server is running |

**Example request (using curl):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?"}'
```

**Example response:**
```json
{
  "reply": "The capital of France is Paris.",
  "sessionId": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```

---

## 5. How the AI Integration Works (for viva/explanation)

1. The frontend sends the user's typed message plus a `sessionId` to `/api/chat`.
2. The backend looks up (or creates) that session's conversation history.
3. The new message is appended to the history array.
4. `geminiService.js` sends the **entire conversation history** (not just the
   latest message) to the Gemini API's `generateContent` endpoint, converting our
   internal `{role: 'user'|'assistant', content}` format into Gemini's expected
   `{role: 'user'|'model', parts: [{text}]}` format. A `systemInstruction` field
   defines the assistant's persona/behavior. Sending the full history is what gives
   the chatbot "memory" of earlier turns.
5. Gemini's reply is extracted from the API response (`candidates[0].content.parts`)
   and sent back to the browser, and also saved into the session history for the
   next turn.

This mirrors how real production chatbots (customer support bots, AI assistants)
are built — a thin backend layer manages sessions and forwards conversation state
to an LLM provider.

---

## 6. Possible Extensions (bonus points ideas)

- Swap the in-memory `sessionStore.js` for MongoDB/PostgreSQL so history survives restarts.
- Add user authentication so each logged-in user has their own saved chat history.
- Stream the AI's response token-by-token for a "typing" effect (Gemini supports
  `streamGenerateContent`).
- Add a subject-specific system prompt (e.g., "You are a math tutor") to specialize the bot.
- Deploy the backend (Render/Railway) and frontend (Vercel/Netlify) for a live demo link.

---

## 7. Notes

- Conversation history is stored **in-memory** (a JavaScript `Map`), so it resets
  when the server restarts. This is intentional for simplicity — mention in your
  report that a database would be used in a production system.
- Never commit your real `.env` file (with your actual API key) to GitHub —
  only commit `.env.example`.
- The default model is `gemini-2.5-flash` (fast and free-tier friendly). You can
  change `GEMINI_MODEL` in `.env` to another available Gemini model if you have
  access to one.
