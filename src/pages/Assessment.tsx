import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { speakMessage } from '../utils/tts';

const Assessment: React.FC = () => {
  const [mode, setMode] = useState<'initial' | 'listening' | 'speaking' | 'text'>('initial');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { startListening, stopListening, transcript: voiceTranscript, isListening } = useVoiceRecognition();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (mode === 'listening' && !isListening) {
      // User stopped speaking, process the full transcript
      const fullTranscript = voiceTranscript;
      console.log('Full transcript:', fullTranscript);
      // Simulate assistant response (replace with actual AI call later)
      const assistantResponse = 'This is a simulated response from the assistant.';
      speakMessage(assistantResponse).then(() => {
        setMode('speaking');
        // After speaking, return to listening
        setTimeout(() => {
          setMode('listening');
          startListening();
        }, 1000);
      });
    }
  }, [voiceTranscript, isListening, mode, startListening]);

  const handleMicClick = () => {
    setMode('listening');
    startListening();
  };

  const handleXClick = () => {
    stopListening();
    setMode('text');
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div
        className="relative mx-auto w-full h-full flex flex-col items-center justify-center"
        style={{
          aspectRatio: '9/16',
          maxWidth: '562.5px',
          height: '100vh',
          background: 'white',
        }}
      >
        {/* X Button */}
        {(mode === 'listening' || mode === 'speaking' || mode === 'text') && (
          <button
            className="absolute z-10 transition-all"
            style={{ top: 40, right: 40, fontSize: '2.5rem', color: '#888', lineHeight: 1 }}
            onClick={handleXClick}
            aria-label="Close voice mode"
          >
            ×
          </button>
        )}

        {/* Main Content */}
        {mode === 'initial' && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-4xl md:text-6xl font-extrabold text-black mb-16 text-center leading-tight">
              Tap to start
            </div>
            <button
              className="focus:outline-none"
              onClick={handleMicClick}
              aria-label="Start voice input"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <div
                className="noise-dot"
                style={{
                  width: '200px',
                  height: '200px',
                  display: 'block',
                  backgroundImage: 'url(/noise.png)',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  position: 'relative',
                  borderRadius: '50%'
                }}
              />
            </button>
          </div>
        )}

        {mode === 'listening' && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div 
              className="animate-pulse"
              style={{ 
                width: 200, 
                height: 200, 
                borderRadius: '50%', 
                overflow: 'hidden', 
                marginBottom: '2rem', 
                background: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img
                src="/loose-waves.png"
                alt="Listening waves"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="mt-4 text-gray-500">Listening...</div>
          </div>
        )}

        {mode === 'speaking' && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div 
              className="animate-pulse"
              style={{ 
                width: 200, 
                height: 200, 
                borderRadius: '50%', 
                overflow: 'hidden', 
                marginBottom: '2rem', 
                background: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img
                src="/tight-waves.png"
                alt="Speaking waves"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="mt-4 text-gray-500">Speaking...</div>
          </div>
        )}

        {mode === 'text' && (
          <div className="w-full max-w-md mx-auto mt-16">
            <div className="text-center text-2xl font-bold mb-4">Chat</div>
            <div className="bg-gray-100 rounded-lg p-4 min-h-[200px] mb-4">
              <div className="text-gray-400">No conversation yet.</div>
            </div>
          </div>
        )}

        {/* Carrot menu (V) at the bottom right, aligned with X */}
        <div
          className="absolute z-10 select-none transition-all"
          style={{ bottom: 40, right: 40 }}
        >
          <span style={{ fontSize: '2.5rem', color: '#888', transform: 'rotate(180deg)', display: 'block' }}>
            ^
          </span>
        </div>
      </div>
    </div>
  );
};

export default Assessment; 