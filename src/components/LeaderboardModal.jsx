import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaTrophy, FaUsers, FaChartLine, FaFire } from 'react-icons/fa';
import Api from "./Api"

const LeaderboardModal = ({ onClose, navigateToPunter }) => {
  const [activeCategory, setActiveCategory] = useState('sports'); // Default to sports
  const [punters, setPunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${Api}/client/leaderboard`);
        const allPunters = response.data;
        setPunters(allPunters);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch leaderboard data.");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };
    
    fetchLeaderboard();
  }, []);

  const getDisplayPunters = () => {
    const categoryPunters = punters.filter(punter => punter.primaryCategory === activeCategory);
    return categoryPunters.sort((a, b) => b.subscribers - a.subscribers);
  };

  const getRankColor = (index) => {
    if (index === 0) return '#ffd700'; // Gold
    if (index === 1) return '#c0c0c0'; // Silver
    if (index === 2) return '#cd7f32'; // Bronze
    return '#376553'; // Default
  };

  const PunterCard = ({ punter, index }) => {
    const initials = punter.username ? punter.username.charAt(0).toUpperCase() : '';
    
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
              <h3 className="font-bold" style={{ color: "#efefef" }}>{punter.username}</h3>
              <p className="text-sm" style={{ color: "#f57cff" }}>@{punter.username}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              <FaUsers className="mr-1" style={{ color: "#fea92a" }} />
              <span style={{ color: "#efefef" }}>{punter.subscribers.toLocaleString()}</span>
            </div>
          </div>
        </div>
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
          {loading ? (
            <div className="text-center mt-8 text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center mt-8 text-red-500">{error}</div>
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