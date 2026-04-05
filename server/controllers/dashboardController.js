const Produce = require('../models/Produce');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const getStats = async (req, res) => {
  try {
    const totalProduce = await Produce.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const aggregated = await Transaction.aggregate([
      { $group: { _id: null, totalMeals: { $sum: '$mealsSaved' }, totalCO2: { $sum: '$co2SavedKg' }, totalQuantity: { $sum: '$quantity' } } }
    ]);

    const leaderBoard = await User.find().sort({ impactPoints: -1 }).limit(10).select('name role impactPoints');

    const impact = aggregated[0] || { totalMeals: 0, totalCO2: 0, totalQuantity: 0 };

    res.json({
      totalProduce,
      totalTransactions,
      totalMealsSaved: impact.totalMeals,
      totalCO2SavedKg: impact.totalCO2,
      totalQuantityMoved: impact.totalQuantity,
      leaderBoard
    });
  } catch (error) {
    console.error('getStats error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats };
