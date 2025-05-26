import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to sign up with Google:', error);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold mb-8">Join Health Coach</div>
        <button
          onClick={handleGoogleSignup}
          className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <img
            src="/google-icon.png"
            alt="Google"
            className="w-6 h-6 mr-3"
          />
          <span className="text-gray-700 font-medium">Sign up with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Signup; 