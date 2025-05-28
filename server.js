const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: ['https://hey-coach-seven.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket server');

  // Create connection to OpenAI
  const openaiWs = new WebSocket('wss://api.openai.com/v1/audio/realtime');

  openaiWs.on('open', () => {
    console.log('Connected to OpenAI WebSocket');
    // Send authentication
    openaiWs.send(JSON.stringify({
      type: 'auth',
      token: process.env.OPENAI_API_KEY
    }));
  });

  // Forward messages from client to OpenAI
  ws.on('message', (data) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data);
    }
  });

  // Forward messages from OpenAI to client
  openaiWs.on('message', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  // Handle errors
  openaiWs.on('error', (error) => {
    console.error('OpenAI WebSocket error:', error);
    ws.send(JSON.stringify({ type: 'error', error: 'OpenAI connection error' }));
  });

  ws.on('error', (error) => {
    console.error('Client WebSocket error:', error);
  });

  // Clean up on close
  ws.on('close', () => {
    console.log('Client disconnected');
    openaiWs.close();
  });

  openaiWs.on('close', () => {
    console.log('OpenAI connection closed');
    ws.close();
  });
});

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
          // Send transcript back to client
          res.json({ text: response.text });
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

  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
}); 