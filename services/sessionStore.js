const config = require('../config/config');

/**
 * Very simple in-memory store: sessionId -> array of messages.
 * Good enough for a college mini-project / demo.
 * NOTE: data is lost on server restart, and this won't scale across
 * multiple server instances. For production you'd swap this for
 * Redis or a database table.
 */
const sessions = new Map();

function getHistory(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId);
}

function addMessage(sessionId, role, content) {
  const history = getHistory(sessionId);
  history.push({ role, content });

  // Trim history so we don't send unbounded context to the API
  const maxLen = config.maxHistoryLength * 2; // user+assistant pairs
  if (history.length > maxLen) {
    history.splice(0, history.length - maxLen);
  }
}

function clearHistory(sessionId) {
  sessions.set(sessionId, []);
}

module.exports = { getHistory, addMessage, clearHistory };
