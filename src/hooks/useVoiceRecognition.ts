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
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      // Initialize WebSocket connection
      socketRef.current = createRealtimeConnection(
        (text) => {
          setTranscript(text);
          onTranscriptChange?.(text);
        },
        (error) => {
          console.error('Realtime API error:', error);
          onError?.(error);
          stopListening();
        }
      );

      // Handle WebSocket connection
      socketRef.current.onopen = () => {
        console.log('WebSocket connection opened');
        mediaRecorder.start(100); // Send data every 100ms
        setIsListening(true);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('Failed to connect to speech recognition service');
        stopListening();
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        stopListening();
      };

      // Send audio data to WebSocket
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to access microphone');
      stopListening();
    }
  }, [onTranscriptChange, onError]);

  const stopListening = useCallback(() => {
    try {
      // Stop media recorder
      if (mediaRecorderRef.current && isListening) {
        mediaRecorderRef.current.stop();
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Close WebSocket connection
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }

      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      onError?.(error instanceof Error ? error.message : 'Error stopping voice recognition');
    }
  }, [isListening, onError]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
}
 