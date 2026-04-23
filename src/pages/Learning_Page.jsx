import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceArea } from 'recharts';
import '../css/learning_page.css';

// --- EDUCATIONAL TOOLTIP CONTENT ---
const infoData = {
  GENERAL: {
    title: "About this Sandbox",
    content: (
      <>
        <p>Aston University is organising this study and acting as data controller. This tool is designed to help users visualise the key concepts of risk management. It is not financial advice.</p>
        <p>Research data will be used only for the purposes of the study. This study was given a favourable ethical opinion by the Research Ethics Committee.</p>
        <p>If you have any concerns or wish to make a complaint about how the study is being conducted, contact the Research Integrity Office at <a href="mailto:research_governance@aston.ac.uk">research_governance@aston.ac.uk</a>.</p>
      </>
    )
  },
  TIMEFRAME: {
    title: "Chart Timeframes",
    content: "Timeframes change the granularity of the market data. 1m shows every minute of price action, while 5m and 30m group data to help you identify broader market trends and patterns."
  },
  START_TIME: {
    title: "Start Minute (Entry)",
    content: "This is the time at which your trade will execute. Prices are anchored to the market value at this minute, and it becomes the foundation of all profit/loss calculations."
  },
  END_TIME: {
    title: "End Minute (Exit)",
    content: "This is the precise minute when the simulation automatically closes your position. If price action has not triggered a Stop Loss or Take Profit, the trade terminates here."
  },
  ORDER_SIDE: {
    title: "Order Side",
    content: "Select your market position. A 'BUY' (Long) order expects price to rise, making money on the upside. A 'SELL' (Short) order expects price to fall, making money on the downside."
  },
  LEVERAGE: {
    title: "Leverage",
    content: "This feature allows you to control a larger market position with less initial capital. It multiplies your potential profit or loss, but also significantly increases the risk of being liquidated."
  },
  TP: {
    title: "Take Profit (TP) Level",
    content: "An order to close a profitable trade at a specific price to secure your gains. Once the market price hits this level, you win the trade."
  },
  BE: {
    title: "Break Even (BE) Level",
    content: "This is an adjustable line you use to protect your capital. In this sandbox, you are learning to move this to a level where you no longer lose money if the market turns against you."
  },
  SL: {
    title: "Stop Loss (SL) Level",
    content: "An essential risk management tool. This closes your losing trade at a pre-set level to prevent further losses. It defines your total trade risk from the start."
  }
};

