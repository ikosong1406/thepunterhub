import React, { useState } from "react";
import { FaFootballBall, FaBasketballBall, FaVolleyballBall, FaBaseballBall, FaStar, FaRegClock, FaChartLine, FaBitcoin, FaDollarSign } from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { GiTennisBall } from "react-icons/gi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  { name: "Volleyball", icon: <FaVolleyballBall size={18} />, key: "volleyball" },
  { name: "Tennis", icon: <GiTennisBall size={18} />, key: "tennis" },
  { name: "Baseball", icon: <FaBaseballBall size={18} />, key: "baseball" }
];

// Trading Subcategories
const tradingCategories = [
  { name: "Forex", icon: <FaDollarSign size={18} />, key: "forex" },
  { name: "Crypto", icon: <FaBitcoin size={18} />, key: "crypto" }
];

// Sport Betting Tips Data
const sportBettingTips = [
  {
    id: 1,
    punterName: "Elite Predictor",
    avatar: "https://i.pravatar.cc/150?img=1",
    site: "Bet9ja",
    code: "3HG7D",
    startTime: "18:00",
    totalOdd: "5.60",
    confidence: 80,
    matches: [
      { teams: "Chelsea vs Arsenal", prediction: "Over 2.5 Goals", odd: "1.85" },
      { teams: "Barcelona Win", prediction: "Barcelona Win", odd: "2.10" },
      { teams: "BTTS - Nigeria vs Ghana", prediction: "Yes", odd: "1.45" }
    ],
    streak: 5,
    followers: 1243,
    sport: "football"
  },
  // More sport tips...
];

// Trading Signals Data
const tradingSignals = [
  {
    id: 101,
    traderName: "FX Master",
    avatar: "https://i.pravatar.cc/150?img=11",
    pair: "EUR/USD",
    direction: "BUY",
    entryPrice: "1.0850",
    takeProfit: "1.0920",
    stopLoss: "1.0800",
    timeFrame: "H4",
    confidence: 75,
    status: "Active",
    postedAt: "30 mins ago",
    result: null,
    type: "forex"
  },
  {
    id: 102,
    traderName: "Crypto Oracle",
    avatar: "https://i.pravatar.cc/150?img=9",
    pair: "BTC/USDT",
    direction: "SELL",
    entryPrice: "63500",
    takeProfit: "62000",
    stopLoss: "64500",
    timeFrame: "1D",
    confidence: 68,
    status: "Hit TP",
    postedAt: "2 hours ago",
    result: "+2.3%",
    type: "crypto"
  },
  // More trading signals...
];

const FeedPage = () => {
  const [activePrimary, setActivePrimary] = useState("sports");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");

  // Filter content based on selections
  const filteredSportTips = sportBettingTips.filter(
    tip => tip.sport === activeSport
  );

  const filteredTradingSignals = tradingSignals.filter(
    signal => signal.type === activeTrading
  );

  const renderSportTip = (tip) => (
    <div key={tip.id} className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-6">
      {/* Tipster Header */}
      <div className="flex items-center p-4 border-b border-[#2a3a34]">
        <img src={tip.avatar} alt={tip.punterName} className="w-12 h-12 rounded-full object-cover border-2 border-[#18ffc8]" />
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{tip.punterName}</h2>
            <span className="text-xs bg-[#f57cff] text-black px-2 py-1 rounded-full font-bold">
              {tip.streak}W streak
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
            <span>{tip.followers.toLocaleString()} followers</span>
            <span className="flex items-center">
              <FaChartLine className="mr-1" />
              {tip.confidence}% confidence
            </span>
          </div>
        </div>
      </div>
      
      {/* Matches */}
      <div className="p-4 space-y-3">
        {tip.matches.map((match, i) => (
          <div key={i} className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="font-medium text-sm mb-1">{match.teams}</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#18ffc8]">{match.prediction}</span>
              <span className="bg-[#18ffc8] text-black px-2 py-1 rounded font-bold">
                {match.odd}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="bg-[#0a120e] p-3 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-400">Starts at </span>
          <span className="font-bold">{tip.startTime}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs bg-[#1e332b] px-2 py-1 rounded mr-2">
            {tip.site}
          </span>
          <span className="text-xs bg-[#fea92a] text-black px-2 py-1 rounded font-bold">
            Code: {tip.code}
          </span>
        </div>
        <div className="text-lg font-bold bg-gradient-to-r from-[#18ffc8] to-[#0c9] text-transparent bg-clip-text">
          {tip.totalOdd}
        </div>
      </div>
    </div>
  );

  const renderTradingSignal = (signal) => (
    <div key={signal.id} className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-6">
      {/* Trader Header */}
      <div className="flex items-center p-4 border-b border-[#2a3a34]">
        <img src={signal.avatar} alt={signal.traderName} className="w-12 h-12 rounded-full object-cover border-2 border-[#18ffc8]" />
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{signal.traderName}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              signal.status === "Active" ? "bg-green-500" : 
              signal.status === "Hit TP" ? "bg-[#18ffc8]" : 
              "bg-red-500"
            } text-black`}>
              {signal.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
            <span>{signal.postedAt}</span>
            <span className="flex items-center">
              <FaChartLine className="mr-1" />
              {signal.confidence}% confidence
            </span>
          </div>
        </div>
      </div>
      
      {/* Signal Details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Pair</div>
            <div className="font-bold">{signal.pair}</div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Direction</div>
            <div className={`font-bold ${
              signal.direction === "BUY" ? "text-green-400" : "text-red-400"
            }`}>
              {signal.direction}
            </div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Entry</div>
            <div className="font-bold">{signal.entryPrice}</div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Time Frame</div>
            <div className="font-bold">{signal.timeFrame}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Take Profit</div>
            <div className="font-bold text-green-400">{signal.takeProfit}</div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
            <div className="font-bold text-red-400">{signal.stopLoss}</div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      {signal.result && (
        <div className="bg-[#0a120e] p-3 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-400">Result: </span>
            <span className={`font-bold ${
              signal.result.startsWith("+") ? "text-green-400" : "text-red-400"
            }`}>
              {signal.result}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#0a120e] min-h-screen text-white px-4 py-6 pb-20">
      <Header/>
      {/* Primary Category Selection */}
      <div className="flex border-b border-[#2a3a34] mb-4">
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
      </div>

      {/* Secondary Category Selection */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
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

      {/* Feed Content */}
      <div className="space-y-6">
        {activePrimary === "sports" ? (
          <>
            <h2 className="text-xl font-bold flex items-center">
              <FaStar className="mr-2 text-[#fea92a]" />
              {activeSport} Betting Tips
            </h2>
            {filteredSportTips.length > 0 ? (
              filteredSportTips.map(tip => renderSportTip(tip))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No tips available for {activeSport} right now
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold flex items-center">
              {activeTrading === "forex" ? (
                <FaDollarSign className="mr-2" />
              ) : (
                <FaBitcoin className="mr-2" />
              )}
              {activeTrading} Trading Signals
            </h2>
            {filteredTradingSignals.length > 0 ? (
              filteredTradingSignals.map(signal => renderTradingSignal(signal))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No signals available for {activeTrading} right now
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedPage;