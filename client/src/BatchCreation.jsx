import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Plus, Loader2, ArrowRight } from 'lucide-react';

const BatchCreation = ({ onBatchCreated }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    farmerId: '',
    product: '',
    totalQuantity: '',
    crateSize: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/batch/create', {
        ...formData,
        totalQuantity: Number(formData.totalQuantity),
        crateSize: Number(formData.crateSize)
      });
      if (res.data.success) {
        onBatchCreated(res.data.batch.batchId);
      }
    } catch (err) {
      console.error('Error creating batch:', err);
      setError('Failed to create batch. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 border-border/50 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-display">Create Logistics Batch</h1>
            <p className="text-text-secondary">Initialize a new supply chain batch with automatic crate generation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">Batch ID</label>
              <input
                required
                type="text"
                placeholder="e.g. B001"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.batchId}
                onChange={(e) => setFormData({...formData, batchId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">Farmer ID</label>
              <input
                required
                type="text"
                placeholder="e.g. FARMER_123"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.farmerId}
                onChange={(e) => setFormData({...formData, farmerId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">Product Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Organic Tomatoes"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">Total Quantity (kg)</label>
              <input
                required
                type="number"
                placeholder="e.g. 1000"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.totalQuantity}
                onChange={(e) => setFormData({...formData, totalQuantity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary">Crate Size (kg)</label>
              <input
                required
                type="number"
                placeholder="e.g. 20"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.crateSize}
                onChange={(e) => setFormData({...formData, crateSize: e.target.value})}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5" /> Initialize Batch & Generate Crates</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default BatchCreation;
