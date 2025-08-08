import React, { useState, useEffect } from "react";
import { FaFootballBall, FaBasketballBall, FaVolleyballBall, FaBaseballBall, FaStar, FaRegClock, FaChartLine, FaBitcoin, FaDollarSign } from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { GiTennisBall } from "react-icons/gi";
import { IoIosRefresh } from "react-icons/io";
import Header from "../customer/Header";

// Primary Categories
const primaryCategories = [
  { name: "Sports", key: "sports", icon: <FaFootballBall /> },
  { name: "Trading", key: "trading", icon: <FaChartLine /> }
];

// Sport Subcategories
const sportCategories = [
  { name: "Football", icon: <IoMdFootball size={20} />, key: "football" },
  { name: "Basketball", icon: <FaBasketballBall size={18} />, key: "basketball" },
  { name: "Tennis", icon: <GiTennisBall size={18} />, key: "tennis" }
];

// Trading Subcategories
const tradingCategories = [
  { name: "Forex", icon: <FaDollarSign size={18} />, key: "forex" },
  { name: "Crypto", icon: <FaBitcoin size={18} />, key: "crypto" }
];

// Mock live sports data
const mockLiveSports = {
  football: [
    { id: 1, homeTeam: "Chelsea", homeScore: 2, awayTeam: "Arsenal", awayScore: 1, minute: "67'", status: "Live", league: "Premier League" },
    { id: 2, homeTeam: "Barcelona", homeScore: 0, awayTeam: "Real Madrid", awayScore: 0, minute: "23'", status: "Live", league: "La Liga" }
  ],
  basketball: [
    { id: 3, homeTeam: "Lakers", homeScore: 98, awayTeam: "Warriors", awayScore: 102, quarter: "Q4", time: "4:32", status: "Live", league: "NBA" }
  ],
  tennis: [
    { id: 4, player1: "Nadal", player1Sets: 1, player2: "Djokovic", player2Sets: 1, currentSet: "3-3", status: "Live", tournament: "Wimbledon" }
  ]
};

// Mock live trading data
const mockLiveTrading = {
  forex: [
    { id: 1, pair: "EUR/USD", price: 1.0857, change: +0.12, high: 1.0872, low: 1.0821 },
    { id: 2, pair: "GBP/USD", price: 1.2653, change: -0.24, high: 1.2689, low: 1.2623 }
  ],
  crypto: [
    { id: 3, coin: "BTC/USDT", price: 63452.78, change: +2.34, high: 63890.12, low: 62845.23 },
    { id: 4, coin: "ETH/USDT", price: 3421.56, change: +1.87, high: 3456.78, low: 3389.45 }
  ]
};

