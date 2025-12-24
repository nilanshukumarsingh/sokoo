import { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Register ChartJS components
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

const RevenueChart = ({ dataPoints = [] }) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Prepare data for Chart.js
  useEffect(() => {
    // If no data is provided, use some dummy last 7 days for visualization if needed,
    // or just empty. The prompt says "Accept a prop like dataPoints".
    // We'll trust the prop is passed or handle empty.
    
    // Default to last 7 days if empty for demo purposes or just show empty? 
    // The user said "Accept a prop... e.g. last 12 days or months". 
    // Let's rely on dataPoints or simple fallback to avoid crash.
    
    const labels = dataPoints.length > 0 
      ? dataPoints.map(d => d.label) 
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
    const data = dataPoints.length > 0 
      ? dataPoints.map(d => d.revenue) 
      : [0, 0, 0, 0, 0, 0, 0];

    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          fill: true,
          borderColor: '#10b981', // Emerald 500
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
            return gradient;
          },
          tension: 0.4, // Smooth curve
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10b981',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    });
  }, [dataPoints]);

  // Animation effect
  useGSAP(() => {
    // We can animate the container or specific elements. 
    // Chart.js has its own animation (duration: 800ms requested).
    // The user asked: "Animation: When the component mounts... animate the line... Keep animation duration ~800ms"
    // Chart.js handles the line animation via 'animation' option.
    // We can just animate the container fade-in here using GSAP if desired, 
    // but the requirement is "animate the line...". Chart.js does this by default on mount.
    // We will ensure the config enables it.
    
    // However, we can use GSAP to fade in the whole chart container nicely.
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart', // Smooth easing
    },
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look as per "Revenue" only
      },
      tooltip: {
        backgroundColor: '#1f2937', // Dark gray
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Revenue: $${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // Subtle grid
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // Gray 400
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          callback: (value) => `$${value}`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div ref={containerRef} style={{
      width: '100%',
      height: '300px',
      background: 'var(--bg-alt)',
      padding: '1.5rem',
      borderRadius: '0.5rem', // Consistent with other cards if they had radius, mostly square in current code
      marginTop: '2rem',
      marginBottom: '2rem',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '1rem',
        color: 'var(--fg)',
      }}>
        Revenue Overview
      </h3>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
         {/* Subtract header height roughly */}
        <div style={{ height: 'calc(100% - 2rem)' }}>
            <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