function LearningPage({ symbol = "BTC/USD" }) {
  const [timeframe, setTimeframe] = useState('1m');

  // --- 1. MASTER DATA (1-Minute Source of Truth) ---
  const masterData = [
    { time: '10:00', price: 100.00 }, { time: '10:01', price: 115.20 }, { time: '10:02', price: 130.80 },
    { time: '10:03', price: 155.50 }, { time: '10:04', price: 180.10 }, { time: '10:05', price: 210.90 },
    { time: '10:06', price: 225.00 }, { time: '10:07', price: 240.60 }, { time: '10:08', price: 250.20 },
    { time: '10:09', price: 245.40 }, { time: '10:10', price: 230.50 }, { time: '10:11', price: 210.80 },
    { time: '10:12', price: 190.20 }, { time: '10:13', price: 175.50 }, { time: '10:14', price: 160.10 },
    { time: '10:15', price: 140.00 }, { time: '10:16', price: 130.30 }, { time: '10:17', price: 115.40 },
    { time: '10:18', price: 100.60 }, { time: '10:19', price: 90.50 },  { time: '10:20', price: 75.00 },
    { time: '10:21', price: 65.20 },  { time: '10:22', price: 55.10 },  { time: '10:23', price: 52.50 },
    { time: '10:24', price: 51.40 },  { time: '10:25', price: 50.00 },  { time: '10:26', price: 55.20 },
    { time: '10:27', price: 58.80 },  { time: '10:28', price: 65.10 },  { time: '10:29', price: 72.30 },
    { time: '10:30', price: 80.00 },  { time: '10:31', price: 85.50 },  { time: '10:32', price: 90.40 },
    { time: '10:33', price: 95.80 },  { time: '10:34', price: 102.10 }, { time: '10:35', price: 110.20 },
    { time: '10:36', price: 115.70 }, { time: '10:37', price: 125.00 }, { time: '10:38', price: 130.40 },
    { time: '10:39', price: 140.50 }, { time: '10:40', price: 155.20 }, { time: '10:41', price: 165.80 },
    { time: '10:42', price: 175.40 }, { time: '10:43', price: 185.60 }, { time: '10:44', price: 195.00 },
    { time: '10:45', price: 210.20 }, { time: '10:46', price: 215.80 }, { time: '10:47', price: 225.10 },
    { time: '10:48', price: 235.50 }, { time: '10:49', price: 245.90 }, { time: '10:50', price: 250.00 },
    { time: '10:51', price: 240.30 }, { time: '10:52', price: 230.80 }, { time: '10:53', price: 220.50 },
    { time: '10:54', price: 210.00 }, { time: '10:55', price: 190.20 }, { time: '10:56', price: 175.60 },
    { time: '10:57', price: 160.10 }, { time: '10:58', price: 150.40 }, { time: '10:59', price: 145.00 },
    { time: '11:00', price: 140.50 }
  ];

  // --- 2. CORE STATES ---
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(15);
  const [orderType, setOrderType] = useState('BUY');
  const [leverage, setLeverage] = useState(1);
  const [stopLoss, setStopLoss] = useState(50);
  const [takeProfit, setTakeProfit] = useState(250);
  const [breakEven, setBreakEven] = useState(100);
  const [detailsView, setDetailsView] = useState({ active: false, type: 'GENERAL' });

  const entryPrice = masterData[startIndex]?.price || 100;

  // --- 3. FLIP & BOUNDARY SYNC ---
  useEffect(() => {
    const currentTPDist = Math.abs(takeProfit - breakEven);
    const currentSLDist = Math.abs(stopLoss - breakEven);

    if (orderType === 'BUY') {
      setTakeProfit(breakEven + currentTPDist);
      setStopLoss(breakEven - currentSLDist);
    } else {
      setTakeProfit(breakEven - currentTPDist);
      setStopLoss(breakEven + currentSLDist);
    }
  }, [orderType]);

  useEffect(() => {
    const minBound = Math.min(takeProfit, stopLoss) + 5;
    const maxBound = Math.max(takeProfit, stopLoss) - 5;
    if (breakEven < minBound) setBreakEven(minBound);
    if (breakEven > maxBound) setBreakEven(maxBound);
  }, [takeProfit, stopLoss]);

  // --- 4. DATA MEMOIZATION ---
  const chartData = useMemo(() => {
    return masterData.map((d, index) => ({ ...d, index })).filter((d, i) => {
      if (timeframe === '1m') return true;
      if (timeframe === '5m') return i % 5 === 0;
      if (timeframe === '30m') return i % 30 === 0;
      return true;
    });
  }, [timeframe]);

  const simulationResult = useMemo(() => {
    const windowData = masterData.slice(startIndex, endIndex + 1);
    if (windowData.length < 2) return { profit: 0, status: 'IDLE' };
    let finalProfit = 0;
    for (let point of windowData) {
      const currentPrice = point.price;
      const priceChangePct = (currentPrice - entryPrice) / entryPrice;
      let currentPnL = (orderType === 'BUY' ? priceChangePct : -priceChangePct) * leverage * 100;
      if (currentPnL <= -100) return { profit: -100, status: 'LIQUIDATED' };
      if (orderType === 'BUY') {
        if (currentPrice <= stopLoss) return { profit: ((stopLoss - entryPrice) / entryPrice) * leverage * 100, status: 'STOPPED OUT' };
        if (currentPrice >= takeProfit) return { profit: ((takeProfit - entryPrice) / entryPrice) * leverage * 100, status: 'PROFIT HIT' };
      } else {
        if (currentPrice >= stopLoss) return { profit: ((entryPrice - stopLoss) / entryPrice) * leverage * 100, status: 'STOPPED OUT' };
        if (currentPrice <= takeProfit) return { profit: ((entryPrice - takeProfit) / entryPrice) * leverage * 100, status: 'PROFIT HIT' };
      }
      finalProfit = currentPnL;
    }
    return { profit: finalProfit, status: 'COMPLETED' };
  }, [startIndex, endIndex, orderType, leverage, stopLoss, takeProfit, entryPrice]);

  return (
    <div className="page-wrapper">
      <div className="glass-pill">
        <div className="learning-page-flex-content">
          
          {/* VISUAL CHART AREA */}
          <div className="learning-page-graph-area">
            <div className="ticker-header-flex">
              <h3 className="learning-page-ticker">{symbol} Sandbox</h3>
              <span className="info-icon main-info" onClick={() => setDetailsView({ active: true, type: 'GENERAL' })}>i</span>
            </div>

            <div className="learning-page-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ left: 40, right: 40, top: 40, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="index" type="number" domain={[0, 60]} hide />
                  <YAxis domain={[40, 260]} orientation="right" stroke="#888" tick={{ fill: '#ffffff', fontSize: 10 }} />
                  
                  {/* RISK/REWARD VISUAL AREAS */}
                  <ReferenceArea x1={startIndex} x2={endIndex} y1={breakEven} y2={takeProfit} fill="#00ff00" fillOpacity={0.12} />
                  <ReferenceArea x1={startIndex} x2={endIndex} y1={stopLoss} y2={breakEven} fill="#ff0000" fillOpacity={0.12} />
                  
                  {/* ADJUSTABLE INTERFACE LINES */}
                  <ReferenceArea x1={startIndex} x2={endIndex} y1={takeProfit - 0.5} y2={takeProfit + 0.5} fill="#00ff00" />
                  <ReferenceArea x1={startIndex} x2={endIndex} y1={stopLoss - 0.5} y2={stopLoss + 0.5} fill="#ff4d4d" />
                  <ReferenceArea x1={startIndex} x2={endIndex} y1={breakEven - 0.6} y2={breakEven + 0.6} fill="#ffffff" />
                  <ReferenceArea x1={startIndex - 0.15} x2={startIndex + 0.15} y1={Math.min(stopLoss, takeProfit)} y2={Math.max(stopLoss, takeProfit)} fill="#ffffff" />
                  <ReferenceArea x1={endIndex - 0.15} x2={endIndex + 0.15} y1={Math.min(stopLoss, takeProfit)} y2={Math.max(stopLoss, takeProfit)} fill="#ffffff" />

                  <Line type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={3} dot={false} activeDot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>

              <div className="timeframe-selector-container">
                <span className="info-icon timeframe-info" onClick={() => setDetailsView({ active: true, type: 'TIMEFRAME' })}>i</span>
                <button className={timeframe === '1m' ? 'active' : ''} onClick={() => setTimeframe('1m')}>1m</button>
                <button className={timeframe === '5m' ? 'active' : ''} onClick={() => setTimeframe('5m')}>5m</button>
                <button className={timeframe === '30m' ? 'active' : ''} onClick={() => setTimeframe('30m')}>30m</button>
              </div>
            </div>
          </div>

          {/* EDUCATIONAL CONTROLS & FEEDBACK */}
          <div className="learning-page-stats-area">
            {detailsView.active ? (
              <div className="learning-page-details-box">
                <div className="details-header">
                  <h3 className="details-title">{infoData[detailsView.type].title}</h3>
                  <button className="close-details-btn" onClick={() => setDetailsView({ active: false, type: 'GENERAL' })}>&times;</button>
                </div>
                <div className="details-content">{infoData[detailsView.type].content}</div>
              </div>
            ) : (
              <div className="learning-page-control-box">
                <div className="learning-page-control-column">
                  <div className="learning-page-option">
                    <label className="label-with-icon">
                      Start Minute: {masterData[startIndex]?.time}
                      <span className="info-icon" onClick={() => setDetailsView({ active: true, type: 'START_TIME' })}>i</span>
                    </label>
                    <input type="range" min="0" max="59" value={startIndex} onChange={(e) => setStartIndex(parseInt(e.target.value))} className="learning-slider" />
                  </div>
                  <div className="learning-page-option">
                    <label className="label-with-icon">
                      End Minute: {masterData[endIndex]?.time}
                      <span className="info-icon" onClick={() => setDetailsView({ active: true, type: 'END_TIME' })}>i</span>
                    </label>
                    <input type="range" min={startIndex + 1} max="60" value={endIndex} onChange={(e) => setEndIndex(parseInt(e.target.value))} className="learning-slider" />
                  </div>
                </div>

                <div className="learning-page-control-row">
                  <div className="learning-page-option">
                    <label className="label-with-icon">
                      Order Side
                      <span className="info-icon" onClick={() => setDetailsView({ active: true, type: 'ORDER_SIDE' })}>i</span>
                    </label>
                    <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="learning-input">
                      <option value="BUY">BUY (Long)</option>
                      <option value="SELL">SELL (Short)</option>
                    </select>
                  </div>
                  <div className="learning-page-option">
                     <label className="label-with-icon">
                       Leverage: {leverage}x
                       <span className="info-icon" onClick={() => setDetailsView({ active: true, type: 'LEVERAGE' })}>i</span>
                     </label>
                     <input type="range" min="1" max="50" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="learning-slider" />
                  </div>
                </div>

                <div className="learning-vertical-slider-grid">
                  <div className="learning-vertical-option">
                    <label className="vertical-label label-with-icon">
                      TP Level <span className="info-icon small" onClick={() => setDetailsView({ active: true, type: 'TP' })}>i</span>
                    </label>
                    <input 
                      type="range" orient="vertical" 
                      min={orderType === 'BUY' ? breakEven + 5 : 40} 
                      max={orderType === 'BUY' ? 260 : breakEven - 5} 
                      value={takeProfit} 
                      onChange={(e) => setTakeProfit(parseInt(e.target.value))} 
                      className="learning-slider-vertical" 
                    />
                    <span className="slider-value-display">£{takeProfit}</span>
                  </div>
                  <div className="learning-vertical-option">
                    <label className="vertical-label label-with-icon">
                      BE Level <span className="info-icon small" onClick={() => setDetailsView({ active: true, type: 'BE' })}>i</span>
                    </label>
                    <input 
                      type="range" orient="vertical" 
                      min={Math.min(takeProfit, stopLoss) + 5} 
                      max={Math.max(takeProfit, stopLoss) - 5} 
                      value={breakEven} 
                      onChange={(e) => setBreakEven(parseInt(e.target.value))} 
                      className="learning-slider-vertical" 
                    />
                    <span className="slider-value-display">£{breakEven}</span>
                  </div>
                  <div className="learning-vertical-option">
                    <label className="vertical-label label-with-icon">
                      SL Level <span className="info-icon small" onClick={() => setDetailsView({ active: true, type: 'SL' })}>i</span>
                    </label>
                    <input 
                      type="range" orient="vertical" 
                      min={orderType === 'BUY' ? 40 : breakEven + 5} 
                      max={orderType === 'BUY' ? breakEven - 5 : 260} 
                      value={stopLoss} 
                      onChange={(e) => setStopLoss(parseInt(e.target.value))} 
                      className="learning-slider-vertical" 
                    />
                    <span className="slider-value-display">£{stopLoss}</span>
                  </div>
                </div>

                <div className={`learning-status-badge ${simulationResult.status.replace(' ', '-').toLowerCase()}`}>
                  {simulationResult.status}
                </div>

                <div className="learning-page-result">
                  <p>Simulated P/L</p>
                  <h2 className={`learning-profit-text ${simulationResult.profit >= 0 ? 'pos' : 'neg'}`}>
                    {simulationResult.profit >= 0 ? '+' : ''}{simulationResult.profit.toFixed(2)}%
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningPage;