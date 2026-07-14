const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const geminiService = require('../services/geminiService');
const sessionStore = require('../services/sessionStore');

const SYSTEM_PROMPT = `You are a helpful, friendly Q&A assistant built for a college demo project.
Answer clearly and concisely. If you don't know something, say so honestly.`;

/**
 * POST /api/chat
 * body: { message: string, sessionId?: string }
 * returns: { reply: string, sessionId: string }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    let { sessionId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A non-empty "message" field is required.' });
    }

    // Create a new session id if the client doesn't already have one
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Save the user's message to history
    sessionStore.addMessage(sessionId, 'user', message);

    // Build the message list to send to Gemini
    const history = sessionStore.getHistory(sessionId);

    const reply = await geminiService.getChatCompletion(history, SYSTEM_PROMPT);

    // Save assistant reply to history
    sessionStore.addMessage(sessionId, 'assistant', reply);

    res.json({ reply, sessionId });
  } catch (err) {
    console.error('Error in /api/chat:', err.message);
    res.status(500).json({ error: 'Something went wrong while contacting the AI service.' });
  }
});

/**
 * POST /api/chat/reset
 * body: { sessionId: string }
 * Clears conversation history for a session (new chat)
 */
router.post('/chat/reset', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required.' });
  }
  sessionStore.clearHistory(sessionId);
  res.json({ status: 'ok' });
});

module.exports = router;
