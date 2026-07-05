import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, CheckCircle2, Star, ShieldCheck, Info } from 'lucide-react';
import axios from 'axios';

const Report = () => {
  const [farmerId, setFarmerId] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('farmerId') || localStorage.getItem('farmerId') || '';
    setFarmerId(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) {
      setError('Please describe the issue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/complaint', {
        farmerId,
        message,
        rating
      });

      if (response.data.success) {
        setSuccess(true);
        setMessage('');
        setRating(0);
      }
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
              
              <div className="mb-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-4 mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-center font-display mb-2 text-text-primary">Report Issue</h1>
                <p className="text-text-secondary text-center text-sm">Help us maintain high quality standards by reporting your concerns.</p>
              </div>

              {/* Farmer Info Context */}
              <div className="bg-surface/50 rounded-2xl p-4 border border-border/50 mb-8 flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                    {farmerId.slice(-2).toUpperCase() || 'F'}
                 </div>
                 <div className="flex-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Farmer ID: {farmerId}</p>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-xs font-bold text-text-primary flex items-center gap-1">⭐ 4.2</span>
                       <span className="text-[10px] text-text-secondary">|</span>
                       <span className="text-xs font-bold text-green-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Trust System Active</span>
                    </div>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Rate your experience</label>
                  <div className="flex justify-center gap-3 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating) 
                              ? 'fill-accent text-accent' 
                              : 'text-gray-600'
                          } transition-colors duration-200`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Issue Details</label>
                  <textarea
                    className="w-full bg-surface border border-border rounded-2xl p-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] transition-all resize-none"
                    placeholder="Describe the quality, delivery, or pricing issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm flex items-center gap-2 bg-red-500/10 p-3 rounded-xl">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/40'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Submit Complaint
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 mx-auto">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-4">Report Submitted</h2>
              <p className="text-text-secondary mb-8">Our AI engine is currently analyzing your feedback. Your contribution directly helps improve farmer reliability.</p>
              <button
                onClick={() => { setSuccess(false); window.location.href = '/'; }}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Back to Marketplace
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
           <Info className="w-5 h-5 text-primary mt-0.5" />
           <p className="text-xs text-text-secondary leading-relaxed">
             Your feedback directly affects the farmer's <strong>Trust Score</strong>. High scores unlock premium benefits, while low scores lead to platform warnings.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
