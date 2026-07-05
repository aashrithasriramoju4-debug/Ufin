import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-primary transition-colors focus:outline-none"
      >
        <span className="text-xl font-bold font-display text-text-primary">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-text-secondary" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="pb-6">
          <p className="text-lg text-text-secondary leading-relaxed">
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What is AI recommendation?",
      answer: "Our AI analyzes market trends, demand patterns, and price history to provide personalized recommendations. It considers factors like current market conditions, predicted price movements, and local demand to suggest whether you should BUY NOW, WAIT, or HOLD for optimal pricing."
    },
    {
      question: "How is price predicted?",
      answer: "The AI uses historical price data, seasonal trends, demand forecasting, and real-time market analysis to predict price movements for the next 2 days. This helps users make informed decisions about when to buy or sell agricultural produce."
    },
    {
      question: "How delivery works?",
      answer: "After placing an order, our logistics partners coordinate pickup from the farmer's location and delivery to your specified address. We provide real-time tracking and estimated delivery times. Delivery fees are calculated based on distance and urgency."
    },
    {
      question: "What is the refund policy?",
      answer: "Orders can be cancelled within 30 minutes of placement for a full refund. For quality issues upon delivery, contact our support team within 2 hours for resolution. All payments are processed securely through our payment partners."
    },
    {
      question: "How does the platform fee work?",
      answer: "We charge a 5% platform commission on successful transactions. This fee supports AI development, logistics coordination, and platform maintenance to ensure reliable service for all users."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you'll receive real-time updates on pickup, transit, and delivery status. Our dashboard shows estimated delivery times and driver information for complete transparency."
    }
  ];

  return (
    <section className="py-20 border-t border-border/10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold font-display text-text-primary mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-text-secondary">Everything you need to know about the U-FIN ecosystem.</p>
        </motion.div>
        
        <div className="glass-card p-4 md:p-8 bg-surface/30">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
