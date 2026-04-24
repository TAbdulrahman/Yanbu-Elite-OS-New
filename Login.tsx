import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, Globe, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setError("Reset link sent to your email.");
    }
    setLoading(false);
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen bg-matte-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-ruby/5 rounded-full blur-[120px]" />
      </div>

      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-8 right-8 flex items-center gap-2 text-gold/60 hover:text-gold transition-colors text-[10px] uppercase font-bold tracking-[0.2em] border border-gold/20 px-3 py-1 rounded-sm glass"
      >
        <Globe className="w-3 h-3" />
        {i18n.language.toUpperCase()}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 border-2 border-gold rounded-sm mb-6 relative"
          >
            <Shield className="w-8 h-8 text-gold" />
            <div className="absolute inset-0 bg-gold/20 animate-pulse" />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-2 uppercase">Yanbu Elite</h1>
          <p className="text-gold/40 text-[10px] uppercase tracking-[0.4em] font-bold">Governance Intelligence OS</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-sm glass backdrop-blur-xl shadow-2xl">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">
            {isForgotMode ? 'Authentication Reset' : 'Authorized Personnel Only'}
          </h2>

          <form onSubmit={isForgotMode ? handleReset : handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Secure Identity (Email)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-matte-black/50 border border-white/10 text-white px-12 py-4 rounded-sm outline-none focus:border-gold/50 transition-all text-sm font-mono"
                  placeholder="name@yanbu-elite.gov"
                  required
                />
              </div>
            </div>

            {!isForgotMode && (
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold ml-1">Access Cipher (Password)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30 group-focus-within:text-gold transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-matte-black/50 border border-white/10 text-white px-12 py-4 rounded-sm outline-none focus:border-gold/50 transition-all text-sm font-mono"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-ruby font-bold uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              disabled={loading}
              className="w-full bg-gold text-black py-4 rounded-sm font-extrabold uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isForgotMode ? 'Initiate Recovery' : 'Acquire Access'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-between items-center">
            <button 
              onClick={() => setIsForgotMode(!isForgotMode)}
              className="text-[9px] text-gray-600 hover:text-gold uppercase tracking-widest font-bold transition-colors"
            >
              {isForgotMode ? 'Back to Portal' : 'Recovery Cipher?'}
            </button>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[9px] text-gray-700 uppercase tracking-widest font-mono">v4.2.0-ELITE</span>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-700 text-[8px] uppercase tracking-[0.3em] font-bold leading-relaxed px-12">
          Strict confidentiality notice: monitored session. unauthorized intrusion is subject to jurisdictional governance protocols.
        </p>
      </motion.div>
    </div>
  );
}
