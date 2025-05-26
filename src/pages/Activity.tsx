import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { speakMessage } from '../config/openai';

const Activity: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentActivity, setCurrentActivity] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout>();

  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({
    onTranscriptChange: (newTranscript: string) => {
      setCurrentActivity(newTranscript);
      // Provide voice feedback for the activity
      speakMessage(`I heard you say: ${newTranscript}`);
    },
    onError: (error: string) => {
      console.error('Voice recognition error:', error);
      speakMessage('Sorry, I had trouble understanding that. Could you please repeat?');
    }
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      speakMessage('Time is up! Great job!');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timer]);

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    setTimerActive(true);
    speakMessage(`Starting timer for ${seconds} seconds`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center">Activity Session</h2>
                
                <div className="flex justify-center space-x-4 mb-8">
                  <button
                    onClick={() => startTimer(30)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    30s
                  </button>
                  <button
                    onClick={() => startTimer(60)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    1m
                  </button>
                  <button
                    onClick={() => startTimer(120)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    2m
                  </button>
                </div>

                {timer > 0 && (
                  <div className="text-center text-3xl font-bold mb-8">
                    {formatTime(timer)}
                  </div>
                )}

                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-full py-2 px-4 rounded ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>

                {currentActivity && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Current Activity:</h3>
                    <p>{currentActivity}</p>
                  </div>
                )}

                {transcript && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Transcript:</h3>
                    <p>{transcript}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity; 