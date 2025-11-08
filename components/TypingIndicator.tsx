
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="rounded-lg px-4 py-2 max-w-sm bg-white shadow-md">
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
