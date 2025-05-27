import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const API_URL = process.env.REACT_APP_API_URL || 'https://hey-coach-seven.vercel.app';

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
    throw error;
  }
}

// Helper function to create a WebSocket connection to the Realtime API
export function createRealtimeConnection(onMessage: (text: string) => void, onError: (error: string) => void): WebSocket {
  // Use our server as a proxy
  const wsUrl = API_URL.replace(/^http/, 'ws');
  const ws = new WebSocket(`${wsUrl}/ws`);

  ws.onopen = () => {
    console.log('WebSocket connection opened');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      if (data.type === 'transcript') {
        onMessage(data.text);
      } else if (data.type === 'error') {
        onError(data.error || 'Unknown error from OpenAI API');
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      onError('Failed to parse WebSocket message');
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    onError('WebSocket error occurred');
  };

  ws.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
    if (event.code !== 1000) {
      onError(`WebSocket connection closed: ${event.reason || 'Unknown reason'}`);
    }
  };

  return ws;
}

export default openai; 