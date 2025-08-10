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
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize voice recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleVoiceInput(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

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
        suggestion: data.suggestions?.[0],
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      
      // Speak the response
      speakText(data.content);
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

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim() || !socket || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setIsExpanded(true);

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

  const speakText = (text: string) => {
    if (synthRef.current && 'speechSynthesis' in window) {
      // Stop any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 font-sans">
      <div className={`
        bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 
        transition-all duration-300 ease-out
        ${isExpanded 
          ? 'w-[600px] max-w-[90vw] max-h-[70vh] p-6' 
          : 'p-4 cursor-pointer hover:shadow-xl'
        }
        animate-in slide-in-from-bottom-5 duration-500
      `}>
        
        {!isExpanded ? (
          // Collapsed state - voice button
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <button
              onClick={startListening}
              disabled={isListening || !isConnected}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all duration-200
                ${isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isListening ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  Listening...
                </>
              ) : (
                <>
                  🎤 Hold to speak
                </>
              )}
            </button>
          </div>
        ) : (
          // Expanded state - conversation with voice controls
          <div className="space-y-4">
            {/* Voice Controls */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">✨</span>
                <span className="text-sm text-gray-600">Voice Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!isConnected}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  🎤
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>

            {/* Conversation */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' && (
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🎤
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-2xl p-3">
                        <p className="text-blue-900 font-medium">{message.content}</p>
                        <span className="text-xs text-blue-600">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'assistant' && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          🤖
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                          <p className="text-gray-700 leading-relaxed">{message.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {isSpeaking && (
                              <span className="text-xs text-green-600 animate-pulse">
                                🔊 Speaking...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {message.suggestion && (
                        <div className="ml-11 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-3">
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
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    🤖
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>
                {isListening ? '🎤 Listening...' : 
                 isSpeaking ? '🔊 Speaking...' : 
                 isConnected ? '✅ Ready' : '❌ Disconnected'}
              </span>
              <span>Voice Assistant Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}