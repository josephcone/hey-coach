import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const speakMessage = async (text: string): Promise<void> => {
  try {
    const response = await axios.post(`${API_URL}/api/tts`, { text }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error('Error playing TTS:', error);
    throw error;
  }
}; 