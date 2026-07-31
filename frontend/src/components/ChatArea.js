import React, { useState, useRef, useEffect } from 'react';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { ScrollArea } from 'components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import api, { streamChat } from 'lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from 'context/AuthContext';
import { useContext } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function ChatArea({ conversationId, setConversationId, onConversationCreated }) {
  const { user } = useContext(AuthContext);
  const defaultMessages = [];
  const [messages, setMessages] = useState(defaultMessages);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const ignoreNextFetchRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId && user) {
      if (ignoreNextFetchRef.current) {
        ignoreNextFetchRef.current = false;
        return;
      }
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/conversations/${conversationId}/messages`);
          const history = res.data.map(msg => ({
            id: msg.id,
            role: msg.role === 'model' ? 'bot' : 'user',
            content: msg.content
          }));
          setMessages(history.length ? history : defaultMessages);
        } catch (err) {
          console.error("Failed to load messages", err);
        }
      };
      fetchMessages();
    } else {
      setMessages(defaultMessages);
    }
  }, [conversationId, user]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await streamChat('/chat/stream', {
        conversation_id: conversationId,
        message: userMessage.content
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let aiMessageId = Date.now() + 1;
      let accumulatedContent = '';
      let isFirstChunk = true;

      setMessages(prev => [...prev, { id: aiMessageId, role: 'bot', content: '' }]);
      setIsLoading(false);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.content) {
                accumulatedContent += data.content;
              }

              if (isFirstChunk) {
                isFirstChunk = false;
                ignoreNextFetchRef.current = true;
                if (!conversationId) {
                  onConversationCreated(data.conversation_id);
                } else {
                  setConversationId(data.conversation_id);
                }
              }

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
                )
              );
            } catch (err) {
              console.error("Error parsing stream chunk:", err, line);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      const errorMessage = { id: Date.now() + 1, role: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-zinc-950">
      {/* Abstract Glowing Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <ScrollArea className="flex-1 pt-24 pb-4 px-4 sm:px-12 z-0">
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col pb-32">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl backdrop-blur-md shadow-xl text-[15px] leading-relaxed ${msg.role === 'user'
                      ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50'
                      : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/10'
                    }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-2 rounded-tl-sm shadow-xl backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSend} className="relative flex items-center group">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything..."
              className="w-full h-14 pl-6 pr-14 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-purple-500/50 backdrop-blur-2xl shadow-2xl transition-all group-hover:bg-white/20"
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              size="icon"
              className="absolute right-2 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 disabled:bg-purple-600/50"
            >
              <Send size={18} />
            </Button>
          </form>
          <div className="text-center mt-3 text-xs text-gray-500">
            WorkSphere AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
