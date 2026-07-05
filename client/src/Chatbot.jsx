import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Mic, MicOff, 
  Volume2, VolumeX, Loader2, Sparkles, Languages,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: t("chatbot_welcome", { defaultValue: 'Namaste! I am your U-FIN Assistant. How can I help you today?' }), timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Map internal language codes to i18n codes
  const getLanguageCode = (lng) => {
    if (lng === 'en') return 'en-IN';
    if (lng === 'hi') return 'hi-IN';
    if (lng === 'te') return 'te-IN';
    return 'en-IN';
  };

  const [language, setLanguage] = useState(getLanguageCode(i18n.language));
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Sync language when i18n.language changes
  useEffect(() => {
    setLanguage(getLanguageCode(i18n.language));
  }, [i18n.language]);

  const quickQuestions = [
    t("q_best_tomato", { defaultValue: "Which tomato is best?" }),
    t("q_cheapest", { defaultValue: "Cheapest product today?" }),
    t("q_trusted_farmer", { defaultValue: "Top trusted farmer?" }),
    t("q_complaint", { defaultValue: "How to file complaint?" })
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.lang = language;
      recognition.start();
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    await sendMessage(input);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        language: language
      });

      const botReply = res.data.reply;
      setMessages(prev => [...prev, { role: 'bot', text: botReply, timestamp: new Date() }]);
      
      if (voiceEnabled) {
        speak(botReply);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Server issue. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[550px] glass-card flex flex-col shadow-2xl border-primary/20 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{t("chatbot_name", { defaultValue: "U-FIN Assistant" })}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/80">{t("online_active", { defaultValue: "Online & Active" })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="px-4 py-2 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                <Languages className="w-3 h-3" /> {t("language")}
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-[10px] bg-transparent border-none focus:ring-0 font-bold text-primary cursor-pointer"
              >
                <option value="en-IN">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="te-IN">Telugu</option>
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-surface border border-border text-text-primary rounded-tl-none'
                  }`}>
                    {msg.text}
                    <div className={`text-[8px] mt-1 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-text-secondary'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-text-secondary">🤖 {t("thinking", { defaultValue: "Thinking..." })}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-surface-hover hover:bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-surface">
              <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-primary transition-all">
                <input 
                  type="text"
                  placeholder={isListening ? t("listening", { defaultValue: 'Listening...' }) : t("ask_anything", { defaultValue: 'Ask me anything...' })}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                />
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-surface text-text-secondary'}`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary-hover transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
