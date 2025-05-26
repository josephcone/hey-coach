export const createRealtimeConnection = async (onTranscript: (text: string) => void) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const ws = new WebSocket('wss://api.openai.com/v1/audio/realtime');

  ws.onopen = () => {
    console.log('WebSocket connection established');
    // Send authentication message
    ws.send(JSON.stringify({
      type: 'auth',
      token: apiKey
    }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'transcript') {
        onTranscript(data.text);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  };

  return ws;
}; 