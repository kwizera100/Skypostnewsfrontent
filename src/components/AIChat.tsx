import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { articlesApi } from '../api/endpoints';
import type { Article } from '../types';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; articles?: Article[] }[]>([
    { role: 'bot', text: 'Hello! I am Iremee AI. I can help you find articles on our website. What are you looking for?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Search for articles matching the query
      const { data } = await articlesApi.getAll({ pageSize: 3 });
      // Filter manually for demo (usually the backend should handle search)
      const found = (data.data || []).filter(a => 
        a.title.toLowerCase().includes(userMsg.toLowerCase()) || 
        a.excerpt.toLowerCase().includes(userMsg.toLowerCase())
      );

      setTimeout(() => {
        if (found.length > 0) {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            text: `I found ${found.length} articles that might interest you:`,
            articles: found 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            text: "I couldn't find any specific articles for that, but here are some of our latest news!",
            articles: (data.data || []).slice(0, 2)
          }]);
        }
        setLoading(false);
      }, 800);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble searching right now.' }]);
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-700 transition-transform hover:scale-110 group"
        >
          <MessageCircle size={28} />
          <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Iremee AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-orange-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Iremee Assistant</h3>
                <p className="text-[10px] opacity-80">Searching articles only</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-gray-200' : 'bg-orange-100 text-orange-600'}`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                      {m.text}
                    </div>
                    {m.articles && (
                      <div className="space-y-2">
                        {m.articles.map(a => (
                          <a key={a.id} href={`/article/${a.slug}`} className="block bg-white p-2 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors shadow-sm group">
                            <p className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600">{a.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase">{a.category.name}</p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button type="submit" disabled={!input.trim() || loading} className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 disabled:opacity-50 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
