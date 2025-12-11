import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ChefHat } from 'lucide-react';
import { CartItem } from '../types';
import { getRecipeSuggestion } from '../services/geminiService';

interface AIChefProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const AIChef: React.FC<AIChefProps> = ({ cartItems, isOpen, onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Olá! Sou o Chef Formento. Posso sugerir uma receita com os itens do seu carrinho ou tirar dúvidas. O que deseja?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() && cartItems.length === 0) return;
    
    const userMsg = inputText.trim() || "Sugira algo com meu carrinho";
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);

    const response = await getRecipeSuggestion(cartItems, userMsg);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-full max-w-sm md:bottom-24 md:right-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[500px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <ChefHat size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Chef Formento</h3>
              <p className="text-xs text-red-100">Inteligência Artificial</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-80">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte algo ou peça uma receita..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};