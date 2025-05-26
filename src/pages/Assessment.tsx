import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Assessment() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const startListening = () => {
    setIsListening(true);
    // TODO: Implement voice recognition
  };

  const stopListening = () => {
    setIsListening(false);
    // TODO: Stop voice recognition
  };

  const handleAssessmentComplete = () => {
    setAssessmentComplete(true);
    // TODO: Save assessment data
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Let's Get to Know You
          </h2>
          <p className="mt-3 text-xl text-gray-500">
            I'll ask you some questions to understand your goals and preferences
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isListening ? 'Stop Listening' : 'Start Assessment'}
                  </button>
                </div>

                {isListening && (
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-sm text-gray-500">
                          Listening...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {transcript && (
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{transcript}</p>
                    </div>
                  </div>
                )}

                {assessmentComplete && (
                  <div className="mt-4">
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Assessment Complete
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              Thank you for sharing! Let's get started with your
                              personalized plan.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 