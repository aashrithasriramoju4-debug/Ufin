import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, TrendingUp, Users, ShieldCheck, 
  Award, MessageSquare, Clock, Filter, ArrowUpRight, Star
} from 'lucide-react';
import axios from 'axios';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/complaint/analytics');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-text-secondary animate-pulse">Analyzing system metrics...</p>
    </div>
  );

  if (!analytics) return (
    <div className="pt-32 text-center text-red-500">
      <p>{error || 'No analytics data available'}</p>
    </div>
  );

  const categoryData = Object.entries(analytics.complaintsPerCategory || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  const sentimentData = Object.entries(analytics.complaintsPerSentiment || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: value
  }));

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">{t("system_intelligence")}</h1>
          <p className="text-text-secondary mt-1">{t("real_time_trust")}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-surface-hover transition-colors">
            <Filter className="w-4 h-4" /> Filter Period
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
             Export Data <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: t('total_complaints', { defaultValue: 'Total Complaints' }), value: analytics.totalComplaints, icon: <MessageSquare />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: t('trust_rating', { defaultValue: 'Trust Rating' }), value: '85%', icon: <ShieldCheck />, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: t('resolved_cases', { defaultValue: 'Resolved Cases' }), value: '92%', icon: <CheckCircle2 />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: t('active_alerts', { defaultValue: 'Active Alerts' }), value: '3', icon: <AlertTriangle />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-border/50"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold text-text-primary mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Trusted Farmers Leaderboard */}
        <div className="lg:col-span-3 glass-card p-8 border-border/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-accent" /> {t("top_trusted_farmers")}
            </h3>
            <button className="text-primary text-sm font-bold hover:underline">View All Rankings</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-4 text-xs font-bold text-text-secondary uppercase tracking-wider">{t("farmer", { defaultValue: "Farmer" })}</th>
                  <th className="pb-4 text-xs font-bold text-text-secondary uppercase tracking-wider">{t("trust_score")}</th>
                  <th className="pb-4 text-xs font-bold text-text-secondary uppercase tracking-wider">{t("resolved_rate", { defaultValue: "Resolved Rate" })}</th>
                  <th className="pb-4 text-xs font-bold text-text-secondary uppercase tracking-wider">{t("rating", { defaultValue: "Rating" })}</th>
                  <th className="pb-4 text-xs font-bold text-text-secondary uppercase tracking-wider">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {/* Featured Farmer: Bhanu p */}
                <tr className="group hover:bg-surface/30 transition-colors bg-primary/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
                          BP
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">Bhanu p</p>
                          <p className="text-[10px] text-text-secondary">Elite Star Seller</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '98%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-green-500">98%</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-text-secondary">99.2%</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-accent text-xs">⭐</span>
                        <span className="text-sm font-bold">4.9</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                        Top Rated
                      </span>
                    </td>
                </tr>

                {/* Added Farmer: Sanjay M */}
                <tr className="group hover:bg-surface/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                          SM
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">Sanjay M</p>
                          <p className="text-[10px] text-text-secondary">Verified Star Seller</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-green-500">88%</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-text-secondary">95.4%</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-accent text-xs">⭐</span>
                        <span className="text-sm font-bold">4.3</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                        Star Seller
                      </span>
                    </td>
                </tr>

                {(analytics.complaintsPerFarmer || []).slice(0, 4).map((farmer, i) => (
                  <tr key={i} className="group hover:bg-surface/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                          {farmer._id?.slice(-2).toUpperCase() || 'F'}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">Farmer #{farmer._id}</p>
                          <p className="text-[10px] text-text-secondary">Verified Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-green-500">85%</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-text-secondary">94%</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-accent text-xs">⭐</span>
                        <span className="text-sm font-bold">4.8</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                        Star Seller
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Feedback & Reviews */}
        <div className="lg:col-span-2 glass-card p-8 border-border/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Verified User Feedback
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                user: "Arjun Reddy", 
                date: "2 days ago", 
                comment: "The AI price prediction helped me save ₹200 on my weekly groceries. Incredible transparency!", 
                rating: 5 
              },
              { 
                user: "Meera Nair", 
                date: "5 days ago", 
                comment: "Trust Scores make it so easy to shop with confidence. I know exactly who I am buying from.", 
                rating: 5 
              },
              { 
                user: "Suresh Babu", 
                date: "1 week ago", 
                comment: "Resolving a delivery issue was surprisingly fast. The system is very efficient.", 
                rating: 5 
              },
              { 
                user: "Kavita Rao", 
                date: "3 days ago", 
                comment: "The QR code reporting is genius. No more long forms or waiting on hold.", 
                rating: 5 
              }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-surface/40 rounded-2xl border border-border/30 hover:border-primary/20 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{review.user}</p>
                      <p className="text-[10px] text-text-secondary">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}
                  </div>
                </div>
                <p className="text-xs text-text-secondary italic leading-relaxed">"{review.comment}"</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="glass-card p-8 border-border/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" /> Sentiment Analysis
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="count"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {sentimentData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-text-secondary">{item.name}</span>
                </div>
                <span className="font-bold">{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
