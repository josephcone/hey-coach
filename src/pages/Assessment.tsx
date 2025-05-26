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
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div
        className="relative mx-auto w-full h-full flex flex-col items-center justify-center"
        style={{
          aspectRatio: '9/16',
          maxWidth: '562.5px', // 1000px height * 9/16
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
              Tap and say<br />"Hey Coach"
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
            <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', marginBottom: '2rem', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/loose-waves.png"
                alt="Listening waves"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="mt-4 text-gray-500">Listening...</div>
            <button
              className="mt-8 px-6 py-2 bg-black text-white rounded-full"
              onClick={handleStartSpeaking}
            >
              Simulate Speaking
            </button>
          </div>
        )}

        {mode === 'speaking' && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', marginBottom: '2rem', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/tight-waves.png"
                alt="Speaking waves"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="mt-4 text-gray-500">Speaking...</div>
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