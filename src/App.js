// App.js
import React, { useState } from 'react';
import Ch from './components/chart2';

const App = () => {
  const [newsCount, setNewsCount] = useState(0);
  const [lastWeekStock, setLastWeekStock] = useState(0);
  const [lastMonthStock, setLastMonthStock] = useState(0);

  return (
    <div>
      <h1>Apple News and Stock Price Tracker</h1>
      <p className="pSub">
        <span className="sub">News Count: <strong>{newsCount}</strong></span>
        <span className="sub">Last Week: <strong>${lastWeekStock.toFixed(2)}</strong></span>
        <span className="sub">Last Month: <strong>${lastMonthStock.toFixed(2)}</strong></span>
      </p>
      <Ch
        onValuesUpdate={(news, lastWeek, lastMonth) => {
          setNewsCount(news);
          setLastWeekStock(lastWeek);
          setLastMonthStock(lastMonth);
        }}
      />
    </div>
  );
};

export default App;
