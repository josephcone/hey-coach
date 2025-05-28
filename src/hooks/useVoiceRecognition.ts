import { useState, useCallback, useRef } from 'react';
import { API_URL } from '../config/openai';

interface UseVoiceRecognitionProps {
  onTranscriptChange?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition({ onTranscriptChange, onError }: UseVoiceRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionIdRef = useRef<string>(`session-${Date.now()}`);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            // Convert audio data to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              
              // Send audio data to server
              const response = await fetch(`${API_URL}/api/process-audio`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  audioData: base64Audio,
                  sessionId: sessionIdRef.current
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to process audio');
              }

              const data = await response.json();
              if (data.text) {
                setTranscript(data.text);
                onTranscriptChange?.(data.text);
              }
            };
            reader.readAsDataURL(event.data);
          } catch (error) {
            console.error('Error processing audio:', error);
            onError?.(error instanceof Error ? error.message : 'Failed to process audio');
          }
        }
      };

      mediaRecorder.start(1000); // Send data every second
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to start recording');
      setIsListening(false);
    }
  }, [onTranscriptChange, onError]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
}
 