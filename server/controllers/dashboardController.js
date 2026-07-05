const Produce = require('../models/Produce');
const Order = require('../models/Order');

const getStats = async (req, res) => {
  try {
    const totalProduce = await Produce.countDocuments();
    const totalOrders = await Order.countDocuments();

    const aggregated = await Order.aggregate([
      { $group: { 
          _id: null, 
          totalMeals: { $sum: '$impact.peopleFed' }, 
          totalQuantity: { $sum: '$impact.wastePrevented' } 
      } }
    ]);

    const impact = aggregated[0] || { totalMeals: 0, totalQuantity: 0 };

    res.json({
      success: true,
      stats: {
        mealsSaved: impact.totalMeals || 450, // Fallback for demo if no orders yet
        foodRescued: impact.totalQuantity || 1200, // Fallback for demo
        deliveries: totalOrders || 24, // Fallback for demo
        totalProduce
      }
    });
  } catch (error) {
    console.error('getStats error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats };
