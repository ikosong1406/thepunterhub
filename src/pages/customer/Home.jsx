import React, { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api";
import Header from "./Header";
import localforage from "localforage";
import {
  FaFootballBall,
  FaBasketballBall,
  FaChartLine,
  FaBitcoin,
  FaDollarSign,
  FaBaseballBall,
  FaChartBar,
  FaStar,
  FaMoneyBillWave,
} from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { GiTennisBall, GiMetalDisc } from "react-icons/gi";
import { Banner } from "../../components/banner";

// ---------------------- TRADINGVIEW TICKER ----------------------
const forexSymbols = [
  { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
  { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
  { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
  { proName: "FX_IDC:USDCHF", title: "USD/CHF" },
  { proName: "FX_IDC:AUDUSD", title: "AUD/USD" },
  { proName: "FX_IDC:USDCAD", title: "USD/CAD" },
];

const cryptoSymbols = [
  { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
  { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
  { proName: "BINANCE:SOLUSDT", title: "Solana" },
  { proName: "BINANCE:XRPUSDT", title: "Ripple" },
  { proName: "BINANCE:ADAUSDT", title: "Cardano" },
  { proName: "BINANCE:DOGEUSDT", title: "Dogecoin" },
];

const commoditiesSymbols = [
  { proName: "TVC:GOLD", title: "Gold" },
  { proName: "TVC:SILVER", title: "Silver" },
  { proName: "COMEX:GC1!", title: "Gold Futures" },
  { proName: "NYMEX:CL1!", title: "Crude Oil" },
  { proName: "AMEX:UNG", title: "Nat Gas" },
  { proName: "COMEX:HG1!", title: "Copper" },
];

const indicesSymbols = [
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "NASDAQ:NDAQ", title: "NASDAQ" },
  { proName: "DOWJONES:DJI", title: "Dow Jones" },
  { proName: "CAPITALCOM:UK100", title: "FTSE 100" },
  { proName: "EU:DAX40", title: "DAX 40" },
];

const TradingViewTicker = memo(({ tradingType }) => {
  const container = useRef();
  useEffect(() => {
    if (container.current) container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    let symbols;
    switch (tradingType) {
      case "forex":
        symbols = forexSymbols;
        break;
      case "crypto":
        symbols = cryptoSymbols;
        break;
      case "commodities":
        symbols = commoditiesSymbols;
        break;
      case "indices":
        symbols = indicesSymbols;
        break;
      default:
        symbols = [];
    }
    script.innerHTML = JSON.stringify({
      symbols,
      colorTheme: "dark",
      isTransparent: true,
      showSymbolLogo: true,
      locale: "en",
      displayMode: "adaptive",
    });
    if (container.current) container.current.appendChild(script);
    return () => {
      if (container.current) container.current.innerHTML = "";
    };
  }, [tradingType]);
  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
});

// ---------------------- CATEGORIES ----------------------
const primaryCategories = [
  { name: "Sports", key: "sports", icon: <FaFootballBall /> },
  { name: "Trading", key: "trading", icon: <FaChartLine /> },
];

const sportCategories = [
  { name: "Football", icon: <IoMdFootball size={20} />, key: "football" },
];

const tradingCategories = [
  { name: "Forex", icon: <FaDollarSign size={18} />, key: "forex" },
  { name: "Crypto", icon: <FaBitcoin size={18} />, key: "crypto" },
  { name: "Commodities", icon: <GiMetalDisc size={18} />, key: "commodities" },
  { name: "Indices", icon: <FaChartBar size={18} />, key: "indices" },
];

// ---------------------- UTILITY FUNCTIONS ----------------------
const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

// ---------------------- HOME COMPONENT ----------------------
const Home = () => {
  const navigate = useNavigate();
  const [activePrimary, setActivePrimary] = useState("sports");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [punters, setPunters] = useState([]);
  const [puntersStats, setPuntersStats] = useState({}); // New state for stats
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.post(`${Api}/client/getUser`, { token });

        setUser(response.data.data);
        setLoggedInUserId(response.data.data._id);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPunters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${Api}/client/getPunters`);
        // Filter out the logged-in user and shuffle the array
        const filteredAndShuffledPunters = shuffleArray(
          response.data.data.filter((punter) => punter._id !== loggedInUserId)
        );
        setPunters(filteredAndShuffledPunters);

        // Fetch stats for each punter concurrently
        const statsPromises = filteredAndShuffledPunters.map(async (punter) => {
          try {
            const statsResponse = await axios.post(`${Api}/client/winloss`, {
              punterId: punter._id,
            });
            return { id: punter._id, stats: statsResponse.data };
          } catch (statsErr) {
            console.error(
              `Failed to fetch stats for punter ${punter._id}:`,
              statsErr
            );
            return { id: punter._id, stats: { wins: 0, losses: 0 } };
          }
        });

        const allStats = await Promise.all(statsPromises);
        const statsMap = allStats.reduce((acc, curr) => {
          acc[curr.id] = curr.stats;
          return acc;
        }, {});
        setPuntersStats(statsMap);
      } catch (err) {
        console.error("Failed to fetch punters:", err);
        setError("Failed to load punters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUserId) {
      fetchPunters();
    }
  }, [loggedInUserId]);

  const handlePunterClick = (punterId) => {
    navigate(`/customer/punters`, { state: { punterId } });
  };

  const renderPunterCard = (punter) => {
    const stats = puntersStats[punter._id] || { wins: 0, losses: 0 };
    const { wins, losses } = stats;
    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

    const getInitials = (username) => {
      const fInitial = username ? username.charAt(0) : "";
      return `${fInitial}`.toUpperCase();
    };

    return (
      <div
        key={punter._id}
        onClick={() => handlePunterClick(punter._id)}
        className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-[#18ffc8]"
      >
        <div className="p-4 flex items-start">
          <div className="relative mr-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-3xl font-bold border-2 border-[#18ffc8]">
              {getInitials(punter.username)}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg flex items-center">
                  {punter.username}
                  {punter.isVerified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 ml-2 text-blue-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.69a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  {punter.primaryCategory} & {punter.secondaryCategory}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-green-400 font-bold">{wins || 0}</div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-red-400 font-bold">{losses || 0}</div>
                <div className="text-xs text-gray-400">Losses</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-[#18ffc8] font-bold">{winRate}%</div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#2a3a34] p-3 flex justify-between items-center">
          <button className="w-full bg-[#f57cff] text-black font-bold py-3 rounded-lg flex items-center justify-center">
            <FaMoneyBillWave className="mr-2" />
            Subscribe
          </button>
        </div>
      </div>
    );
  };

  const filteredPunters = punters.filter(
    (punter) => punter.primaryCategory?.toLowerCase() === activePrimary
  );

  return (
    <div className="bg-[#0a120e] min-h-screen text-white">
      <div className="p-4">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-2 lg:px-8 lg:py-8">
        {/* PRIMARY CATEGORY SELECTION */}
        <div className="flex border-b border-[#2a3a34] mb-6">
          {primaryCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActivePrimary(category.key)}
              className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 text-lg ${
                activePrimary === category.key
                  ? "text-[#18ffc8] border-b-2 border-[#18ffc8]"
                  : "text-gray-400 hover:text-white transition-colors"
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>

        {/* SECONDARY CATEGORY SELECTION */}
        <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide">
          {activePrimary === "sports"
            ? sportCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveSport(category.key)}
                  className={`flex flex-col items-center min-w-[90px] px-4 py-3 rounded-xl transition-all ${
                    activeSport === category.key
                      ? "bg-[#855391] text-white shadow-lg"
                      : "bg-[#162821] text-white hover:bg-[#1e332b]"
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="text-sm mt-1">{category.name}</span>
                </button>
              ))
            : tradingCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveTrading(category.key)}
                  className={`flex flex-col items-center min-w-[90px] px-4 py-3 rounded-xl transition-all ${
                    activeTrading === category.key
                      ? "bg-[#855391] text-white shadow-lg"
                      : "bg-[#162821] text-white hover:bg-[#1e332b]"
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="text-sm mt-1">{category.name}</span>
                </button>
              ))}
        </div>

        {/* CONDITIONAL CONTENT */}
        <div className="mb-8">
          {activePrimary === "sports" ? (
            <>
              <h2 className="text-xl font-bold mb-4 lg:text-2xl">
                Whats New
              </h2>
              <div>
                <Banner />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 lg:text-2xl">
                Current {activeTrading} Market
              </h2>
              <div className="p-3 border border-[#2a3a34] rounded-xl overflow-hidden bg-[#0f1f1a]">
                <TradingViewTicker tradingType={activeTrading} />
              </div>
            </>
          )}
        </div>

        {/* PUNTERS LIST */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center lg:text-2xl">
            <FaStar className="mr-2 text-[#fea92a]" />
            Top{" "}
            {activePrimary === "sports"
              ? "Punters"
              : `Traders (${activeTrading})`}
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#18ffc8]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPunters.length > 0 ? (
                filteredPunters.map((punter) => renderPunterCard(punter))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-8">
                  No punters found for this category.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
