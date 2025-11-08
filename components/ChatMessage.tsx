
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-sm md:max-w-md shadow-md ${
          isUser
            ? 'bg-green-100 text-gray-800'
            : 'bg-white text-gray-800'
        }`}
      >
        {message.image && (
          <img src={message.image} alt="Recipe" className="rounded-md mb-2 max-h-60 w-full object-cover" />
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
