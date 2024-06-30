import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './Histogram.css'; // Import the CSS file for styling

interface HistogramProps {
  data: number[]; // Array of numbers for the histogram
  title: string; // Title for the chart headline
  showHistogram: boolean; // Boolean to show/hide the histogram
  onClose: () => void; // Function to handle closing the modal
}

const Histogram: React.FC<HistogramProps> = ({ data, title, showHistogram, onClose }) => {
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"bar"> | null>(null);

  // Number of bins for the histogram
  const binCount = 20;

  const getBinnedData = (data: number[], binCount: number) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / binCount;
    const bins = Array(binCount).fill(0);
  
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex] += 1;
    });
  
    const labels = bins.map((_, i) => `${(min + i * binSize).toFixed(2)}-${(min + (i + 1) * binSize).toFixed(2)}`);
    return { labels, values: bins };
  };
  
  // Handle closing the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHistogram && chartContainer.current && !chartContainer.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [showHistogram, onClose]);

  useEffect(() => {
    if (showHistogram && chartContainer.current) {
      const ctx = chartContainer.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const { labels, values } = getBinnedData(data, binCount);

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Frequency',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false, // Allow for custom sizing
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 30, // Increased bottom padding for x-axis labels
            },
          },
          plugins: {
            // Remove title configuration from Chart.js
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
                text: 'Range'
              },
              ticks: {
                autoSkip: false, // Prevent auto skipping of labels
                maxRotation: 45, // Allow labels to rotate up to 45 degrees
                minRotation: 0
              }
            }
          },
          barPercentage: 1, // Set the bar width to 100% of the available space
          categoryPercentage: 1 // Set the category width to 100% of the available space
        }
      });
    }
  }, [data, showHistogram]);

  return (
    <div className={`modal ${showHistogram ? 'show' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Keep the larger title here */}
        <h2 className="chartTitle">{title}</h2>
        <canvas ref={chartContainer} width="500" height="400"></canvas>
      </div>
    </div>
  );
};

export default Histogram;
