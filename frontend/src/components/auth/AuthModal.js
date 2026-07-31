import React, { useState, useContext } from 'react';
import { AuthContext } from 'context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export function AuthModal() {
  const { login, signup, user, loading } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If user is logged in or we are still checking local storage, don't show the modal
  if (user || loading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="relative w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl overflow-hidden"
        >
          {/* Glowing Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-purple-500 rounded-b-full shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-center mb-8">
              {isLogin ? 'Enter your details to access your chats.' : 'Join to start conversing with AI.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Full Name" 
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Email Address" 
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Password" 
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded border border-red-400/20">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
              >
                {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
