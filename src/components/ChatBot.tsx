import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { academicCalendar } from '../data/academicCalendar';
import { restaurants } from '../data/restaurants';
import { generateGeminiResponse } from '../lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const suggestedQueries = [
  {
    text: "What's on the menu of Chatkara?",
    icon: '🍽️',
    description: "Check today's food options",
  },
  {
    text: 'When are the mid-semester exams?',
    icon: '📚',
    description: 'View academic calendar',
  },
  {
    text: 'What restaurants are in MUJ?',
    icon: '🏪',
    description: 'Explore nearby eateries',
  },
  {
    text: 'Tell me about MUJ Connect',
    icon: 'ℹ️',
    description: 'Learn about our platform',
  },
];

export default function ChatBot({ isOpen, setIsOpen }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(messages));
    scrollToBottom();
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
    handleSubmit(new Event('submit') as any);
  };

  const handleGenerateResponse = async (
    userMessage: string
  ): Promise<string> => {
    try {
      console.log('Attempting to call Gemini API...');
      const response = await generateGeminiResponse(
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        userMessage
      );
      return response;
    } catch (error) {
      console.error('Detailed error in generateResponse:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await generateGeminiResponse(
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        userMessage
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || 'Failed to generate response');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    sessionStorage.removeItem('chatHistory');
    toast.success('Chat history cleared');
  };

  return (
    <>
      {/* Chat Toggle Button - Hidden on Mobile */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors z-50 ${
          isOpen ? 'hidden' : ''
        } hidden md:flex`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${
              isMobile ? 'inset-0' : 'bottom-6 right-6 w-96'
            } bg-white dark:bg-amoled rounded-lg shadow-xl z-50 flex flex-col max-h-[calc(100vh-5rem)]`}
          >
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  MUJ Connect Assistant
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-amoled-light">
              {showSuggestions && messages.length === 0 && (
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    How can I help you today?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQueries.map((query, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSuggestedQuery(query.text)}
                        className="flex items-center space-x-3 p-3 text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-900 dark:text-white"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-xl">{query.icon}</span>
                        <div>
                          <p className="font-medium">{query.text}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {query.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <ReactMarkdown className="prose dark:prose-invert max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t dark:border-gray-800">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
