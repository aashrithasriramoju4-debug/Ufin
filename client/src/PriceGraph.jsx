import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceGraph = ({ history, predictedPrice }) => {
  const labels = [...history.map(h => h.date), 'Tomorrow', 'Day After'];
  const pastPrices = history.map(h => h.price);
  const dataPoints = [...pastPrices, predictedPrice, predictedPrice + (Math.random() * 2)];

  const data = {
    labels,
    datasets: [
      {
        label: 'Price (₹)',
        data: dataPoints,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#6366f1',
        tension: 0.4,
        pointRadius: 4,
        segment: {
          borderDash: (ctx) => ctx.p0DataIndex >= history.length - 1 ? [6, 6] : undefined,
          borderColor: (ctx) => ctx.p0DataIndex >= history.length - 1 ? '#22c55e' : '#6366f1',
        }
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
    },
    plugins: {
      legend: { display: false },
    }
  };

  return <Line data={data} options={options} />;
};

export default PriceGraph;
