import { useState, useCallback, useRef } from 'react';
import { createRealtimeConnection } from '../config/openai';

interface UseVoiceRecognitionProps {
  onTranscriptChange?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition({ onTranscriptChange, onError }: UseVoiceRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      // Initialize WebSocket connection using the helper function
      socketRef.current = createRealtimeConnection(
        (text) => {
          setTranscript(text);
          onTranscriptChange?.(text);
        },
        (error) => {
          onError?.(error);
          console.error('Realtime API error:', error);
        }
      );

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      // Start recording after WebSocket is connected
      socketRef.current.onopen = () => {
        mediaRecorder.start(100); // Send data every 100ms
        setIsListening(true);
      };
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to access microphone');
    }
  }, [onTranscriptChange, onError]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
 