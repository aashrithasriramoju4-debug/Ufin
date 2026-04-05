const classifyProduce = ({ freshness, damage }) => {
  if (freshness > 7 && damage < 3) return 'SELL';
  if (freshness >= 4 && freshness <= 7) return 'DONATE';
  return 'PROCESS';
};

const estimateImpact = ({ quantity, type }) => {
  const mealsPerKg = 3;
  const co2Factor = 0.5;
  const mealsSaved = quantity * mealsPerKg;
  const co2SavedKg = quantity * co2Factor;

  return { mealsSaved, co2SavedKg };
};

module.exports = { classifyProduce, estimateImpact };
