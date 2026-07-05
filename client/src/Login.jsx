import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from './api';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make API call to login
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });

      // Store user data and token
      const { user, token } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      onLogin(user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
        <p className="text-text-secondary">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
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
            <Lock className="w-4 h-4" /> Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
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

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-text-secondary text-sm">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-600 text-xs text-center">
          Demo: Use any email and password to sign in
        </p>
      </div>
    </motion.div>
  );
};

export default Login;