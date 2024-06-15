import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface HistogramProps {
  data: number[]; // Array of numbers for the histogram
  title: string; // Title for the chart headline
  showHistogram: boolean; // Boolean to show/hide the histogram
}

const Histogram: React.FC<HistogramProps> = ({ data, title, showHistogram }) => {
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"bar"> | null>(null);
  const [chartVisible, setChartVisible] = useState(false); // Initially false

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chartContainer.current && !chartContainer.current.contains(event.target as Node)) {
        setChartVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (showHistogram && chartContainer.current) { // Assuming `showHistogram` is passed as a prop
      const ctx = chartContainer.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: data.length }, (_, i) => `Label ${i + 1}`), // Example labels
          datasets: [{
            label: 'Histogram',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 18
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Frequency'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Value'
              }
            }
          }
        }
      });
    } else {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    }
  }, [data, title, showHistogram]);

  return (
    <div>
      {showHistogram && (
        <div>
          <h3>{title}</h3>
          <canvas ref={chartContainer} width="400" height="400"></canvas>
        </div>
      )}
    </div>
  );
};

export default Histogram;
