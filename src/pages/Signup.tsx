import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async () => {
    try {
      await signup('test@example.com', 'password');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to sign up:', error);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="text-4xl font-bold">Signup</div>
    </div>
  );
};

export default Signup; 