import React, { useState, useEffect } from "react";
import localforage from "localforage";
import axios from "axios";
import {
  FaFootballBall,
  FaBasketballBall,
  FaVolleyballBall,
  FaBaseballBall,
  FaStar,
  FaRegClock,
  FaChartLine,
  FaBitcoin,
  FaDollarSign,
} from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { GiTennisBall } from "react-icons/gi";
import Header from "../customer/Header";
import Api from "../../components/Api";

// Primary Categories
const primaryCategories = [
  { name: "Sports", key: "sports", icon: <FaFootballBall /> },
  { name: "Trading", key: "trading", icon: <FaChartLine /> },
];

// Sport Subcategories
const sportCategories = [
  { name: "Football", icon: <IoMdFootball size={20} />, key: "football" },
  {
    name: "Basketball",
    icon: <FaBasketballBall size={18} />,
    key: "basketball",
  },
  {
    name: "Volleyball",
    icon: <FaVolleyballBall size={18} />,
    key: "volleyball",
  },
  { name: "Tennis", icon: <GiTennisBall size={18} />, key: "tennis" },
  { name: "Baseball", icon: <FaBaseballBall size={18} />, key: "baseball" },
];

// Trading Subcategories
const tradingCategories = [
  { name: "Forex", icon: <FaDollarSign size={18} />, key: "forex" },
  { name: "Crypto", icon: <FaBitcoin size={18} />, key: "crypto" },
];

const FeedPage = () => {
  const [activePrimary, setActivePrimary] = useState("sports");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token"); // or wherever you store your auth token
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.post(`${Api}/client/getUser`, { token });

        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch feed data from the backend
  useEffect(() => {
    // Only attempt to fetch the feed if the user object exists
    if (user) {
      const fetchFeed = async () => {
        setLoading(true);
        try {
          const response = await axios.post(`${Api}/client/getFeed`, {
            userId: user._id,
          });
          setFeedData(response.data);
        } catch (error) {
          console.error("Error fetching feed data:", error);
          setFeedData([]); // Clear data on error
        } finally {
          setLoading(false);
        }
      };
      fetchFeed();
    }
  }, [activePrimary, activeSport, activeTrading, user]);

  // Render a single sport betting tip card
  const renderSportTip = (tip) => (
    <div
      key={tip._id}
      className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-6"
    >
      {/* Tipster Header */}
      <div className="flex items-center p-4 border-b border-[#2a3a34]">
        <img
          src={tip.punterAvatar || "https://i.pravatar.cc/150?img=1"}
          alt={tip.punterName || "Punter"}
          className="w-12 h-12 rounded-full object-cover border-2 border-[#18ffc8]"
        />
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {tip.punterName || "Anonymous Punter"}
            </h2>
            {tip.streak && (
              <span className="text-xs bg-[#f57cff] text-black px-2 py-1 rounded-full font-bold">
                {tip.streak}W streak
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
            <span>
              {tip.followers ? tip.followers.toLocaleString() : 0} followers
            </span>
            <span className="flex items-center">
              <FaChartLine className="mr-1" />
              {tip.confidenceLevel || 0}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="p-4 space-y-3">
        {tip.matches?.map((match, i) => (
          <div key={i} className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="font-medium text-sm mb-1">{match.team}</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#18ffc8]">{match.prediction}</span>
              <span className="bg-[#18ffc8] text-black px-2 py-1 rounded font-bold">
                {match.odd || "N/A"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-[#0a120e] p-3 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-400">Starts at </span>
          <span className="font-bold">
            {tip.startTime
              ? new Date(tip.startTime).toLocaleTimeString()
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center">
          {tip.bettingSite && (
            <span className="text-xs bg-[#1e332b] px-2 py-1 rounded mr-2">
              {tip.bettingSite}
            </span>
          )}
          {tip.bettingCode && (
            <span className="text-xs bg-[#fea92a] text-black px-2 py-1 rounded font-bold">
              Code: {tip.bettingCode}
            </span>
          )}
        </div>
        <div className="text-lg font-bold bg-gradient-to-r from-[#18ffc8] to-[#0c9] text-transparent bg-clip-text">
          {tip.totalOdd || "N/A"}
        </div>
      </div>
    </div>
  );

  // Render a single trading signal card
  const renderTradingSignal = (signal) => (
    <div
      key={signal._id}
      className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-6"
    >
      {/* Trader Header */}
      <div className="flex items-center p-4 border-b border-[#2a3a34]">
        <img
          src={signal.traderAvatar || "https://i.pravatar.cc/150?img=1"}
          alt={signal.traderName || "Trader"}
          className="w-12 h-12 rounded-full object-cover border-2 border-[#18ffc8]"
        />
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {signal.traderName || "Anonymous Trader"}
            </h2>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold text-black ${
                signal.status === "pending"
                  ? "bg-blue-500"
                  : signal.status === "won"
                  ? "bg-[#18ffc8]"
                  : signal.status === "lost"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            >
              {signal.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-300 mt-1">
            <span>
              {signal.updatedAt
                ? new Date(signal.updatedAt).toLocaleString()
                : "Just now"}
            </span>
            <span className="flex items-center">
              <FaChartLine className="mr-1" />
              {signal.confidenceLevel || 0}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Signal Details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Pair</div>
            <div className="font-bold">{signal.pair || "N/A"}</div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Direction</div>
            <div
              className={`font-bold ${
                signal.direction === "buy" || signal.direction === "long"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {signal.direction || "N/A"}
            </div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Entry</div>
            <div className="font-bold">{signal.entryPrice || "N/A"}</div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Time Frame</div>
            <div className="font-bold">{signal.timeFrame || "N/A"}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Take Profit</div>
            <div className="font-bold text-green-400">
              {signal.takeProfit || "N/A"}
            </div>
          </div>
          <div className="bg-[#0f1f1a] p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
            <div className="font-bold text-red-400">
              {signal.stopLoss || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-400">Loading feed...</div>
      );
    }

    // Add a check to ensure feedData is a non-empty array
    if (!feedData || !Array.isArray(feedData) || feedData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          No {activePrimary === "sports" ? "tips" : "signals"} available for{" "}
          {activePrimary === "sports" ? activeSport : activeTrading} right now.
        </div>
      );
    }

    if (activePrimary === "sports") {
      return feedData.map((tip) => renderSportTip(tip));
    } else {
      return feedData.map((signal) => renderTradingSignal(signal));
    }
  };

  return (
    <div className="bg-[#0a120e] min-h-screen text-white px-4 py-6 pb-20">
      <Header />
      {/* Primary Category Selection */}
      <div className="flex border-b border-[#2a3a34] mb-4">
        {primaryCategories.map((category) => (
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
        {activePrimary === "sports"
          ? sportCategories.map((category) => (
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
          : tradingCategories.map((category) => (
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
            ))}
      </div>

      {/* Feed Content */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center">
          {activePrimary === "sports" ? (
            <FaStar className="mr-2 text-[#fea92a]" />
          ) : activeTrading === "forex" ? (
            <FaDollarSign className="mr-2" />
          ) : (
            <FaBitcoin className="mr-2" />
          )}
          {activePrimary === "sports"
            ? `${activeSport} Betting Tips`
            : `${activeTrading} Trading Signals`}
        </h2>

        {renderFeedContent()}
      </div>
    </div>
  );
};

export default FeedPage;
