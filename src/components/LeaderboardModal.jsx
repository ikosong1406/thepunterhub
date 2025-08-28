import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrophy, FaUsers, FaChartLine, FaFire, FaArrowRight } from 'react-icons/fa';

// Mock data for demonstration
const mockPunters = [
  { _id: '1', name: 'John Sports', username: 'johnsports', category: 'sports', subscribers: 1542, performance: 87, avatar: null },
  { _id: '2', name: 'Mike Trader', username: 'miketrader', category: 'trading', subscribers: 1423, performance: 92, avatar: null },
  { _id: '3', name: 'Sarah Predicts', username: 'sarahp', category: 'sports', subscribers: 1321, performance: 85, avatar: null },
  { _id: '4', name: 'David Stocks', username: 'davidstocks', category: 'trading', subscribers: 1265, performance: 89, avatar: null },
  { _id: '5', name: 'Emma Wins', username: 'emmawins', category: 'sports', subscribers: 1187, performance: 83, avatar: null },
  { _id: '6', name: 'Alex Forex', username: 'alexfx', category: 'trading', subscribers: 1124, performance: 90, avatar: null },
  { _id: '7', name: 'Lisa Bets', username: 'lisabets', category: 'sports', subscribers: 1056, performance: 80, avatar: null },
  { _id: '8', name: 'Paul Investments', username: 'paulinvest', category: 'trading', subscribers: 987, performance: 88, avatar: null },
];

const LeaderboardModal = ({ onClose, navigateToPunter }) => {
  const [activeCategory, setActiveCategory] = useState('sports');
  const [sportsPunters, setSportsPunters] = useState([]);
  const [tradingPunters, setTradingPunters] = useState([]);

  useEffect(() => {
    // In a real app, this would be an API call
    const sports = mockPunters.filter(punter => punter.category === 'sports')
                             .sort((a, b) => b.subscribers - a.subscribers);
    const trading = mockPunters.filter(punter => punter.category === 'trading')
                             .sort((a, b) => b.subscribers - a.subscribers);
    
    setSportsPunters(sports);
    setTradingPunters(trading);
  }, []);

  const getCategoryPunters = () => {
    if (activeCategory === 'sports') return sportsPunters;
    if (activeCategory === 'trading') return tradingPunters;
    return [...sportsPunters, ...tradingPunters].sort((a, b) => b.subscribers - a.subscribers);
  };

  const getDisplayPunters = () => {
    const punters = getCategoryPunters();
    return activeCategory === 'all' ? punters.slice(0, 6) : punters;
  };

  const getRankColor = (index) => {
    if (index === 0) return '#ffd700'; // Gold
    if (index === 1) return '#c0c0c0'; // Silver
    if (index === 2) return '#cd7f32'; // Bronze
    return '#376553'; // Default
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="inline mr-1" style={{ color: '#ffd700' }} />;
    if (index === 1) return <FaTrophy className="inline mr-1" style={{ color: '#c0c0c0' }} />;
    if (index === 2) return <FaTrophy className="inline mr-1" style={{ color: '#cd7f32' }} />;
    return `${index + 1}.`;
  };

  const PunterCard = ({ punter, index }) => {
    const initials = punter.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return (
      <div 
        className="p-4 rounded-lg mb-3 cursor-pointer transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: "#162821", border: "1px solid #376553" }}
        onClick={() => navigateToPunter(punter._id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3 relative"
              style={{ backgroundColor: "#376553" }}
            >
              <span className="text-sm font-bold" style={{ color: "#efefef" }}>
                {initials}
              </span>
              <div 
                className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: getRankColor(index), color: index < 3 ? "#09100d" : "#efefef" }}
              >
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="font-bold" style={{ color: "#efefef" }}>{punter.name}</h3>
              <p className="text-sm" style={{ color: "#f57cff" }}>@{punter.username}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              <FaUsers className="mr-1" style={{ color: "#fea92a" }} />
              <span style={{ color: "#efefef" }}>{punter.subscribers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-end">
              <FaChartLine className="mr-1" style={{ color: "#18ffc8" }} />
              <span style={{ color: "#efefef" }}>{punter.performance}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CategoryLeader = ({ punters, category }) => {
    if (!punters.length) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: category === 'sports' ? '#fea92a' : '#855391' }}>
            {category === 'sports' ? 
              <FaFire style={{ color: "#09100d" }} /> : 
              <FaChartLine style={{ color: "#efefef" }} />
            }
          </div>
          <h3 className="text-lg font-bold capitalize" style={{ color: "#efefef" }}>
            Top {category} punters
          </h3>
        </div>
        
        {punters.slice(0, 3).map((punter, index) => (
          <PunterCard key={punter._id} punter={punter} index={index} />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <h2 
            className="text-xl font-bold flex items-center"
            style={{ color: "#efefef" }}
          >
            <FaTrophy className="mr-2" style={{ color: "#fea92a" }} />
            Leaderboard
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Category Filter Buttons */}
        <div className="px-6 py-4 flex gap-2 border-b" style={{ borderColor: "#376553" }}>
          <button
            onClick={() => setActiveCategory('sports')}
            className={`py-2 px-4 rounded-lg font-medium text-sm ${activeCategory === 'sports' ? 'opacity-100' : 'opacity-70'}`}
            style={{ 
              backgroundColor: activeCategory === 'sports' ? "#fea92a" : "#162821",
              color: activeCategory === 'sports' ? "#09100d" : "#efefef"
            }}
          >
            Sports
          </button>
          <button
            onClick={() => setActiveCategory('trading')}
            className={`py-2 px-4 rounded-lg font-medium text-sm ${activeCategory === 'trading' ? 'opacity-100' : 'opacity-70'}`}
            style={{ 
              backgroundColor: activeCategory === 'trading' ? "#fea92a" : "#162821",
              color: activeCategory === 'trading' ? "#09100d" : "#efefef"
            }}
          >
            Trading
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {activeCategory === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CategoryLeader punters={sportsPunters} category="sports" />
              </div>
              <div>
                <CategoryLeader punters={tradingPunters} category="trading" />
              </div>
            </div>
          ) : (
            <div>
              {getDisplayPunters().map((punter, index) => (
                <PunterCard key={punter._id} punter={punter} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;