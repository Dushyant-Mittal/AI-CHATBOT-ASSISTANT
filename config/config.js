require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta',
  maxHistoryLength: 10 // number of past messages to keep in context per session
};
