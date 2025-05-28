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
  const wsRef = useRef<WebSocket | null>(null);

  const startListening = useCallback(async () => {
    try {
      // Connect to our WebSocket server
      const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection opened');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transcript') {
            setTranscript(data.text);
            onTranscriptChange?.(data.text);
          } else if (data.type === 'error') {
            console.error('WebSocket error:', data.error);
            onError?.(data.error);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          onError?.(error instanceof Error ? error.message : 'Failed to parse WebSocket message');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('WebSocket error occurred');
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        if (event.code !== 1000) {
          onError?.(`WebSocket connection closed: ${event.reason || 'Unknown reason'}`);
        }
      };

      // Start recording audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
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
    if (wsRef.current) {
      wsRef.current.close();
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
 