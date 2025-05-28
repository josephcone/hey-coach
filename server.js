const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: ['https://hey-coach-seven.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Length'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store active sessions
const sessions = new Map();

// Handle audio processing
app.post('/api/process-audio', async (req, res) => {
  try {
    const { audioData, sessionId } = req.body;

    if (!audioData || !sessionId) {
      return res.status(400).json({ error: 'Audio data and session ID are required' });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');

    // Create WebSocket connection to OpenAI
    const ws = new WebSocket('wss://api.openai.com/v1/audio/realtime');

    ws.on('open', () => {
      console.log('Connected to OpenAI WebSocket');
      // Send authentication
      ws.send(JSON.stringify({
        type: 'auth',
        token: process.env.OPENAI_API_KEY
      }));
    });

    ws.on('message', (data) => {
      try {
        const response = JSON.parse(data);
        if (response.type === 'transcript') {
          // Store transcript in session
          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, []);
          }
          sessions.get(sessionId).push(response.text);
        }
      } catch (error) {
        console.error('Error processing OpenAI response:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('OpenAI WebSocket error:', error);
      res.status(500).json({ error: 'OpenAI connection error' });
    });

    // Send audio data to OpenAI
    ws.send(audioBuffer);

    // Send initial response
    res.json({ success: true });

  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// SSE endpoint for getting transcripts
app.get('/api/transcripts/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'https://hey-coach-seven.vercel.app');

  // Send initial connection message
  res.write('event: connected\ndata: connected\n\n');

  // Function to send transcripts
  const sendTranscripts = () => {
    if (sessions.has(sessionId)) {
      const transcripts = sessions.get(sessionId);
      if (transcripts.length > 0) {
        res.write(`data: ${JSON.stringify({ transcripts })}\n\n`);
        sessions.set(sessionId, []); // Clear sent transcripts
      }
    }
  };

  // Send transcripts every second
  const interval = setInterval(sendTranscripts, 1000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    sessions.delete(sessionId);
  });
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Generating speech for text:', text);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Access-Control-Allow-Origin', 'https://hey-coach-seven.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send(buffer);
  } catch (error) {
    console.error('TTS API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message 
    });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 