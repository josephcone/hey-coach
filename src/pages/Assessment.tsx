import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// SVGs for waves (static for now, can animate later)
const WideWaves = () => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0, 1, 2, 3, 4].map(i => (
      <path
        key={i}
        d={`M10 ${20 + i * 10} Q60 ${10 + i * 10}, 110 ${20 + i * 10}`}
        stroke="#222" strokeWidth="2" fill="none"
      />
    ))}
  </svg>
);

const TightWaves = () => (
  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0, 1, 2, 3, 4, 5, 6].map(i => (
      <path
        key={i}
        d={`M20 ${15 + i * 8} Q60 ${10 + i * 8}, 100 ${15 + i * 8}`}
        stroke="#222" strokeWidth="1.5" fill="none"
      />
    ))}
  </svg>
);

const Assessment: React.FC = () => {
  const [mode, setMode] = useState<'initial' | 'listening' | 'speaking' | 'text'>('initial');
  const [transcript, setTranscript] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleMicClick = () => setMode('listening');
  const handleXClick = () => setMode('text');
  const handleStartSpeaking = () => setMode('speaking');
  const handleStopSpeaking = () => setMode('listening');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative">
      {/* X Button */}
      {(mode === 'listening' || mode === 'speaking' || mode === 'text') && (
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black focus:outline-none"
          onClick={handleXClick}
          aria-label="Close voice mode"
        >
          ×
        </button>
      )}

      {/* Main Content */}
      {mode === 'initial' && (
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-black mb-8 text-center">
            Tap and say<br />"Hey Coach"
          </div>
          <button
            className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center shadow-lg mb-2"
            onClick={handleMicClick}
            aria-label="Start voice input"
          >
            {/* Static noise effect can be added later */}
          </button>
        </div>
      )}

      {mode === 'listening' && (
        <div className="flex flex-col items-center">
          <WideWaves />
          <div className="mt-8 text-gray-500">Listening...</div>
          <button
            className="mt-8 px-6 py-2 bg-black text-white rounded-full"
            onClick={handleStartSpeaking}
          >
            Simulate Speaking
          </button>
        </div>
      )}

      {mode === 'speaking' && (
        <div className="flex flex-col items-center">
          <TightWaves />
          <div className="mt-8 text-gray-500">Speaking...</div>
          <button
            className="mt-8 px-6 py-2 bg-black text-white rounded-full"
            onClick={handleStopSpeaking}
          >
            Simulate Listening
          </button>
        </div>
      )}

      {mode === 'text' && (
        <div className="w-full max-w-md mx-auto mt-16">
          <div className="text-center text-2xl font-bold mb-4">Chat</div>
          <div className="bg-gray-100 rounded-lg p-4 min-h-[200px] mb-4">
            {transcript.length === 0 ? (
              <div className="text-gray-400">No conversation yet.</div>
            ) : (
              transcript.map((line, idx) => (
                <div key={idx} className="mb-2 text-black">{line}</div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment; 