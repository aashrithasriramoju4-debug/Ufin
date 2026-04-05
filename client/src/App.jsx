import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Leaf, Users, Globe, Play, Phone, Mail, MessageCircle, Plus, Filter, Sun, Moon, X, ChevronRight, BarChart3, Shield, Zap } from 'lucide-react';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [produceList, setProduceList] = useState([]);
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactProduce, setContactProduce] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', role: 'farmer', location: '77.5946,12.9716' });
  const [produceInput, setProduceInput] = useState({ type: 'apple', quantity: 100, freshness: 8, damage: 1, location: [77.5946, 12.9716], imageUrl: '', sellerName: '', sellerPhone: '', sellerEmail: '' });
  const [isDarkMode, setIsDarkMode] = useState(true);

  const API = '/api';

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
  };

  // Apply theme on mount
  useEffect(() => {
    if (!isDarkMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [isDarkMode]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  const fetchProduce = async () => {
    try {
      const res = await axios.get(`${API}/produce/all?status=available`, { headers: getAuthHeaders() });
      setProduceList(res.data.produce);
    } catch (error) {
      console.error('fetchProduce', error);
    }
  };

  const handleAuth = async (action) => {
    try {
      const endpoint = action === 'login' ? 'login' : 'register';
      const body = action === 'login'
        ? { email: authData.email, password: authData.password }
        : {
            name: authData.name,
            email: authData.email,
            password: authData.password,
            role: authData.role,
            location: {
              type: 'Point',
              coordinates: authData.location.split(',').map(Number)
            }
          };

      const res = await axios.post(`${API}/auth/${endpoint}`, body);
      const token = res.data?.token;
      if (!token) throw new Error('Missing token');

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setShowAuth(false);
      fetchProduce();
      alert(`${action} successful`);
    } catch (error) {
      alert(error?.response?.data?.message || 'Auth error');
    }
  };

  const handleAddProduce = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    try {
      await axios.post(`${API}/produce/add`, produceInput, { headers: getAuthHeaders() });
      fetchProduce();
      alert('Produce added successfully!');
    } catch (error) {
      alert(error?.response?.data?.message || 'Error adding produce');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async (produceId, status) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    
    if (status === 'sold') {
      const confirm = window.confirm('Are you sure you want to mark this product as sold? This action cannot be undone.');
      if (!confirm) return;
    }

    try {
      await axios.put(`${API}/produce/${produceId}/status`, { status }, { headers: getAuthHeaders() });
      fetchProduce();
      showToast(`Product marked as ${status.replace('_', ' ').toUpperCase()}!`, 'success');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Error updating status', 'error');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    fetchProduce();
  }, []);

  const displayedProduce = produceList.filter((produce) => filterType === 'all' || produce.type === filterType);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'on_hold': return 'text-yellow-600 bg-yellow-100';
      case 'sold': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '🟢';
      case 'on_hold': return '🟡';
      case 'sold': return '🔴';
      default: return '⚪';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'SELL': return 'bg-green-100 text-green-700';
      case 'DONATE': return 'bg-yellow-100 text-yellow-700';
      case 'PROCESS': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getQualityLabel = (quality) => {
    switch (quality) {
      case 'SELL': return 'Sell';
      case 'DONATE': return 'Donate';
      case 'PROCESS': return 'Process';
      default: return 'Unknown';
    }
  };

  const getQualityProgress = (freshness, damage) => {
    const score = Math.max(0, Math.min(100, Math.round((freshness * 10) - (damage * 5))));
    return score;
  };

  const handleContactDealer = (produce) => {
    setContactProduce(produce);
    setShowContact(true);
  };

  const cleanPhoneNumber = (phone) => {
    // Remove all non-digit characters and ensure it's a valid Indian mobile number
    const cleaned = phone.replace(/\D/g, '');
    // If it starts with 91, remove it, then add it back
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      return cleaned.substring(2);
    }
    return cleaned;
  };

  const handleContactAction = (action, value) => {
    try {
      console.log(`Contact action: ${action}, value: ${value}`);
      switch (action) {
        case 'call':
          // Try multiple methods for calling
          try {
            window.location.href = `tel:${value}`;
          } catch (e) {
            window.open(`tel:${value}`, '_self');
          }
          break;
        case 'email':
          try {
            window.location.href = `mailto:${value}?subject=U-FIN Inquiry&body=Hi, I'm interested in your produce.`;
          } catch (e) {
            window.open(`mailto:${value}?subject=U-FIN Inquiry&body=Hi, I'm interested in your produce.`, '_self');
          }
          break;
        case 'whatsapp':
          const phone = cleanPhoneNumber(value);
          console.log(`Cleaned phone: ${phone}`);
          if (phone.length < 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
          }
          const whatsappUrl = `https://wa.me/91${phone}?text=Hi, I'm interested in your produce from U-FIN!`;
          console.log(`WhatsApp URL: ${whatsappUrl}`);

          // Try multiple methods to open WhatsApp
          try {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
          } catch (e) {
            // Fallback: try opening in same window
            window.location.href = whatsappUrl;
          }
          break;
      }
    } catch (error) {
      console.error('Contact action failed:', error);
      alert(`Unable to open ${action}. Please copy this link and open manually:\n\n${action === 'whatsapp' ? `https://wa.me/91${cleanPhoneNumber(value)}` : action === 'call' ? `tel:${value}` : `mailto:${value}`}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold font-display text-primary"
            >
              U-FIN
            </motion.h1>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-text-secondary hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="text-text-secondary hover:text-primary transition-colors">How it works</a>
                <a href="#contact" className="text-text-secondary hover:text-primary transition-colors">Contact</a>
              </nav>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-surface transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-text-primary" /> : <Moon className="w-5 h-5 text-text-primary-light" />}
              </button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-text-secondary">Welcome back!</span>
                  <button
                    onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
                    className="px-4 py-2 text-text-secondary hover:text-primary transition-colors border border-border rounded-full hover:border-primary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuth(true)}
                  className="primary-button"
                >
                  Get Started
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold font-display text-text-primary mb-6">
              Reduce Waste.<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Share Freshness.</span>
            </h1>
            <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect farmers with communities. Transform imperfect produce into shared abundance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuth(true)}
                className="primary-button text-lg px-8 py-4"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="secondary-button text-lg px-8 py-4"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 text-center"
            >
              <div className="text-5xl font-bold text-primary mb-2">{produceList.length}</div>
              <div className="text-sm text-text-secondary uppercase tracking-wider">Produce Listings</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 text-center"
            >
              <div className="text-5xl font-bold text-secondary mb-2">1.2K+</div>
              <div className="text-sm text-text-secondary uppercase tracking-wider">Community Members</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 text-center"
            >
              <div className="text-5xl font-bold text-accent mb-2">{produceList.reduce((sum, item) => sum + item.quantity, 0)}kg</div>
              <div className="text-sm text-text-secondary uppercase tracking-wider">Waste Prevented</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-display text-text-primary mb-4">How U-FIN Works</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Smart technology meets sustainable agriculture to reduce food waste and connect communities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Filter className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Smart Classification</h3>
              <p className="text-text-secondary">
                AI-powered analysis evaluates produce quality, freshness, and market viability to ensure optimal distribution.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Instant Matching</h3>
              <p className="text-text-secondary">
                Connect farmers, buyers, and NGOs instantly with real-time inventory and demand matching algorithms.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Impact Tracking</h3>
              <p className="text-text-secondary">
                Monitor environmental impact, meals saved, and community benefits with comprehensive analytics.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-display text-text-primary">Join U-FIN</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="p-2 hover:bg-surface rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                placeholder="Name"
                className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                value={authData.name}
                onChange={e => setAuthData(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                placeholder="Email"
                className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                value={authData.email}
                onChange={e => setAuthData(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                value={authData.password}
                onChange={e => setAuthData(prev => ({ ...prev, password: e.target.value }))}
              />
              <input
                placeholder="Role (farmer/ngo/buyer/admin)"
                className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                value={authData.role}
                onChange={e => setAuthData(prev => ({ ...prev, role: e.target.value }))}
              />
              <input
                placeholder="Location (lng,lat)"
                className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                value={authData.location}
                onChange={e => setAuthData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAuth('register')}
                className="flex-1 primary-button"
              >
                Register
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAuth('login')}
                className="flex-1 secondary-button"
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Contact Dealer Modal */}
      {showContact && contactProduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-display text-text-primary">Contact Dealer</h2>
              <button
                onClick={() => setShowContact(false)}
                className="p-2 hover:bg-surface rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">{contactProduce.sellerName}</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 glass-card">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{contactProduce.sellerPhone}</p>
                    <p className="text-sm text-text-secondary">Phone Number</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 glass-card">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{contactProduce.sellerEmail}</p>
                    <p className="text-sm text-text-secondary">Email Address</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleContactAction('call', contactProduce.sellerPhone)}
                className="flex-1 primary-button flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleContactAction('email', contactProduce.sellerEmail)}
                className="flex-1 secondary-button flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </motion.button>
            </div>

            <div className="mt-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleContactAction('whatsapp', contactProduce.sellerPhone)}
                className="w-full py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-full hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                title="Click to open WhatsApp. Make sure popups are allowed in your browser."
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </motion.button>
              <p className="text-xs text-text-secondary mt-1 text-center">
                If link doesn't open, check browser popup settings
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        {/* Add Produce Section */}
        {isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold font-display text-text-primary mb-8">Add New Produce</h2>
              <form onSubmit={handleAddProduce} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['type', 'quantity', 'freshness', 'damage', 'imageUrl', 'sellerName', 'sellerPhone', 'sellerEmail'].map(field => (
                  <div key={field} className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary capitalize">{field.replace('seller', 'Seller ')}</label>
                    <input
                      value={produceInput[field]}
                      onChange={e => setProduceInput(prev => ({
                        ...prev,
                        [field]: field === 'quantity' || field === 'freshness' || field === 'damage'
                          ? Number(e.target.value)
                          : e.target.value
                      }))}
                      className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                      type={field === 'imageUrl' ? 'url' : field === 'sellerEmail' ? 'email' : 'text'}
                    />
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="text-sm font-medium text-text-secondary">Location (longitude, latitude)</label>
                  <input
                    value={produceInput.location.join(',')}
                    onChange={e => setProduceInput(prev => ({
                      ...prev,
                      location: e.target.value.split(',').map(Number)
                    }))}
                    className="w-full p-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-secondary"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 primary-button flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Produce
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setProduceInput({
                        type: 'apple',
                        quantity: 50,
                        freshness: 9,
                        damage: 1,
                        location: [77.5946, 12.9716],
                        imageUrl: '',
                        sellerName: 'Rajesh Kumar',
                        sellerPhone: '9876543210',
                        sellerEmail: 'rajesh.farmer@email.com'
                      })}
                      className="px-6 py-3 bg-surface border border-border text-text-secondary rounded-full hover:border-primary hover:text-primary transition-colors"
                    >
                      Load Test Data
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.section>
        )}

        {/* Map Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold font-display text-text-primary mb-8">Available Produce Map</h2>
            <div className="flex flex-wrap gap-3 mb-8">
              {['all', 'apple', 'banana', 'tomato', 'carrot'].map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filterType === type
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  {type === 'all' ? 'All produce' : type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
            <div className="h-96 rounded-2xl overflow-hidden border border-border">
              <MapContainer center={[12.9716, 77.5946]} zoom={10} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {displayedProduce.map(produce => (
                  <Marker
                    key={produce._id}
                    position={produce.location.coordinates.slice().reverse()}
                    eventHandlers={{
                      click: () => setSelectedProduce(produce),
                    }}
                  >
                    <Popup>
                      <div className="p-3 bg-surface text-text-primary rounded-lg border border-border">
                        <h3 className="font-bold text-primary mb-1">{produce.type}</h3>
                        <p className="text-text-secondary text-sm">Quantity: {produce.quantity}kg</p>
                        <p className="text-text-secondary text-sm">Quality: {produce.quality}</p>
                        <p className="text-text-secondary text-sm">Freshness: {produce.freshness}/10</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </motion.section>

        {/* Produce Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <h2 className="text-4xl font-bold font-display text-text-primary">Available Produce</h2>
            <span className="glass-card px-4 py-2 text-sm text-text-secondary">Showing {displayedProduce.length} items</span>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children"
            initial="hidden"
            animate="visible"
          >
            {displayedProduce.map((produce, index) => (
              <motion.div
                key={produce._id}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass-card p-6 cursor-pointer transition-all duration-300 ${produce.status === 'on_hold' ? 'opacity-70' : ''}`}
                onClick={() => setSelectedProduce(produce)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">
                    {produce.type === 'apple' ? '🍎' : produce.type === 'banana' ? '🍌' : produce.type === 'tomato' ? '🍅' : '🥕'}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      produce.quality === 'SELL' ? 'bg-secondary/20 text-secondary' :
                      produce.quality === 'DONATE' ? 'bg-accent/20 text-accent' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {produce.quality}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      produce.status === 'available' ? 'bg-secondary/20 text-secondary' :
                      produce.status === 'on_hold' ? 'bg-accent/20 text-accent' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {produce.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-4 capitalize">{produce.type}</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Quantity</span>
                    <span className="font-semibold text-text-primary">{produce.quantity} kg</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Quality Score</span>
                      <span className="font-semibold text-text-primary">{getQualityProgress(produce.freshness, produce.damage)}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-secondary via-primary to-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getQualityProgress(produce.freshness, produce.damage)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Damage Level</span>
                    <span className="font-semibold text-text-primary">{produce.damage}/10</span>
                  </div>

                  <div className="flex items-center text-text-secondary">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {produce.location.coordinates[1].toFixed(4)}, {produce.location.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleContactDealer(produce); }}
                    className="flex-1 primary-button text-sm flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3 h-3" />
                    Contact
                  </motion.button>

                  {isAuthenticated && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(produce._id, 'on_hold'); }}
                        className="px-3 py-2 bg-accent text-white text-sm rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
                        disabled={produce.status !== 'available'}
                      >
                        Hold
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(produce._id, 'sold'); }}
                        className="px-3 py-2 bg-secondary text-white text-sm rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
                        disabled={produce.status === 'sold'}
                      >
                        Sold
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold font-display text-primary mb-4">U-FIN</h3>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">
              Reducing food waste, one connection at a time.
            </p>
            <div className="flex justify-center space-x-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm text-text-secondary">Fresh produce shared</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-sm text-text-secondary">Communities connected</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <div className="text-sm text-text-secondary">Planet protected</div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default App;
