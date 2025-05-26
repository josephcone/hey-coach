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
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold mb-8">Login</div>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login with Test Account
        </button>
      </div>
    </div>
  );
};

export default Login; 