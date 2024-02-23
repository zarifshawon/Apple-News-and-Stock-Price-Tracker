import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import {  LinearScale, PointElement, Tooltip, Legend, TimeScale} from "chart.js";
import 'chartjs-adapter-moment';



const Ch = ({ onValuesUpdate }) => {
  const [newsData, setNewsData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  const memoizedOnValuesUpdate = useCallback(onValuesUpdate, [onValuesUpdate]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch and set news data
        const newsResponse = await fetch('./data2023.json');
        const newsData = await newsResponse.json();
        const formattedNewsData = newsData.hits.hits.map((newsEntry) => {
          const formattedDate = moment(newsEntry._source.DateTime, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD HH:mm:ss']).format('YYYY-MM-DD');
          console.log('Formatted News Date:', formattedDate);
          return {
            ...newsEntry,
            _source: {
              ...newsEntry._source,
              DateTime: formattedDate,
            },
          };
        });
        setNewsData(formattedNewsData);

        // Fetch and set stock data
        const stockResponse = await fetch('./AAPL.csv');
        const stockTextData = await stockResponse.text();
        const stockArray = stockTextData.split('\n').slice(1); // Skip header
        const formattedStockData = stockArray.map((row) => {
          const values = row.split(',');
          const parsedDate = moment(values[0]).format('YYYY-MM-DD');
          console.log('Parsed Stock Date:', parsedDate);
          return {
            date: parsedDate,
            stockPrice: parseFloat(values[4]),
          };
        });
        setStockData(formattedStockData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && newsData.length > 0 && stockData.length > 0) {
      const dateToNewsCount = {};

      // Group newsData by date and count occurrences
      newsData.forEach((news) => {
        const date = moment(news._source.DateTime).format('YYYY-MM-DD');
        dateToNewsCount[date] = (dateToNewsCount[date] || 0) + 1;
      });

      // Create arrays for labels, stockPrices, and newsCounts
      const labels = stockData.map((entry) => entry.date);
      const stockPrices = stockData.map((entry) => entry.stockPrice);
      const newsCounts = labels.map((date) => dateToNewsCount[date] || 0);
      const lastMonthStockPrices = stockPrices.slice(-30); // Assuming daily data
      const sumLastMonthStockPrice = lastMonthStockPrices.reduce((sum, price) => sum + price, 0);

      const lastWeekStockPrices = stockPrices.slice(-7);
      const sumLastWeekStockPrice = lastWeekStockPrices.reduce((sum, price) => sum + price, 0);


      console.log('Labels:', labels);
      console.log('Stock Prices:', stockPrices);
      console.log('News Counts:', newsCounts);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Stock Price',
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            data: stockPrices,
            yAxisID: 'stock'
            
          },
          {
            label: 'News Count',
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            data: newsCounts,
            yAxisID: 'news'
          },
        ],
        additionalData: {
          sumLastMonthStockPrice,
          sumLastWeekStockPrice,
          
          
        },
      });
       // Update parent component values
       // Update parent component values using the memoized function
      memoizedOnValuesUpdate(newsCounts[newsCounts.length - 1], sumLastWeekStockPrice, sumLastMonthStockPrice);
       

    }}, [loading, newsData, stockData, memoizedOnValuesUpdate]);
  
    useEffect(() => {
        Chart.register(LinearScale, PointElement, Tooltip, Legend, TimeScale);
      }, []); 
  
      const options = {
        responsive: true,
        maintainAspectRatio: true,
        width: 600,
        height:600,
      
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                quarter: 'MMM YYYY',
              },
            },
            title: {
              display: false,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: true,
            position: 'left',
            title: {
              display: true,
              text: 'Stock Price(in $)',
            },
          },
          news: {
            beginAtZero: true,
            position: 'right',
            title: {
              display: true,
              text: 'News Count',
            },
          },
        },
        plugins: {
          title: {
            display: false,
            text: 'Apple News and Stock Chart',
            font: {
              size: 18,
              family: 'Arial',
              weight: 'bold',
            },
          },
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: ${value}`;
              },
              afterLabel: (context) => {
                if (context.datasetIndex === 0 && chartData.additionalData) {
                  // Display additional data in the tooltip for Stock Price dataset
                  return [
                    `Last Month Stock Price: $${chartData.additionalData.sumLastMonthStockPrice.toFixed(2)}`,
                    `Last Week Stock Price: $${chartData.additionalData.sumLastWeekStockPrice.toFixed(2)}`,
                  ];
                }
                return [];
              },
            },
          },
        },
      };
    
      return (
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              
              {chartData.labels && chartData.labels.length > 0 && chartData.datasets && chartData.datasets.length > 0 ? (
                <Line data={chartData} options={options} />
              ) : (
                <p>No data available for chart.</p>
              )}
            </>
          )}
        </div>
      );
    };
    
    export default Ch;
    