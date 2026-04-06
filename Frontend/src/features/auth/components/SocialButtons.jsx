import React from 'react';

const SocialButtons = ({ isSignUp = false }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button 
        id={isSignUp ? "social-google-signup" : "social-google-login"} 
        className="social-btn flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
      >
        <iconify-icon icon="logos:google-icon" className="text-lg"></iconify-icon>
        Google
      </button>
      <button 
        id={isSignUp ? "social-github-signup" : "social-github-login"} 
        className="social-btn flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
      >
        <iconify-icon icon="mdi:github" className="text-xl"></iconify-icon>
        GitHub
      </button>
    </div>
  );
};

export default SocialButtons;
