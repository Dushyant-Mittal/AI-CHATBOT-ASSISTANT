const fetch = require('node-fetch');
const config = require('../config/config');

/**
 * Converts our internal history format ({role: 'user'|'assistant', content})
 * into the format the Gemini API expects ({role: 'user'|'model', parts: [{text}]}).
 */
function toGeminiContents(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Sends a conversation (array of {role, content} messages) to the Gemini API
 * and returns the assistant's reply text.
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @param {string} systemPrompt - instructions describing the assistant's persona/behavior
 * @returns {Promise<string>} assistant reply text
 */
async function getChatCompletion(messages, systemPrompt) {
  if (!config.geminiApiKey) {
    throw new Error(
      'Missing GEMINI_API_KEY. Please add it to your .env file (see .env.example).'
    );
  }

  const url = `${config.geminiApiUrl}/models/${config.geminiModel}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.geminiApiKey
    },
    body: JSON.stringify({
      contents: toGeminiContents(messages),
      systemInstruction: {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  const candidate = data.candidates && data.candidates[0];
  const textPart =
    candidate && candidate.content && candidate.content.parts
      ? candidate.content.parts.find((p) => typeof p.text === 'string')
      : null;

  return textPart ? textPart.text : '';
}

module.exports = { getChatCompletion };
