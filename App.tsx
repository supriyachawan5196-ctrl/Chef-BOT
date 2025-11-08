
import React, { useState, useEffect, useRef } from 'react';
import { Message, Language, ChatStep, SUPPORTED_LANGUAGES } from './types';
import { getBotPrompt, generateRecipe, generateRecipeImage } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [language, setLanguage] = useState<Language | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [dish, setDish] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ChatStep>('language');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([{ 
      id: 'initial', 
      sender: 'bot', 
      text: 'Choose language: Marathi / English / Hindi / Telugu / Tamil / Kannada / Malayalam.' 
    }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const addMessage = (sender: 'user' | 'bot', text: string, image?: string | null) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, image }]);
  };

  const processUserInput = async (text: string) => {
    // Check for language change
    const langMatch = SUPPORTED_LANGUAGES.find(l => l.name.toLowerCase() === text.trim().toLowerCase());
    if (langMatch) {
      setLanguage(langMatch.code);
      setCuisine(null);
      setDish(null);
      setCurrentStep('cuisine');
      const prompt = await getBotPrompt('cuisine', langMatch.code);
      addMessage('bot', prompt);
      return;
    }

    // Handle favorites commands
    const lowerText = text.toLowerCase().trim();
    if (lowerText === 'my favorites') {
        if(favorites.length === 0) {
            addMessage('bot', 'You have no favorite recipes saved yet.');
        } else {
            const favList = "Favorites:\n" + favorites.map((fav, i) => `${i + 1}) ${fav}`).join('\n') + "\n\nReply with a number to get the recipe.";
            addMessage('bot', favList);
        }
        return;
    }
    if (lowerText.startsWith('save')) {
        if (dish) {
            if (!favorites.includes(dish)) {
                setFavorites([...favorites, dish]);
            }
            addMessage('bot', `"${dish}" has been saved to your favorites!`);
        } else {
            addMessage('bot', 'There is no recipe in context to save. Please generate a recipe first.');
        }
        return;
    }
     if (lowerText.startsWith('unsave')) {
        if (dish && favorites.includes(dish)) {
            setFavorites(favorites.filter(f => f !== dish));
            addMessage('bot', `"${dish}" has been removed from your favorites.`);
        } else {
            addMessage('bot', `"${dish}" was not in your favorites.`);
        }
        return;
    }


    switch (currentStep) {
      case 'language':
        addMessage('bot', 'Please choose a valid language from the list.');
        break;
        
      case 'cuisine':
        setCuisine(text);
        setCurrentStep('dish');
        if (language) {
          const prompt = await getBotPrompt('dish', language);
          addMessage('bot', prompt);
        }
        break;
        
      case 'dish':
        setDish(text);
        setCurrentStep('recipe_generated');
        if (language && cuisine) {
          const recipeText = await generateRecipe(language, cuisine, text);
          const recipeImage = await generateRecipeImage(text, cuisine);
          if (!recipeImage) {
            addMessage('bot', recipeText + "\n\n(Couldn’t fetch a reliable image. Reply ‘Image’ to try again.)");
          } else {
            addMessage('bot', recipeText, recipeImage);
          }
        }
        break;
        
      case 'recipe_generated':
         setDish(text);
         if(language && cuisine) {
           const recipeText = await generateRecipe(language, cuisine, text);
           const recipeImage = await generateRecipeImage(text, cuisine);
            if (!recipeImage) {
             addMessage('bot', recipeText + "\n\n(Couldn’t fetch a reliable image. Reply ‘Image’ to try again.)");
           } else {
             addMessage('bot', recipeText, recipeImage);
           }
         } else if (language) {
            // If cuisine is missing, reset to ask for cuisine
            setCurrentStep('cuisine');
            const prompt = await getBotPrompt('cuisine', language);
            addMessage('bot', prompt);
         } else {
            // If language is missing, reset to language selection
            setCurrentStep('language');
            const prompt = await getBotPrompt('language', Language.English); // Default to English prompt
            addMessage('bot', prompt);
         }
        break;
    }
  };

  const handleSendMessage = async (text: string) => {
    addMessage('user', text);
    setIsLoading(true);
    await processUserInput(text);
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-200">
        <div className="w-full max-w-md h-[95vh] md:h-[85vh] flex flex-col bg-[#E5DDD5] shadow-2xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#00A884] text-white p-3 flex items-center shadow-md">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M19.38 3.55a1 1 0 00-1.07-.32l-3.23.8L13.1 2.3a1 1 0 00-1.2 0L9.92 4.03l-3.23-.8a1 1 0 00-1.07.32L4.05 5.53a1 1 0 00.32 1.07l2.25 2.25L5.7 10.3l-2.25 2.25a1 1 0 00-.32 1.07l1.57 1.98a1 1 0 001.07.32l3.23-.8 1.98 1.73a1 1 0 001.2 0l1.98-1.73 3.23.8a1 1 0 001.07-.32l1.57-1.98a1 1 0 00-.32-1.07L14.3 12.55l.92-1.45 2.25-2.25a1 1 0 00.32-1.07l-1.57-1.98zM10 12a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </div>
                <div>
                    <h2 className="font-bold text-lg">ChefBot</h2>
                    <p className="text-sm opacity-90">online</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 overflow-y-auto" style={{backgroundImage: 'url(https://i.redd.it/qwd83nc4xxf41.jpg)', backgroundSize: 'contain'}}>
                <div className="flex flex-col">
                    {messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && <TypingIndicator />}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    </div>
  );
};

export default App;

