import axios from 'axios';

export const speakMessage = async (text: string): Promise<void> => {
  try {
    const response = await axios.post('/api/tts', { text });
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (error) {
    console.error('Error playing TTS:', error);
  }
}; 