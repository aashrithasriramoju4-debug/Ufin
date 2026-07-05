import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Users, Truck, Package } from 'lucide-react';
import { dashboardApi } from './api';
import { useTranslation } from 'react-i18next';

const Stats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    mealsSaved: 0,
    foodRescued: 0,
    deliveries: 0,
    totalProduce: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };
    fetchStats();
  }, []);

  const items = [
    { label: t('meals_saved'), value: stats.mealsSaved, icon: <Users className="w-6 h-6 text-primary" />, color: 'primary' },
    { label: t('food_rescued'), value: stats.foodRescued, icon: <Leaf className="w-6 h-6 text-secondary" />, color: 'secondary' },
    { label: t('orders_completed'), value: stats.deliveries, icon: <Truck className="w-6 h-6 text-accent" />, color: 'accent' },
    { label: 'Active Listings', value: stats.totalProduce, icon: <Package className="w-6 h-6 text-blue-500" />, color: 'blue' }
  ];

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="glass-card p-6 flex items-center space-x-4 border border-border/50 hover:border-primary/50 transition-all duration-300"
          >
            <div className={`p-3 rounded-xl bg-${item.color}/10`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-wider font-semibold">{item.label}</p>
              <h3 className="text-3xl font-bold text-text-primary">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
