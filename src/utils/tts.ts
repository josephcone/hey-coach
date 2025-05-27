import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hey-coach-seven.vercel.app';

export const speakMessage = async (text: string): Promise<void> => {
  try {
    console.log('Sending TTS request for text:', text);
    
    const response = await axios.post(`${API_URL}/api/tts`, { text }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    if (response.status !== 200) {
      console.error('TTS API error:', response.status, response.statusText);
      throw new Error(`TTS API returned ${response.status}: ${response.statusText}`);
    }

    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error in speakMessage:', error);
    throw error;
  }
}; 