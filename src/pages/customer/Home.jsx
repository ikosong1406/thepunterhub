import React, { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api"; // Your API config
import Header from "./Header";
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
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const TradingViewTicker = memo(({ tradingType }) => {
  const container = useRef();
  useEffect(() => {
    if (container.current) container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    const symbols = tradingType === "forex" ? forexSymbols : cryptoSymbols;
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

// ---------------------- LIVE SCORE TICKER ----------------------
const LiveScoreTicker = () => {
  useEffect(() => {
    // Create the container div with the exact ID from Broadage
    const container = document.createElement('div');
    container.id = "DOM_element_id_in_your_website_1755209641568";
    document.getElementById('broadage-ticker-container').appendChild(container);

    // Load the Broadage script exactly as provided
    const script = document.createElement('script');
    script.innerHTML = `
      (function(b, s, p, o, r, t) {
        b["broadage"] = b["broadage"] || [];
        if (!b["broadage"].length) {
          r = document.createElement(s);
          t = document.getElementsByTagName(s)[0];
          r.async = true;
          r.src = p;
          t.parentNode.insertBefore(r, t);
        }
        b["broadage"].push({ 
          "bundleId": ["all-lst"],
          "accountId": "a46d031d-cf9c-4b8f-8649-4aa1c1b93f4a",
          "widgets": {
            "liveScoreTicker": [{
              "element": "DOM_element_id_in_your_website_1755209641568",
              "coverageId": "6bf0cf44-e13a-44e1-8008-ff17ba6c2128",
              "options": { "theme": "black" }
            }]
          }
        });
      })(window, "script", "//cdn-saas.broadage.com/widgets/loader/loader.js");
    `;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const container = document.getElementById('DOM_element_id_in_your_website_1755209641568');
      if (container) container.remove();
      const scripts = document.querySelectorAll('script[src*="broadage.com"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div 
      id="broadage-ticker-container"
      style={{
        width: '100%',
        minHeight: '50px',
        backgroundColor: '#0a120e',
        border: '1px solid #2a3a34',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

// ---------------------- CATEGORIES ----------------------
const primaryCategories = [
  { name: "Sports", key: "sports", icon: <FaFootballBall /> },
  { name: "Trading", key: "trading", icon: <FaChartLine /> },
];

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

const tradingCategories = [
  { name: "Forex", icon: <FaDollarSign size={18} />, key: "forex" },
  { name: "Crypto", icon: <FaBitcoin size={18} />, key: "crypto" },
];

// ---------------------- HOME COMPONENT ----------------------
const Home = () => {
  const navigate = useNavigate();
  const [activePrimary, setActivePrimary] = useState("sports");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");

  const [punters, setPunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPunters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${Api}/client/getPunters`);
        setPunters(response.data.data);
      } catch (err) {
        console.error("Failed to fetch punters:", err);
        setError("Failed to load punters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPunters();
  }, []);

  const handlePunterClick = (punterId) => {
    navigate(`/customer/punters`, { state: { punterId } });
  };

  const renderPunterCard = (punter) => {
    const winRate =
      punter.wins && punter.losses
        ? (punter.wins / (punter.wins + punter.losses)) * 100
        : 0;

    return (
      <div
        key={punter._id}
        onClick={() => handlePunterClick(punter._id)}
        className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-4 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
      >
        <div className="p-4 flex items-start">
          <div className="relative">
            <img
              src={punter.avatar || "https://i.pravatar.cc/150?img=1"}
              alt={punter.firstname}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#18ffc8]"
            />
            {punter.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1f1a]"></div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {punter.firstname} {punter.lastname}
                </h3>
                <p className="text-sm text-gray-400">
                  {punter.primaryCategory} & {punter.secondaryCategory}
                </p>
              </div>
              <div className="flex items-center bg-[#1e332b] px-2 py-1 rounded-full">
                <FaStar className="text-[#fea92a] mr-1" />
                <span>{punter.rating || "N/A"}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-green-400 font-bold">
                  {punter.wins || 0}W
                </div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-red-400 font-bold">
                  {punter.losses || 0}L
                </div>
                <div className="text-xs text-gray-400">Losses</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-[#18ffc8] font-bold">
                  {winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#2a3a34] p-3 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-400">Last signal: </span>
            <span className="font-medium">{punter.lastSignal || "N/A"}</span>
          </div>
          <button className="bg-[#f57cff] text-black font-bold px-4 py-2 rounded-full text-sm">
            Subscribe {punter.subscription || "N/A"}
          </button>
        </div>
      </div>
    );
  };

  const filteredPunters = punters.filter((punter) => {
    if (activePrimary === "sports") {
      if (punter.primaryCategory?.toLowerCase() !== "sports") return false;
      return punter.secondaryCategory?.toLowerCase() === activeSport;
    } else if (activePrimary === "trading") {
      if (punter.primaryCategory?.toLowerCase() !== "trading") return false;
      return punter.secondaryCategory?.toLowerCase() === activeTrading;
    }
    return false;
  });

  return (
    <div className="bg-[#0a120e] min-h-screen text-white px-4 py-6 pb-20">
      <Header />

      {/* PRIMARY CATEGORY SELECTION */}
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

      {/* SECONDARY CATEGORY SELECTION */}
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

      {/* CONDITIONAL CONTENT */}
      <div className="mb-8">
        {activePrimary === "sports" ? (
          <>
            <h2 className="text-xl font-bold mb-4">Live Scores</h2>
            <div className="p-2 border border-[#2a3a34] rounded-xl overflow-hidden">
              <LiveScoreTicker />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">
              Current {activeTrading} Market
            </h2>
            <div className="p-2 border border-[#2a3a34] rounded-xl overflow-hidden">
              <TradingViewTicker tradingType={activeTrading} />
            </div>
          </>
        )}
      </div>

      {/* PUNTERS LIST */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaStar className="mr-2 text-[#fea92a]" />
          Top {activePrimary === "sports" ? activeSport : activeTrading}{" "}
          {activePrimary === "sports" ? "Punters" : "Traders"}
        </h2>
        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Loading punters...
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">{error}</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {filteredPunters.length > 0 ? (
              filteredPunters.map((punter) => renderPunterCard(punter))
            ) : (
              <div className="text-center text-gray-400 py-8">
                No punters found for this category.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
