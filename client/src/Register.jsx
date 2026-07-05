import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from './api';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Make API call to register
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.3850]
        } // Default location, can be updated later
      });

      // Store user data and token
      const { user, token } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      onRegister(user);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 max-w-md mx-auto border border-border/50"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Create Account</h2>
        <p className="text-text-secondary">Join the U-FIN community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <User className="w-4 h-4" /> Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Your full name"
            className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email *
          </label>
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Phone className="w-4 h-4" /> Phone
          </label>
          <input
            type="tel"
            placeholder="+91 9876543210"
            className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">I am a...</label>
          <select
            className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="farmer">🌾 Farmer - I grow and sell produce</option>
            <option value="buyer">🛒 Buyer - I purchase produce</option>
            <option value="ngo">🤝 NGO - I help with food distribution</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Lock className="w-4 h-4" /> Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create a password"
              className="w-full p-4 pr-12 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Lock className="w-4 h-4" /> Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Confirm your password"
              className="w-full p-4 pr-12 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-secondary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-text-secondary text-sm">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-secondary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;