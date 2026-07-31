import React, { useState, useEffect } from 'react';
import { Button } from 'components/ui/button';
import { ScrollArea } from 'components/ui/scroll-area';
import { MessageSquare, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from 'lib/api';
import { AuthContext } from 'context/AuthContext';
import { useContext } from 'react';

export function Sidebar({ currentConversationId, onSelectConversation, onNewChat, refreshTrigger }) {
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      try {
        const res = await api.get('/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    fetchConversations();
  }, [refreshTrigger, user]);

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col"
    >
      <div className="p-4">
        <Button 
          onClick={onNewChat}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all" variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 mt-2">
          {conversations.map((c) => (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={c.id}>
              <Button 
                onClick={() => onSelectConversation(c.id)}
                variant="ghost" 
                className={`w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 font-normal ${c.id === currentConversationId ? 'bg-white/10 text-white' : ''}`}
              >
                <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{c.title || 'New Conversation'}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
