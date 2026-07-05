import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingCart, TrendingUp, TrendingDown, BrainCircuit,
  AlertTriangle, CheckCircle2, Clock, MapPin, User, Phone,
  Mail, Star, Sparkles, Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PriceGraph from './PriceGraph';
import { aiApi } from './api';

const ProductModal = ({ product, isOpen, onClose, onBuyNow }) => {
  const { t } = useTranslation();
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchAiPrediction();
    }
  }, [isOpen, product]);

  const fetchAiPrediction = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const response = await aiApi.predictPrice({
        productId: product._id,
        pricePerKg: product.basePrice,
        location: product.location?.coordinates || null
      });

      if (response.data.success) {
        setAiPrediction(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionBadge = (suggestion) => {
    switch (suggestion) {
      case 'BUY_NOW':
        return {
          text: t('buy_now'),
          color: 'bg-green-500',
          icon: <Zap className="w-4 h-4" />
        };
      case 'WAIT':
        return {
          text: t('wait'),
          color: 'bg-yellow-500',
          icon: <Clock className="w-4 h-4" />
        };
      case 'HOLD':
        return {
          text: t('hold'),
          color: 'bg-blue-500',
          icon: <CheckCircle2 className="w-4 h-4" />
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-500',
          icon: <AlertTriangle className="w-4 h-4" />
        };
    }
  };

  if (!isOpen || !product) return null;

  const suggestion = aiPrediction ? getSuggestionBadge(aiPrediction.suggestion) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={product?.imageUrl || 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop'}
              alt={product?.name || 'Product'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* AI Score Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <span className="text-white font-bold text-sm">{(product?.aiScore || 85)}% {t("ai_score", { defaultValue: "AI Score" })}</span>
            </div>

            {/* Price Display */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                <p className="text-white text-2xl font-bold">₹{product.basePrice}/{t("kg", { defaultValue: "kg" })}</p>
                <p className="text-white/70 text-sm">{product.quantity}{t("kg", { defaultValue: "kg" })} {t("available", { defaultValue: "available" })}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-256px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Product Info */}
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {t(product.name.toLowerCase().replace(/\s+/g, '_'), { defaultValue: product.name })}
                  </h1>
                  <p className="text-text-secondary capitalize">{product.type}</p>
                </div>

                {/* Seller Info */}
                <div className="bg-surface/50 border border-border rounded-2xl p-4 mb-6">
                  <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> {t("seller_info", { defaultValue: "Seller Information" })}
                  </h3>
                  <div className="space-y-2 text-sm text-text-secondary">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" /> {product.sellerName}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {product.sellerPhone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {product.sellerEmail}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <p className="text-xs text-text-secondary uppercase tracking-wider">{t("freshness")}</p>
                    <p className="text-lg font-bold text-text-primary">{product.freshness}/10</p>
                  </div>
                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <p className="text-xs text-text-secondary uppercase tracking-wider">{t("quality")}</p>
                    <p className="text-lg font-bold text-text-primary">{product.quality}</p>
                  </div>
                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <p className="text-xs text-text-secondary uppercase tracking-wider">{t("expiry")}</p>
                    <p className="text-lg font-bold text-text-primary">{product.expiryHours}h</p>
                  </div>
                  <div className="bg-surface/50 border border-border rounded-xl p-4">
                    <p className="text-xs text-text-secondary uppercase tracking-wider">{t("demand")}</p>
                    <p className="text-lg font-bold text-text-primary">{product.demandLevel}</p>
                  </div>
                </div>

                {/* Alerts */}
                {product.alerts && product.alerts.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
                    <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> {t("smart_alerts", { defaultValue: "Smart Alerts" })}
                    </h3>
                    <ul className="space-y-1">
                      {product.alerts.map((alert, idx) => (
                        <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column - AI Insights */}
              <div>
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    {t("ai_market_intelligence", { defaultValue: "AI Market Intelligence" })}
                  </h2>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3" />
                      <span className="text-text-secondary">{t("analyzing_market")}</span>
                    </div>
                  ) : aiPrediction ? (
                    <>
                      {/* AI Recommendation */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 ${suggestion.color}`}>
                            {suggestion.icon}
                            {suggestion.text}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-text-secondary">{t("confidence", { defaultValue: "Confidence" })}</p>
                            <p className="text-lg font-bold text-text-primary">{aiPrediction.confidenceScore}%</p>
                          </div>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          {aiPrediction.explanation}
                        </p>
                      </div>

                      {/* Price Trend */}
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          {t("price_trend_analysis", { defaultValue: "Price Trend Analysis" })}
                        </h3>
                        <div className="h-32">
                          <PriceGraph
                            history={aiPrediction.historyPrices}
                            predictedPrice={aiPrediction.predictedPrices[0]?.price || aiPrediction.currentPrice}
                          />
                        </div>
                      </div>

                      {/* Market Insights */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-surface/50 border border-border rounded-xl p-3">
                          <p className="text-xs text-text-secondary uppercase tracking-wider">Trend</p>
                          <p className={`text-sm font-bold capitalize ${
                            aiPrediction.trend === 'rising' ? 'text-green-500' :
                            aiPrediction.trend === 'falling' ? 'text-red-500' : 'text-blue-500'
                          }`}>
                            {aiPrediction.trend}
                          </p>
                        </div>
                        <div className="bg-surface/50 border border-border rounded-xl p-3">
                          <p className="text-xs text-text-secondary uppercase tracking-wider">Next Day</p>
                          <p className="text-sm font-bold text-text-primary">
                            ₹{aiPrediction.predictedPrices[0]?.price.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t("ai_unavailable", { defaultValue: "AI analysis unavailable" })}</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onBuyNow(product._id)}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("proceed_checkout")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;