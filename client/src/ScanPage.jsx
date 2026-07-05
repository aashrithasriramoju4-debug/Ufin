import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const crateId = searchParams.get('crateId');
  const [crateData, setCrateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (crateId) {
      fetchCrateDetails();
    }
  }, [crateId]);

  const fetchCrateDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/crate/${crateId}`);
      if (res.data.success) {
        setCrateData(res.data.crate);
      }
    } catch (err) {
      console.error('Error fetching crate:', err);
      setMessage('Crate not found in system.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/crate/scan', {
        crateId,
        status
      });
      if (res.data.success) {
        setMessage(`Status updated to ${status} successfully!`);
        setCrateData(res.data.crate);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setMessage('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (!crateId) {
    return (
      <div className="pt-32 px-6 text-center">
        <p className="text-red-500 font-bold">Invalid QR Code: No Crate ID found.</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-border/50 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Scan Crate</h1>
            <p className="text-text-secondary text-sm">Logistics Tracking System</p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : crateData ? (
          <div className="space-y-6">
            <div className="p-4 bg-surface rounded-2xl border border-border">
              <p className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-1">Crate ID</p>
              <p className="text-xl font-mono font-bold text-primary">{crateId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">Product</p>
                <p className="font-bold text-text-primary">{crateData.product}</p>
              </div>
              <div>
                <p className="text-text-secondary">Current Status</p>
                <p className="font-bold text-accent uppercase">{crateData.status}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                disabled={updating}
                onClick={() => updateStatus('received')}
                className="w-full py-4 bg-surface hover:bg-surface-hover border border-border rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                Mark Received
              </button>

              <button
                disabled={updating}
                onClick={() => updateStatus('sorting')}
                className="w-full py-4 bg-surface hover:bg-surface-hover border border-border rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4 text-blue-500" />}
                Mark Sorting
              </button>

              <button
                disabled={updating}
                onClick={() => updateStatus('dispatched')}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                Dispatch Crate
              </button>
            </div>

            {message && (
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-center text-sm font-bold p-3 rounded-xl ${message.includes('successfully') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
              >
                {message}
              </motion.p>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-text-secondary">
            <p>{message || 'Loading crate data...'}</p>
          </div>
        )}

        <button 
          onClick={() => window.history.back()}
          className="mt-8 flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default ScanPage;
