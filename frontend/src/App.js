import React, { useState } from 'react';
import { Sidebar } from 'components/Sidebar';
import { Header } from 'components/Header';
import { ChatArea } from 'components/ChatArea';
import { AuthProvider, AuthContext } from 'context/AuthContext';
import { AuthModal } from 'components/auth/AuthModal';
import { Toaster } from 'components/ui/toaster';
import { useContext } from 'react';

function MainApp() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [refreshSidebarTrigger, setRefreshSidebarTrigger] = useState(0);
  const { user } = useContext(AuthContext);

  const handleConversationCreated = (id) => {
    setCurrentConversationId(id);
    setRefreshSidebarTrigger(prev => prev + 1);
  };

  return (
    <>
      <AuthModal />
      <Toaster />
      <div className={`flex h-screen w-full bg-zinc-950 text-white overflow-hidden selection:bg-purple-500/30 font-sans transition-all duration-500 ${!user ? 'blur-md pointer-events-none' : ''}`}>
      <Sidebar 
        currentConversationId={currentConversationId} 
        onSelectConversation={setCurrentConversationId} 
        onNewChat={() => setCurrentConversationId(null)}
        refreshTrigger={refreshSidebarTrigger}
      />
      <div className="flex-1 flex flex-col relative">
        <Header />
        <ChatArea 
          conversationId={currentConversationId}
          setConversationId={setCurrentConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
