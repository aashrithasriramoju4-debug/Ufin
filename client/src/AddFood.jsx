import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, UploadCloud, Mic, Sparkles, Camera, Image as ImageIcon } from 'lucide-react';
import { produceApi } from './api';
import { useVoiceRecognition } from './useVoice';
import { useTranslation } from 'react-i18next';
import { getProductImage, fileToBase64 } from './utils/images';

const AddFood = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: '',
    basePrice: '',
    sellerName: 'John Doe',
    sellerPhone: '9876543210',
    sellerEmail: 'john@example.com',
    latitude: '17.3850', // Default Hyderabad latitude
    longitude: '78.4867', // Default Hyderabad longitude
    photo: null,
    customImage: null
  });

  const [loading, setLoading] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, customImage: base64 }));
        setPreviewImage(URL.createObjectURL(file));
      } catch (error) {
        console.error('Error converting image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  // Get suggested image based on product name and type
  const getSuggestedImage = () => {
    if (formData.customImage) return formData.customImage;
    if (formData.name && formData.type) {
      return getProductImage(formData.name, formData.type);
    }
    return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop';
  };

  // Simulate AI prediction
  useEffect(() => {
    if (formData.name.length > 2) {
      setIsPredicting(true);
      const timer = setTimeout(() => {
        const base = formData.name.charCodeAt(0) || 50;
        const calcPrice = (base % 50) + 20 + formData.name.length * 2;
        setPredictedPrice(calcPrice);
        setIsPredicting(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setPredictedPrice(null);
    }
  }, [formData.name]);

  // Voice Inputs
  const { isListening: isNameListening, startListening: startNameVoice } = useVoiceRecognition((text) => {
    setFormData(prev => ({ ...prev, name: text }));
  });

  const { isListening: isQtyListening, startListening: startQtyVoice } = useVoiceRecognition((text) => {
    const qty = text.match(/\d+/);
    if (qty) setFormData(prev => ({ ...prev, quantity: qty[0] }));
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data with coordinates and image
      const submitData = {
        ...formData,
        location: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        imageUrl: formData.customImage || getSuggestedImage()
      };
      delete submitData.latitude;
      delete submitData.longitude;
      delete submitData.photo; // Remove unused photo field
      delete submitData.customImage; // Remove from submission, use imageUrl

      const res = await produceApi.add(submitData);
      if (res.data.success) {
        alert('Food item added successfully! AI classification complete.');
        setFormData({
          name: '',
          type: '',
          quantity: '',
          basePrice: '',
          sellerName: 'John Doe',
          sellerPhone: '9876543210',
          sellerEmail: 'john@example.com',
          latitude: '17.3850', // Default Hyderabad latitude
          longitude: '78.4867', // Default Hyderabad longitude
          photo: null,
          customImage: null
        });
        setPreviewImage(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error adding food', error);
      alert('Failed to add food.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 shadow-2xl border border-primary/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <UploadCloud className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display text-text-primary">Premium Produce Listing</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">Produce Name</label>
          <div className="relative">
            <input
              required
              placeholder="e.g. Organic Tomatoes"
              className="w-full p-4 pr-12 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <button 
              type="button" 
              onClick={startNameVoice} 
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isNameListening ? 'bg-red-500 text-white animate-pulse' : 'text-text-secondary hover:text-primary hover:bg-primary/10'}`}
              title="Speak Name"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">Type</label>
          <select
            required
            className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="">Select Type</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit</option>
            <option value="Grain">Grain</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">Quantity (kg)</label>
          <div className="relative">
            <input
              required
              type="number"
              placeholder="0"
              className="w-full p-4 pr-12 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <button 
              type="button" 
              onClick={startQtyVoice} 
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isQtyListening ? 'bg-red-500 text-white animate-pulse' : 'text-text-secondary hover:text-primary hover:bg-primary/10'}`}
              title="Speak Quantity"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">Price per kg (₹)</label>
          <div className="relative">
            <input
              required
              type="number"
              placeholder="0"
              className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            />
          </div>
          <AnimatePresence>
            {(Boolean(isPredicting) || predictedPrice !== null) && formData.name.length > 2 ? (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                  {isPredicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium text-primary">AI is analyzing market trends...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Est. Market Price: <strong className="text-sm font-bold ml-1">₹{predictedPrice}</strong>/kg
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, basePrice: (predictedPrice || 0).toString() }))}
                        className="ml-auto text-[10px] font-bold bg-primary text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-white hover:text-primary transition-all duration-300"
                      >
                        Apply Price
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-text-secondary uppercase">Product Photo</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Preview */}
            <div className="space-y-2">
              <div className="aspect-square bg-surface border border-border rounded-xl overflow-hidden">
                <img
                  src={previewImage || getSuggestedImage()}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] text-text-secondary text-center">
                {previewImage ? 'Your uploaded image' : 'Suggested image based on product'}
              </p>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Upload Your Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Or Use Suggested Image</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, customImage: null }));
                      setPreviewImage(null);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      !formData.customImage && !previewImage
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5 text-text-secondary" />
                    <span className="text-xs font-medium">Auto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const suggested = getSuggestedImage();
                      setFormData(prev => ({ ...prev, customImage: suggested }));
                      setPreviewImage(suggested);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.customImage && !previewImage
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Camera className="w-5 h-5 text-text-secondary" />
                    <span className="text-xs font-medium">Suggested</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">Location Coordinates (for Map)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-secondary">Latitude</label>
              <input
                required
                type="number"
                step="any"
                placeholder="17.3850 (Hyderabad)"
                className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Longitude</label>
              <input
                required
                type="number"
                step="any"
                placeholder="78.4867 (Hyderabad)"
                className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-text-secondary">Enter precise coordinates for accurate map positioning. You can find coordinates using Google Maps or GPS.</p>
        </div>

        <div className="md:col-span-2 mt-4">
          <button
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'AI Analyzing Listing...' : t("list_produce")}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddFood;
