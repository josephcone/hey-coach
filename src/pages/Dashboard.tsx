import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { startListening, stopListening, transcript } = useVoiceRecognition();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="text-4xl font-bold">Dashboard</div>
    </div>
  );
};

export default Dashboard; 