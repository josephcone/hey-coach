const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

admin.initializeApp();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Listen for new audio data
exports.processAudio = functions.database
  .ref('/audio/{sessionId}')
  .onCreate(async (snapshot, context) => {
    try {
      const { sessionId } = context.params;
      const { data: base64Audio } = snapshot.val();

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(base64Audio.split(',')[1], 'base64');

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

      ws.on('message', async (data) => {
        try {
          const response = JSON.parse(data);
          if (response.type === 'transcript') {
            // Update transcript in Firebase
            await admin.database().ref(`transcripts/${sessionId}`).set({
              text: response.text,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          console.error('Error processing OpenAI response:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('OpenAI WebSocket error:', error);
      });

      // Send audio data to OpenAI
      ws.send(audioBuffer);

      // Clean up after 30 seconds
      setTimeout(() => {
        ws.close();
        // Remove the audio data
        snapshot.ref.remove();
      }, 30000);

    } catch (error) {
      console.error('Error processing audio:', error);
    }
  }); 