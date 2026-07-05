import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Download, QrCode, Loader2, ArrowLeft, Printer } from 'lucide-react';

const BatchDetails = ({ batchId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrs, setQrs] = useState({});

  useEffect(() => {
    fetchDetails();
  }, [batchId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/batch/${batchId}`);
      if (res.data.success) {
        setData(res.data);
        // Fetch QRs for all crates
        const qrMap = {};
        for (const crate of res.data.crates) {
          const qrRes = await axios.get(`http://localhost:5000/api/crate/qr/${crate.crateId}`);
          if (qrRes.data.success) {
            qrMap[crate.crateId] = qrRes.data.qrCode;
          }
        }
        setQrs(qrMap);
      }
    } catch (err) {
      console.error('Error fetching batch details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-text-secondary animate-pulse font-medium">Loading batch and generating QR codes...</p>
      </div>
    );
  }

  if (!data) return <div className="pt-40 text-center">Batch not found.</div>;

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-display">Batch: {batchId}</h1>
            <p className="text-text-secondary">{data.batch.product} • {data.batch.totalQuantity}kg • {data.batch.totalCrates} Crates</p>
          </div>
        </div>
        
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Printer className="w-5 h-5" /> Print All QR Labels
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.crates.map((crate, idx) => (
          <motion.div
            key={crate.crateId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-6 border-border/50 hover:border-primary/30 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-full flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${crate.status === 'created' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                {crate.status}
              </span>
              <span className="text-[10px] font-mono text-text-secondary">{crate.quantity}kg</span>
            </div>

            <div className="w-32 h-32 bg-white p-2 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl">
              {qrs[crate.crateId] ? (
                <img src={qrs[crate.crateId]} alt="QR" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <QrCode className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            <h3 className="font-mono font-bold text-text-primary mb-1">{crate.crateId}</h3>
            <p className="text-[10px] text-text-secondary mb-4">Scan to update tracking</p>

            <a 
              href={`/scan?crateId=${crate.crateId}`}
              className="mt-auto w-full py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-xs font-bold transition-colors"
            >
              Preview Tracking Page
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BatchDetails;
