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

  // Number of bins for the histogram
  const binCount = 20;

  // Function to bin the data into ranges and calculate frequencies
  const getBinnedData = (data: number[], binCount: number) => {
    // Determine the range of data
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / binCount;

    // Initialize bins and labels
    const bins = new Array(binCount).fill(0);
    const binLabels = new Array(binCount).fill('');

    // Count data points in each bin
    data.forEach(value => {
      // Determine the bin index for the value
      const binIndex = Math.floor((value - min) / binSize);
      // Ensure the value falls within the bin range
      const index = binIndex < binCount ? binIndex : binCount - 1;
      bins[index]++;
    });

    // Create labels for each bin
    for (let i = 0; i < binCount; i++) {
      binLabels[i] = `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`;
    }

    return { bins, binLabels };
  };

  useEffect(() => {
    if (showHistogram && chartContainer.current) {
      const ctx = chartContainer.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Bin the data into specified number of bins
      const { bins, binLabels } = getBinnedData(data, binCount);

      // Create the chart with binned data
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: binLabels, // Labels for bins
          datasets: [{
            label: 'Frequency',
            data: bins, // Frequency counts for each bin
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
                text: 'Value Range'
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
