import React, { useState } from 'react';
import { X, PaperPlaneRight, Robot } from '@phosphor-icons/react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

export const ChatBot = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/chat', { message });
      const botMessage = { role: 'bot', content: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-4 right-4 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-sm shadow-2xl flex flex-col z-50"
      data-testid="chatbot-window"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Robot size={24} weight="duotone" className="text-blue-400" />
          <span className="font-chivo font-bold uppercase tracking-wider text-sm">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200"
          data-testid="close-chatbot-btn"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-8">
            Ask me anything about your role and operations.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-sm ${msg.role === 'user' ? 'bg-blue-950/50 border border-blue-900 ml-8' : 'bg-slate-800/50 border border-slate-700 mr-8'}`}
            data-testid={`message-${msg.role}`}
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-sm bg-slate-800/50 border border-slate-700 mr-8">
            <p className="text-sm text-slate-400">Thinking...</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-950 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm placeholder:text-slate-600 font-mono text-sm px-3 py-2 border outline-none"
            data-testid="chatbot-input"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-medium tracking-wide uppercase text-xs px-4 py-2 shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
            data-testid="send-message-btn"
          >
            <PaperPlaneRight size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
};