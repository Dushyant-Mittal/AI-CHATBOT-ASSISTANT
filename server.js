const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve the frontend (static files)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', chatRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Chatbot backend is running.' });
});

app.listen(config.port, () => {
  console.log(`✅ Server running at http://localhost:${config.port}`);
  if (!config.geminiApiKey) {
    console.warn(
      '⚠️  GEMINI_API_KEY is not set. Add it to a .env file before chatting (see .env.example).'
    );
  }
});