const LivePage = () => {
  const [activePrimary, setActivePrimary] = useState("trading");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Simulate live data refresh
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderLiveSport = (match) => {
    if (activeSport === "football" || activeSport === "basketball") {
      return (
        <div key={match.id} className="bg-gradient-to-r from-[#0f1f1a] to-[#162821] p-4 rounded-xl shadow-lg border border-[#2a3a34] mb-4">
          <div className="text-xs text-[#18ffc8] uppercase font-medium mb-2">{match.league}</div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 flex items-center justify-end">
              <span className="text-right mr-2">{match.homeTeam}</span>
              <span className="bg-[#0f1f1a] px-3 py-1 rounded font-bold text-lg">
                {match.homeScore}
              </span>
            </div>
            
            <div className="px-4 flex flex-col items-center">
              <span className="text-xs text-gray-400">{match.status}</span>
              <span className="text-sm font-bold">
                {activeSport === "football" ? match.minute : match.time}
              </span>
            </div>
            
            <div className="flex-1 flex items-center">
              <span className="bg-[#0f1f1a] px-3 py-1 rounded font-bold text-lg">
                {match.awayScore}
              </span>
              <span className="text-left ml-2">{match.awayTeam}</span>
            </div>
          </div>
        </div>
      );
    } else if (activeSport === "tennis") {
      return (
        <div key={match.id} className="bg-gradient-to-r from-[#0f1f1a] to-[#162821] p-4 rounded-xl shadow-lg border border-[#2a3a34] mb-4">
          <div className="text-xs text-[#18ffc8] uppercase font-medium mb-2">{match.tournament}</div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-right flex-1 pr-4">
              <div className="font-medium">{match.player1}</div>
              <div className="text-2xl font-bold">{match.player1Sets}</div>
            </div>
            
            <div className="flex flex-col items-center px-2">
              <span className="text-xs text-gray-400">{match.status}</span>
              <span className="text-sm font-bold">{match.currentSet}</span>
            </div>
            
            <div className="text-left flex-1 pl-4">
              <div className="font-medium">{match.player2}</div>
              <div className="text-2xl font-bold">{match.player2Sets}</div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderLiveTrading = (item) => {
    const isPositive = item.change >= 0;
    
    return (
      <div key={item.id} className="bg-gradient-to-r from-[#0f1f1a] to-[#162821] p-4 rounded-xl shadow-lg border border-[#2a3a34] mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold text-lg">
            {activeTrading === "forex" ? item.pair : item.coin}
          </div>
          <div className={`text-xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {activeTrading === "forex" ? item.price.toFixed(4) : item.price.toFixed(2)}
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-400 mr-2">Change:</span>
            <span className={isPositive ? "text-green-400" : "text-red-400"}>
              {isPositive ? "+" : ""}{item.change.toFixed(2)}%
            </span>
          </div>
          
          <div>
            <span className="text-gray-400 mr-2">Range:</span>
            <span>
              {activeTrading === "forex" ? 
                `${item.high.toFixed(4)} / ${item.low.toFixed(4)}` : 
                `${item.high.toFixed(2)} / ${item.low.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0a120e] min-h-screen text-white px-4 py-6 pb-20">
      <Header/>

      {/* Primary Category Selection */}
      {/* <div className="flex border-b border-[#2a3a34] mb-4">
        {primaryCategories.map(category => (
          <button
            key={category.key}
            onClick={() => setActivePrimary(category.key)}
            className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${
              activePrimary === category.key 
                ? "text-[#18ffc8] border-b-2 border-[#18ffc8]" 
                : "text-gray-400"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div> */}

      {/* Secondary Category Selection */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 mt-2">
        {activePrimary === "sports" ? (
          sportCategories.map(category => (
            <button
              key={category.key}
              onClick={() => setActiveSport(category.key)}
              className={`flex flex-col items-center min-w-[70px] px-3 py-2 rounded-xl ${
                activeSport === category.key
                  ? "bg-[#855391] text-white shadow-lg"
                  : "bg-[#162821] text-white"
              }`}
            >
              {category.icon}
              <span className="text-xs mt-1">{category.name}</span>
            </button>
          ))
        ) : (
          tradingCategories.map(category => (
            <button
              key={category.key}
              onClick={() => setActiveTrading(category.key)}
              className={`flex flex-col items-center min-w-[70px] px-3 py-2 rounded-xl ${
                activeTrading === category.key
                  ? "bg-[#855391] text-white shadow-lg"
                  : "bg-[#162821] text-white"
              }`}
            >
              {category.icon}
              <span className="text-xs mt-1">{category.name}</span>
            </button>
          ))
        )}
      </div>

      {/* Live Content */}
      <div className="space-y-4">
        {activePrimary === "sports" ? (
          <>
            <h2 className="text-lg font-bold flex items-center">
              {activeSport === "football" && <IoMdFootball className="mr-2" />}
              {activeSport === "basketball" && <FaBasketballBall className="mr-2" />}
              {activeSport === "tennis" && <GiTennisBall className="mr-2" />}
              Live {activeSport} Scores
            </h2>
            
            {mockLiveSports[activeSport]?.length > 0 ? (
              mockLiveSports[activeSport].map(match => renderLiveSport(match))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No live {activeSport} matches currently
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold flex items-center">
              {activeTrading === "forex" ? (
                <FaDollarSign className="mr-2" />
              ) : (
                <FaBitcoin className="mr-2" />
              )}
              Live {activeTrading} Prices
            </h2>
            
            {mockLiveTrading[activeTrading]?.length > 0 ? (
              mockLiveTrading[activeTrading].map(item => renderLiveTrading(item))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No {activeTrading} data available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LivePage;