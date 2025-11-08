
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-2 bg-gray-100">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow rounded-full py-2 px-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="ml-2 bg-green-500 text-white rounded-full p-2 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
