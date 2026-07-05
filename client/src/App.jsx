import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Zap, Plus, Filter, Sun, Moon, X, ShoppingCart, 
  Search, AlertTriangle, TrendingUp, TrendingDown,
  Navigation, CheckCircle2, Info, Mic, Languages, Sparkles, BrainCircuit,
  BarChart3, Star, ShieldCheck, Package
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './i18n';

// New Components
import Checkout from './Checkout';
import Stats from './Stats';
import AddFood from './AddFood';
import FAQ from './FAQ';
import PriceGraph from './PriceGraph';
import ProductModal from './ProductModal';
import Login from './Login';
import Register from './Register';
import FarmerDashboard from './FarmerDashboard';
import Report from './Report';
import Dashboard from './Dashboard';
import { produceApi } from './api';
import { useVoiceRecognition } from './useVoice';
import ScanPage from './ScanPage';
import BatchCreation from './BatchCreation';
import BatchDetails from './BatchDetails';
import Chatbot from './Chatbot';

// Fix for Leaflet markers
import L from 'leaflet';
try {
  if (L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
} catch (e) {
  console.error('Leaflet marker fix error:', e);
}

// Default Local Hubs Data
const DEFAULT_HUBS = [
  { id: 'hub-hyd', name: 'Hyderabad Central Hub', location: [17.3850, 78.4867], capacity: '5000kg', status: 'Active' },
  { id: 'hub-blr', name: 'Bangalore Distribution Hub', location: [12.9716, 77.5946], capacity: '8000kg', status: 'Active' },
  { id: 'hub-chn', name: 'Chennai Port Hub', location: [13.0827, 80.2707], capacity: '6000kg', status: 'Full' },
  { id: 'hub-vjw', name: 'Vijayawada Logistics Node', location: [16.5062, 80.6480], capacity: '3000kg', status: 'Active' },
  { id: 'hub-vskp', name: 'Vizag Coastal Hub', location: [17.6868, 83.2185], capacity: '4500kg', status: 'Active' },
];

// Custom Hub Icon
const hubIcon = L.divIcon({
  className: 'custom-hub-icon',
  html: `<div class="w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function App() {
  const { t, i18n } = useTranslation();
  const [produceList, setProduceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path === '/report') return 'report';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/scan') return 'scan';
    return 'home';
  };
  
  const [currentPage, setCurrentPage] = useState(getInitialPage()); 
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [checkoutProduceId, setCheckoutProduceId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFarmerDashboard, setShowFarmerDashboard] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'login' or 'register'

  // Voice Recognition for Search
  const { isListening, startListening } = useVoiceRecognition((transcript) => {
    setSearchQuery(transcript);
    setAiAnalyzing(true);
    setTimeout(() => setAiAnalyzing(false), 1500);
  });

  // Language Switch
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  // Fetch Produce
  const fetchProduce = async () => {
    setLoading(true);
    try {
      const res = await produceApi.getAll();
      if (res.data.success) {
        setProduceList(res.data.produce);
      }
    } catch (error) {
      console.error('Fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduce();
  }, []);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Filter and Search logic
  const filteredProduce = useMemo(() => {
    return (produceList || []).filter(item => {
      if (!item) return false;
      const type = item.type || '';
      const name = item.name || '';
      const matchesFilter = filterType === 'all' || type.toLowerCase() === filterType.toLowerCase();
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [produceList, filterType, searchQuery]);

  const handleBuyNow = (id) => {
    setCheckoutProduceId(id);
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleModalBuyNow = (productId) => {
    setShowProductModal(false);
    setCheckoutProduceId(productId);
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  // Authentication handlers
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('home');
    localStorage.removeItem('user');
  };

  // Check for existing login on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // AI Recommendation Logic
  const getAiRecommendation = (item) => {
    const trend = item.predictedPrice - item.basePrice;
    if (trend > 1) return { text: t("wait"), reason: `Because price is expected to rise by ₹${trend.toFixed(2)}`, icon: <TrendingUp className="w-4 h-4 text-green-500" /> };
    if (trend < -1) return { text: t("buy_now"), reason: `Because price is expected to drop by ₹${Math.abs(trend).toFixed(2)}`, icon: <TrendingDown className="w-4 h-4 text-red-500" /> };
    return { text: "Neutral", reason: "Market is stable", icon: <CheckCircle2 className="w-4 h-4 text-primary" /> };
  };

  if (currentPage === 'checkout') {
    return <Checkout produceId={checkoutProduceId} onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'report') {
    return (
      <div className="min-h-screen transition-colors duration-500">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { window.location.href = '/'; }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"><ShoppingCart className="w-6 h-6" /></div>
              <span className="text-2xl font-bold font-display tracking-tight text-text-primary">U-FIN</span>
            </motion.div>
          </div>
        </nav>
        <Report />
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen transition-colors duration-500">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { window.location.href = '/'; }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"><ShoppingCart className="w-6 h-6" /></div>
              <span className="text-2xl font-bold font-display tracking-tight text-text-primary">U-FIN</span>
            </motion.div>
          </div>
        </nav>
        <Dashboard />
      </div>
    );
  }
  
  if (currentPage === 'scan') {
    return (
      <div className="min-h-screen transition-colors duration-500">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { window.location.href = '/'; }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"><ShoppingCart className="w-6 h-6" /></div>
              <span className="text-2xl font-bold font-display tracking-tight text-text-primary">U-FIN</span>
            </motion.div>
          </div>
        </nav>
        <ScanPage />
      </div>
    );
  }

  if (currentPage === 'batch-create') {
    return (
      <div className="min-h-screen transition-colors duration-500">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrentPage('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"><ShoppingCart className="w-6 h-6" /></div>
              <span className="text-2xl font-bold font-display tracking-tight text-text-primary">U-FIN</span>
            </motion.div>
          </div>
        </nav>
        <BatchCreation onBatchCreated={(id) => { setSelectedBatchId(id); setCurrentPage('batch-details'); }} />
      </div>
    );
  }

  if (currentPage === 'batch-details') {
    return (
      <div className="min-h-screen transition-colors duration-500">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrentPage('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"><ShoppingCart className="w-6 h-6" /></div>
              <span className="text-2xl font-bold font-display tracking-tight text-text-primary">U-FIN</span>
            </motion.div>
          </div>
        </nav>
        <BatchDetails batchId={selectedBatchId} onBack={() => setCurrentPage('batch-create')} />
      </div>
    );
  }

  if (currentPage === 'checkout') {
    return <Checkout produceId={checkoutProduceId} onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"><ShoppingCart className="w-6 h-6" /></div>
            <span className="text-2xl font-bold font-display tracking-tight text-text-primary">U-FIN</span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#marketplace" className="hover:text-primary transition-colors">{t("marketplace")}</a>
            <a href="#impact" className="hover:text-primary transition-colors">{t("impact")}</a>
            <a href="#map" className="hover:text-primary transition-colors">{t("map")}</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center p-1 bg-surface border border-border rounded-xl">
              <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs rounded-lg transition-all ${i18n.language === 'en' ? 'bg-primary text-white' : 'text-text-secondary'}`}>EN</button>
              <button onClick={() => changeLanguage('hi')} className={`px-2 py-1 text-xs rounded-lg transition-all ${i18n.language === 'hi' ? 'bg-primary text-white' : 'text-text-secondary'}`}>HI</button>
              <button onClick={() => changeLanguage('te')} className={`px-2 py-1 text-xs rounded-lg transition-all ${i18n.language === 'te' ? 'bg-primary text-white' : 'text-text-secondary'}`}>TE</button>
            </div>
            
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-surface transition-colors border border-border">
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>

            {/* Dashboard, Logistics & List Produce - Restricted Access */}
            {isAuthenticated && (user?.role === 'farmer' || user?.role === 'hub' || user?.role === 'admin') && (
              <div className="flex items-center gap-2 border-r border-border pr-4 mr-2">
                <button 
                  onClick={() => setCurrentPage('batch-create')}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary border border-border rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
                >
                  <Package className="w-4 h-4 text-orange-500" /> Logistics
                </button>

                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowFarmerDashboard(true);
                    } else {
                      setCurrentPage('auth');
                    }
                  }}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary border border-border rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
                >
                  <BarChart3 className="w-4 h-4 text-purple-500" /> Dashboard
                </button>
                
                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowAddForm(true);
                    } else {
                      setCurrentPage('auth');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all active:scale-95 text-sm"
                >
                  <Plus className="w-4 h-4" /> {t("list_produce")}
                </button>
              </div>
            )}
            
            {/* Auth Section - Right Corner */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-xs font-bold text-text-primary">{user?.name}</span>
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest">{user?.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                  title="Logout"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setAuthMode('login'); setCurrentPage('auth'); }}
                  className="px-5 py-2 text-text-primary hover:text-primary font-bold transition-colors text-sm"
                >
                  {t("login")}
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setCurrentPage('auth'); }}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 text-sm"
                >
                  {t("register")}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Authentication Page */}
      {currentPage === 'auth' && (
        <div className="pt-20 min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            {authMode === 'login' ? (
              <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <Register onRegister={handleLogin} onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
      <header className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4 fill-primary" /> {t("ai_powered_waste_reduction", { defaultValue: "AI-Powered Market Intelligence" })}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold font-display text-text-primary mb-6 tracking-tight"
          >
            {t("hero_title", { defaultValue: "Smarter Decisions." })} <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-x">{t("hero_title_accent", { defaultValue: "Bigger Impact." })}</span>
          </motion.h1>
          
          <motion.div id="impact" className="w-full mt-12">
            <Stats />
          </motion.div>
        </div>

        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px] -z-10 animate-pulse delay-700"></div>
      </header>

      {/* Marketplace Section */}
      <main id="marketplace" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1">
            <h2 className="text-4xl font-bold font-display text-text-primary mb-2">{t("marketplace")}</h2>
            <p className="text-text-secondary">{t("ai_driven_insights", { defaultValue: "AI-driven insights for optimal food redistribution." })}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t("categories", { defaultValue: "Categories" })}</option>
              <option value="vegetable">{t("vegetables", { defaultValue: "Vegetables" })}</option>
              <option value="fruit">{t("fruits", { defaultValue: "Fruits" })}</option>
              <option value="grain">{t("grains", { defaultValue: "Grains" })}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary font-medium animate-pulse">{t("predicting_trends", { defaultValue: "Predicting market trends..." })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProduce.map((item, idx) => {
                const rec = getAiRecommendation(item);
                const trust = item.farmerTrust || { rating: 4.0, trustScore: 80, badge: 'Trusted Farmer' };
                
                return (
                  <motion.div
                    key={item._id || idx}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-card overflow-hidden group border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-2xl cursor-pointer relative"
                    onClick={() => handleProductClick(item)}
                  >
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center pointer-events-none">
                      <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Sparkles className="w-5 h-5 text-accent" /> {t("view_ai_insights", { defaultValue: "View AI Insights" })}
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <BrainCircuit className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      
                      {/* Trust Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-md ${trust.badge === 'Star Seller' ? 'badge-star-seller' : 'badge-trusted'}`}>
                          {trust.badge === 'Star Seller' ? <Sparkles className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {trust.badge}
                        </div>
                      </div>

                      {/* AI Trend Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white flex items-center gap-1.5">
                          {rec.icon}
                          {rec.text === 'Buy Now' ? t("price_dropping", { defaultValue: '📉 Price Dropping' }) : rec.text === 'Wait' ? t("price_rising", { defaultValue: '📈 Price Rising' }) : t("stable", { defaultValue: '→ Stable' })}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-text-primary font-display group-hover:text-primary transition-colors">
                            {t(item.name.toLowerCase().replace(/\s+/g, '_'), { defaultValue: item.name })}
                          </h3>
                          <p className="text-text-secondary text-sm">{item.sellerName || t("direct_farm", { defaultValue: "Direct from Farm" })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary font-display">₹{(item.basePrice || 0).toFixed(2)}</p>
                          <p className="text-[10px] text-text-secondary uppercase tracking-wider">{t("per")} {item.pricingType?.replace('per_', '') || t("kg", { defaultValue: "kg" })}</p>
                        </div>
                      </div>

                      {/* Trust & Rating Section */}
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-6">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < Math.floor(trust.rating) ? 'text-accent' : 'text-gray-600'}`}>⭐</span>
                            ))}
                            <span className="text-xs font-bold text-text-primary ml-1">{trust.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-[10px] text-text-secondary uppercase">{t("farmer_rating")}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-20 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${trust.trustScore > 80 ? 'bg-green-500' : trust.trustScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${trust.trustScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-text-primary">{trust.trustScore}%</span>
                            </div>
                            <p className="text-[10px] text-text-secondary uppercase">{t("trust_score")}</p>
                          </div>
                        </div>
                      </div>

                      {/* QR Section */}
                      <div className="flex items-center gap-4 p-3 bg-surface/50 rounded-2xl border border-border/50 mb-6 group/qr" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-white p-1 rounded-lg">
                           <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:5173/report?farmerId=${item.farmer}`} 
                              alt="QR" 
                              className="w-full h-full object-contain"
                           />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-text-primary leading-tight">{t("scan_report_issue", { defaultValue: "Scan to Report Issue" })}</p>
                          <p className="text-[9px] text-text-secondary">{t("ai_assisted_resolution", { defaultValue: "AI-assisted complaint resolution" })}</p>
                        </div>
                        <Navigation className="w-4 h-4 text-text-secondary group-hover/qr:text-primary transition-colors cursor-pointer" />
                      </div>

                      <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleBuyNow(item._id)}
                          className="py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20"
                        >
                          <ShoppingCart className="w-4 h-4" /> {t("buy_now")}
                        </button>
                        <button 
                          onClick={() => {
                            localStorage.setItem('farmerId', item.farmer);
                            setCurrentPage('report');
                          }}
                          className="py-3 bg-surface hover:bg-surface-hover text-text-primary border border-border rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <AlertTriangle className="w-4 h-4" /> {t("report")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Network Map */}
      <section id="map" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-4xl font-bold font-display text-text-primary mb-2">{t("map")}</h2>
          <p className="text-text-secondary">{t("ai_logistic_redistribution", { defaultValue: "AI Optimization for logistic redistribution." })}</p>
        </div>
        <div className="h-[600px] rounded-3xl overflow-hidden border border-border shadow-2xl relative bg-surface">
          <MapContainer
            center={[15.9129, 79.7400]} // Center of South India
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            className="rounded-3xl"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Render Produce Markers */}
            {filteredProduce.map((product, index) => {
              if (!product.location || !product.location.coordinates) return null;

              const [lng, lat] = product.location.coordinates;
              return (
                <Marker key={product._id || index} position={[lat, lng]}>
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg mb-2">
                        {t(product.name.toLowerCase().replace(/\s+/g, '_'), { defaultValue: product.name })}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>{t("seller")}:</strong> {product.sellerName}</p>
                        <p><strong>{t("price")}:</strong> ₹{product.basePrice}/{t("kg", { defaultValue: "kg" })}</p>
                        <p><strong>{t("quantity")}:</strong> {product.quantity}{t("kg", { defaultValue: "kg" })}</p>
                        <p><strong>{t("type")}:</strong> {product.type}</p>
                        <p><strong>{t("quality")}:</strong> {product.quality}</p>
                      </div>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="mt-3 w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        {t("buy_now")}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Render Local Hub Markers */}
            {DEFAULT_HUBS.map((hub) => (
              <Marker key={hub.id} position={hub.location} icon={hubIcon}>
                <Popup>
                  <div className="p-3 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                        <Package className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base leading-tight">{hub.name}</h3>
                    </div>
                    <div className="space-y-1.5 text-xs text-text-secondary">
                      <div className="flex justify-between">
                        <span>{t("capacity")}:</span>
                        <span className="font-bold text-text-primary">{hub.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("status")}:</span>
                        <span className={`font-bold ${hub.status === 'Active' ? 'text-green-500' : 'text-orange-500'}`}>{t(hub.status.toLowerCase())}</span>
                      </div>
                      <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="font-medium text-primary">{t("logistics_intel")}</p>
                        <p className="text-[10px]">{t("optimized_crates")}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      {/* System Intelligence CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[32px] glass-card p-12 lg:p-20 text-center border border-primary/20"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center text-white mb-8 mx-auto shadow-2xl shadow-primary/40">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-text-primary mb-6 leading-tight">{t("verified_trust_network", { defaultValue: "Verified Farmer Trust & Quality Network" })}</h2>
            <p className="text-xl text-text-secondary mb-10 leading-relaxed">
              {t("transparency_description", { defaultValue: "We monitor 99.4% of all transactions with AI-powered transparency. Every farmer is verified, every product is tracked, and every complaint is resolved with 24/7 intelligence." })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center justify-center gap-3"
              >
                {t("view_transparency", { defaultValue: "View Trust Transparency" })} <TrendingUp className="w-5 h-5" />
              </button>
              <button className="px-10 py-4 bg-surface text-text-primary border border-border rounded-2xl font-bold text-lg hover:bg-surface-hover transition-colors">
                {t("safety_standards", { defaultValue: "Safety Standards" })}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-surface/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-display text-text-primary mb-4">{t("trusted_by_thousands", { defaultValue: "Trusted by Thousands" })}</h2>
          <p className="text-text-secondary">{t("community_description", { defaultValue: "Join our growing community of satisfied customers and verified farmers." })}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Ananya Sharma",
              role: "Home Chef",
              comment: "The Trust Score feature is a game-changer! I only buy from farmers with a 90%+ score, and the quality has been consistently amazing.",
              rating: 5,
              img: "https://i.pravatar.cc/150?u=ananya"
            },
            {
              name: "Rajesh Kumar",
              role: "Local Grocer",
              comment: "Reporting an issue is so simple. The QR code on the product card makes the whole process transparent and fast. Best agricultural platform yet!",
              rating: 5,
              img: "https://i.pravatar.cc/150?u=rajesh"
            },
            {
              name: "Priya Singh",
              role: "Regular Buyer",
              comment: "I love the 'Star Seller' badges. It gives me immediate peace of mind knowing that the farmer is reliable and high-quality.",
              rating: 5,
              img: "https://i.pravatar.cc/150?u=priya"
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 border border-border/40 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={item.img} alt={item.name} className="w-12 h-12 rounded-full border-2 border-primary/20" />
                <div>
                  <h4 className="font-bold text-text-primary">{item.name}</h4>
                  <p className="text-xs text-text-secondary">{item.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
              </div>
              <p className="text-text-secondary italic leading-relaxed">"{item.comment}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className="py-20 border-t border-border bg-surface/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentPage('home')}>
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white"><BrainCircuit className="w-5 h-5" /></div>
             <span className="text-xl font-bold text-text-primary">U-FIN AI</span>
          </div>
          <p className="text-xs text-text-secondary">© 2026 U-FIN AI Intelligence Network. Multilingual Voice Access Enabled.</p>
        </div>
      </footer>

      {/* Add Produce Modal */}
      <AnimatePresence>
        {showAddForm && isAuthenticated && (user?.role === 'farmer' || user?.role === 'hub' || user?.role === 'admin') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 p-2 hover:bg-surface rounded-full transition-colors z-10"><X className="w-6 h-6 text-text-secondary" /></button>
              <AddFood onSuccess={() => { setShowAddForm(false); fetchProduce(); }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Farmer Dashboard Modal */}
      <AnimatePresence>
        {showFarmerDashboard && isAuthenticated && (user?.role === 'farmer' || user?.role === 'hub' || user?.role === 'admin') && (
          <FarmerDashboard onClose={() => setShowFarmerDashboard(false)} />
        )}
      </AnimatePresence>
      </>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onBuyNow={handleModalBuyNow}
      />
      
      <Chatbot />
    </div>
  );
}

export default App;
