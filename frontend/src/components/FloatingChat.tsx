'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestion?: string;
}

export default function FloatingChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('message', (data: { content: string; timestamp: string; suggestions?: string[] }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(data.timestamp),
        suggestion: data.suggestions?.[0], // Use first suggestion
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    });

    newSocket.on('typing', (isTyping: boolean) => {
      setIsTyping(isTyping);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const sendMessage = async () => {
    if (!inputText.trim() || !socket || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsExpanded(true); // Expand when user sends message

    // Send to WebSocket
    socket.emit('message', {
      content: userMessage.content,
      context: {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 font-sans">
      <div className={`
        bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 
        transition-all duration-300 ease-out
        ${isExpanded 
          ? 'w-[600px] max-w-[90vw] max-h-[70vh] p-6' 
          : 'w-[400px] max-w-[90vw] p-4 cursor-pointer hover:shadow-xl'
        }
        animate-in slide-in-from-bottom-5 duration-500
      `} onClick={!isExpanded ? handleInputFocus : undefined}>
        
        {!isExpanded ? (
          // Collapsed state - simple input
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              placeholder="Ask me anything about this page..."
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-base"
            />
            {inputText.trim() && (
              <button
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
              >
                Send
              </button>
            )}
          </div>
        ) : (
          // Expanded state - full conversation
          <div className="space-y-4">
            {/* Conversation */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' && (
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-lg">✨</span>
                      <div className="text-gray-700 font-medium">
                        Question: "{message.content}"
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'assistant' && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <p className="text-gray-700 leading-relaxed">{message.content}</p>
                      </div>
                      
                      {message.suggestion && (
                        <div className="bg-blue-50 border-l-3 border-blue-400 rounded-xl p-3">
                          <div className="text-blue-800 font-semibold text-xs mb-1">Suggestion:</div>
                          <p className="text-blue-700 text-sm">{message.suggestion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">✨</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <span className="text-lg">✨</span>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything else..."
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-base"
              />
              {inputText.trim() && (
                <button
                  onClick={sendMessage}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}