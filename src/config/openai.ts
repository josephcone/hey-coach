import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function speakMessage(text: string): Promise<void> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (error) {
    console.error('Error generating speech:', error);
  }
}

// Helper function to create a WebSocket connection to the Realtime API
export function createRealtimeConnection(onMessage: (text: string) => void, onError: (error: string) => void): WebSocket {
  const ws = new WebSocket('wss://api.openai.com/v1/audio/realtime');

  ws.onopen = () => {
    // Send authentication
    ws.send(JSON.stringify({
      type: 'auth',
      token: process.env.REACT_APP_OPENAI_API_KEY
    }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'transcript') {
        onMessage(data.text);
      }
    } catch (error) {
      onError('Failed to parse WebSocket message');
    }
  };

  ws.onerror = (error) => {
    onError('WebSocket error occurred');
    console.error('WebSocket error:', error);
  };

  return ws;
}

export default openai; 