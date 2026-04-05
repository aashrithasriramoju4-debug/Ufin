const Produce = require('../models/Produce');

const haversineDistance = (coord1, coord2) => {
  const toRad = deg => (deg * Math.PI) / 180;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findMatches = async ({ type, location, maxDistance }) => {
  const nearby = await Produce.find({
    status: 'AVAILABLE',
    quality: type,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: location },
        $maxDistance: maxDistance * 1000
      }
    }
  }).limit(20);

  return nearby;
};

module.exports = { haversineDistance, findMatches };
