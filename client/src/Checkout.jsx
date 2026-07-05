import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CreditCard, MapPin, ShieldCheck, ShoppingBag, Truck, CheckCircle2, ChevronRight, Smartphone } from 'lucide-react';
import { produceApi, orderApi, paymentApi } from './api';
import { useTranslation } from 'react-i18next';

const Checkout = ({ produceId, onBack }) => {
  const { t } = useTranslation();
  const [produce, setProduce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState('review'); // 'review', 'payment', 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    pickupAddress: '456 Farm Road, Hyderabad',
    deliveryAddress: '123 Main St, Hyderabad',
    phone: '9876543210',
    email: 'buyer@demo.com',
    name: 'Jane Doe'
  });

  useEffect(() => {
    const fetchProduce = async () => {
      try {
        const res = await produceApi.getAll();
        const item = res.data.produce.find(p => p._id === produceId);
        setProduce(item);
      } catch (error) {
        console.error('Error fetching produce', error);
      } finally {
        setLoading(false);
      }
    };
    if (produceId) fetchProduce();
  }, [produceId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!produce) return <div className="min-h-screen flex items-center justify-center">Produce not found.</div>;

  const baseTotal = produce.basePrice * quantity;
  const commission = baseTotal * 0.05;
  const deliveryFee = 50;
  const finalTotal = baseTotal + commission + deliveryFee;

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    
    try {
      // First create the order
      const orderData = {
        productId: produce._id,
        quantity,
        buyerName: deliveryInfo.name,
        buyerPhone: deliveryInfo.phone,
        buyerEmail: deliveryInfo.email,
        pickupLocation: {
          address: deliveryInfo.pickupAddress,
          coordinates: [78.4867, 17.3850]
        },
        deliveryLocation: {
          address: deliveryInfo.deliveryAddress,
          coordinates: [78.4867, 17.3850]
        }
      };
      
      const orderRes = await orderApi.create(orderData);
      if (!orderRes.data.success) {
        throw new Error('Failed to create order');
      }

      const orderId = orderRes.data.order._id;

      // Then process payment
      const paymentData = {
        orderId,
        paymentMethod,
        amount: finalTotal
      };

      const paymentRes = await paymentApi.processPayment(paymentData);
      if (!paymentRes.data.success) {
        throw new Error('Payment failed');
      }

      setPaymentStep('success');
    } catch (error) {
      console.error('Order/Payment error', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {t("marketplace")}
        </button>

        <AnimatePresence mode="wait">
          {paymentStep !== 'success' ? (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Side: Forms */}
              <div className="lg:col-span-7 space-y-8">
                <div className="flex items-center gap-4 border-b border-border pb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paymentStep === 'review' ? 'bg-primary text-white' : 'bg-green-500 text-white'}`}>
                    {paymentStep === 'review' ? '1' : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">{t("total")} & {t("delivery_address")}</h2>
                </div>

                {paymentStep === 'review' ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="glass-card p-6 border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">{t("full_name")}</label>
                          <input className="w-full p-4 bg-surface border border-border rounded-xl" value={deliveryInfo.name} onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">{t("phone")}</label>
                          <input className="w-full p-4 bg-surface border border-border rounded-xl" value={deliveryInfo.phone} onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})} />
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-2">
                            <Truck className="w-3 h-3" /> {t("pickup_location")}
                          </label>
                          <input className="w-full p-4 bg-surface border border-border rounded-xl" value={deliveryInfo.pickupAddress} onChange={e => setDeliveryInfo({...deliveryInfo, pickupAddress: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {t("delivery_address")}
                          </label>
                          <input className="w-full p-4 bg-surface border border-border rounded-xl" value={deliveryInfo.deliveryAddress} onChange={e => setDeliveryInfo({...deliveryInfo, deliveryAddress: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setPaymentStep('payment')} className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
                       {t("continue_payment")} <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <Smartphone className={`w-8 h-8 ${paymentMethod === 'upi' ? 'text-primary' : 'text-text-secondary'}`} />
                        <span className="font-bold">{t("upi")}</span>
                      </button>
                      <button 
                         onClick={() => setPaymentMethod('card')}
                         className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-primary' : 'text-text-secondary'}`} />
                        <span className="font-bold">{t("card")}</span>
                      </button>
                    </div>

                    <div className="glass-card p-6 border border-border/50">
                      {paymentMethod === 'upi' ? (
                        <div className="space-y-4">
                          <label className="text-sm font-bold">Enter UPI ID</label>
                          <input placeholder="username@upi" className="w-full p-4 bg-surface border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <input placeholder="Card Number" className="w-full p-4 bg-surface border border-border rounded-xl outline-none" />
                          <div className="grid grid-cols-2 gap-4">
                             <input placeholder="MM/YY" className="w-full p-4 bg-surface border border-border rounded-xl outline-none" />
                             <input placeholder="CVV" className="w-full p-4 bg-surface border border-border rounded-xl outline-none" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={submitting}
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {submitting ? t("processing_verification") : `${t("pay")} ₹${finalTotal.toFixed(2)}`}
                    </button>
                    <button onClick={() => setPaymentStep('review')} className="w-full text-center text-sm text-text-secondary hover:text-primary transition-colors">{t("back_delivery")}</button>
                  </motion.div>
                )}
              </div>

              {/* Right Side: Summary */}
              <div className="lg:col-span-5 h-fit sticky top-28">
                <div className="glass-card p-8 border border-primary/20 bg-primary/5">
                  <div className="flex gap-4 mb-8">
                    <img src={produce.imageUrl} className="w-20 h-20 object-cover rounded-xl" />
                    <div>
                      <h3 className="font-bold text-text-primary text-xl">
                        {t(produce.name.toLowerCase().replace(/\s+/g, '_'), { defaultValue: produce.name })}
                      </h3>
                      <p className="text-text-secondary text-sm">{produce.type}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="font-bold text-primary">₹{produce.basePrice}/kg</span>
                         <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-lg border border-border">
                            <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="px-2 text-primary">-</button>
                            <span className="min-w-[20px] text-center font-bold">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(produce.quantity, quantity+1))} className="px-2 text-primary">+</button>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border/50">
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Subtotal</span>
                      <span>₹{baseTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                       <span>Platform Fee (AI Optimization)</span>
                       <span>₹{commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Logistics & Delivery</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-text-primary pt-4 border-t border-border">
                      <span>{t("total")}</span>
                      <span className="text-primary font-display">₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-3 text-text-secondary text-xs px-2">
                   <ShieldCheck className="w-4 h-4 text-secondary" />
                   {t("ai_verified_transaction")}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center max-w-xl mx-auto border-2 border-secondary/30"
            >
              <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-16 h-16 text-secondary" />
              </div>
              <h2 className="text-4xl font-bold text-text-primary mb-4">{t("payment_success")}</h2>
              <p className="text-text-secondary mb-8">{t("order_matched")}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-surface border border-border rounded-2xl">
                    <p className="text-[10px] text-text-secondary uppercase">Order ID</p>
                    <p className="font-bold text-sm">#UFIN-{Math.floor(Math.random() * 90000 + 10000)}</p>
                 </div>
                 <div className="p-4 bg-surface border border-border rounded-2xl">
                    <p className="text-[10px] text-text-secondary uppercase">ETA</p>
                    <p className="font-bold text-sm">45-60 Minutes</p>
                 </div>
              </div>

              <button onClick={onBack} className="w-full py-4 bg-primary text-white rounded-xl font-bold">
                {t("return_marketplace")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
