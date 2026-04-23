import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { getCandlestickData } from '../api/polygon-api';

const StockChart = ({ symbol }) => {
  const [series, setSeries] = useState([{ data: [] }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        const data = await getCandlestickData(symbol);
        if (data && !data.error) {
          setSeries([{ data }]);
        }
      } catch (err) {
        console.error("Chart Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [symbol]);

  const options = {
    chart: {
      type: 'candlestick',
      background: 'transparent',
      toolbar: { show: false },
    },
    theme: { mode: 'dark' },
    xaxis: { 
      type: 'datetime',
      labels: { style: { colors: '#888' } }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { 
        style: { colors: '#888' },
        formatter: (val) => `$${val.toFixed(2)}`
      }
    },
    grid: { borderColor: '#333' },
    plotOptions: {
      candlestick: {
        colors: {
          positive: '#10b981',
          negative: '#ef4444'
        }
      }
    }
  };

  if (loading) return <div className="loading-state">Syncing Market Data...</div>;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Chart 
        options={options} 
        series={series} 
        type="candlestick" 
        height="100%" 
      />
    </div>
  );
};

export default StockChart;