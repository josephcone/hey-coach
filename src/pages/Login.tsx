import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to log in:', error);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="text-4xl font-bold">Login</div>
    </div>
  );
};

export default Login; 