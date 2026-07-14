const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');

// Persist sessionId in localStorage so a page refresh keeps the same conversation
let sessionId = localStorage.getItem('chatSessionId') || null;

function appendMessage(text, sender, isError = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = `bubble${isError ? ' error' : ''}`;
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return messageDiv;
}

function appendTypingIndicator() {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.id = 'typingIndicator';

  const bubble = document.createElement('div');
  bubble.className = 'bubble typing';
  bubble.textContent = 'Thinking...';

  messageDiv.appendChild(bubble);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  messageInput.value = '';
  sendBtn.disabled = true;
  appendTypingIndicator();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });

    const data = await response.json();
    removeTypingIndicator();

    if (!response.ok) {
      appendMessage(data.error || 'Something went wrong.', 'bot', true);
      return;
    }

    // Save session id for future requests
    sessionId = data.sessionId;
    localStorage.setItem('chatSessionId', sessionId);

    appendMessage(data.reply, 'bot');
  } catch (err) {
    removeTypingIndicator();
    appendMessage('Could not reach the server. Is the backend running?', 'bot', true);
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
});

resetBtn.addEventListener('click', async () => {
  if (sessionId) {
    await fetch('/api/chat/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
  }
  localStorage.removeItem('chatSessionId');
  sessionId = null;
  chatWindow.innerHTML = '';
  appendMessage("Hi! I'm your AI assistant. Ask me anything to get started.", 'bot');
});
