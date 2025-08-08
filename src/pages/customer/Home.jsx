import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Club Logos
const clubLogos = {
  Chelsea: "https://resources.premierleague.com/premierleague/badges/50/t8.png",
  Arsenal: "https://resources.premierleague.com/premierleague/badges/50/t3.png",
  "Real Madrid":
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png",
  Barcelona:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/83.png",
  Nigeria:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/nigeria.png",
  Ghana:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/ghana.png",
  Lakers: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lal.png",
  Celtics: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png",
  Warriors: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/gsw.png",
  Nets: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bkn.png",
  Brazil:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/bra.png",
  USA: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/usa.png",
  Italy:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/ita.png",
  Poland:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/pol.png",
  Nadal:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/rafael-nadal.png",
  Federer:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/roger-federer.png",
  Djokovic:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/novak-djokovic.png",
  Alcaraz:
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/carlos-alcaraz.png",
  Yankees: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/nyy.png",
  "Red Sox":
    "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/bos.png",
  Dodgers: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/lad.png",
  Cubs: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/chc.png",
};

// Sport Fixtures
const sportFixtures = {
  football: [
    { match: "Chelsea vs Arsenal", time: "18:00", league: "Premier League" },
    { match: "Real Madrid vs Barcelona", time: "20:45", league: "La Liga" },
    { match: "Nigeria vs Ghana", time: "22:30", league: "International" },
  ],
  basketball: [
    { match: "Lakers vs Celtics", time: "01:30", league: "NBA" },
    { match: "Warriors vs Nets", time: "04:00", league: "NBA" },
  ],
  volleyball: [
    { match: "Brazil vs USA", time: "15:00", league: "FIVB" },
    {
      match: "Italy vs Poland",
      time: "17:30",
      league: "European Championship",
    },
  ],
  tennis: [
    { match: "Nadal vs Federer", time: "14:00", league: "Wimbledon" },
    { match: "Djokovic vs Alcaraz", time: "16:30", league: "US Open" },
  ],
  baseball: [
    { match: "Yankees vs Red Sox", time: "23:00", league: "MLB" },
    { match: "Dodgers vs Cubs", time: "02:15", league: "MLB" },
  ],
};

// Market Data
const marketData = {
  forex: [
    {
      pair: "EUR/USD",
      price: 1.0854,
      change: "+0.12%",
      high: 1.0872,
      low: 1.0821,
    },
    {
      pair: "GBP/USD",
      price: 1.2658,
      change: "-0.24%",
      high: 1.2689,
      low: 1.2623,
    },
    {
      pair: "USD/JPY",
      price: 151.32,
      change: "+0.45%",
      high: 151.45,
      low: 150.87,
    },
  ],
  crypto: [
    {
      coin: "Bitcoin (BTC)",
      price: "$63,452.78",
      change: "+2.34%",
      marketCap: "$1.23T",
    },
    {
      coin: "Ethereum (ETH)",
      price: "$3,421.56",
      change: "+1.87%",
      marketCap: "$410.5B",
    },
    {
      coin: "Solana (SOL)",
      price: "$178.34",
      change: "+5.23%",
      marketCap: "$74.8B",
    },
  ],
};

// All Punters
const allPunters = [
  // Sport Punters
  {
    id: 1,
    name: "Elite Predictor",
    avatar: "https://i.pravatar.cc/150?img=1",
    specialty: "Football & Tennis",
    rating: 4.9,
    wins: 342,
    losses: 48,
    subscription: "$29.99/month",
    lastSignal: "2 hours ago",
    isOnline: true,
    performance: "95%",
    type: "sport",
  },
  {
    id: 2,
    name: "Basketball Pro",
    avatar: "https://i.pravatar.cc/150?img=5",
    specialty: "NBA & Euroleague",
    rating: 4.6,
    wins: 276,
    losses: 64,
    subscription: "$24.99/month",
    lastSignal: "5 hours ago",
    isOnline: true,
    performance: "87%",
    type: "sport",
  },
  // Forex Punters
  {
    id: 3,
    name: "FX Master",
    avatar: "https://i.pravatar.cc/150?img=11",
    specialty: "Forex Pairs",
    rating: 4.8,
    wins: 187,
    losses: 22,
    subscription: "$39.99/month",
    lastSignal: "1 hour ago",
    isOnline: false,
    performance: "92%",
    type: "forex",
  },
  // Crypto Punters
  {
    id: 4,
    name: "Crypto Oracle",
    avatar: "https://i.pravatar.cc/150?img=9",
    specialty: "Bitcoin & Altcoins",
    rating: 4.7,
    wins: 215,
    losses: 35,
    subscription: "$49.99/month",
    lastSignal: "30 mins ago",
    isOnline: true,
    performance: "89%",
    type: "crypto",
  },
];

// Slider Settings
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  autoplay: true,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  customPaging: (i) => (
    <div className="w-2 h-2 rounded-full bg-gray-600 mt-4"></div>
  ),
};

const Home = () => {
  const navigate = useNavigate();
  const [activePrimary, setActivePrimary] = useState("sports");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");

  const getTeamLogo = (teamName) => {
    return clubLogos[teamName] || "https://via.placeholder.com/50";
  };

  const renderSportFixture = (fixture) => {
    const [team1, team2] = fixture.match.split(" vs ");

    return (
      <div className="bg-gradient-to-r from-[#0f1f1a] to-[#162821] p-4 rounded-xl shadow-lg border border-[#2a3a34]">
        <div className="text-xs text-[#18ffc8] uppercase font-medium mb-2">
          {fixture.league}
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 w-1/3 justify-end">
            <span className="text-right">{team1}</span>
            {team1 && (
              <img
                src={getTeamLogo(team1)}
                alt={team1}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
          <div className="px-4 py-1 bg-[#0f1f1a] rounded-md text-sm font-bold">
            VS
          </div>
          <div className="flex items-center space-x-2 w-1/3">
            {team2 && (
              <img
                src={getTeamLogo(team2)}
                alt={team2}
                className="w-8 h-8 object-contain"
              />
            )}
            <span>{team2}</span>
          </div>
        </div>
        <div className="flex justify-center items-center text-sm text-gray-300">
          <FaRegClock className="mr-1" />
          <span>{fixture.time}</span>
        </div>
      </div>
    );
  };

  const renderMarketItem = (item) => {
    const isPositive = item.change.startsWith("+");

    return (
      <div className="bg-gradient-to-r from-[#0f1f1a] to-[#162821] p-4 rounded-xl shadow-lg border border-[#2a3a34]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">
            {activeTrading === "forex" ? item.pair : item.coin}
          </h3>
          <span
            className={`text-lg font-bold ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {item.price}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">24h Change:</span>
          <span className={isPositive ? "text-green-400" : "text-red-400"}>
            {item.change}
          </span>
        </div>
        {activeTrading === "forex" ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Range:</span>
            <span>
              H: {item.high} L: {item.low}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Market Cap:</span>
            <span>{item.marketCap}</span>
          </div>
        )}
      </div>
    );
  };

    const handlePunterClick = (punter) => {
    navigate(`/customer/punters`, { state: { punter } });
  };

  const renderPunterCard = (punter) => {
    const winRate = (punter.wins / (punter.wins + punter.losses)) * 100;
    

    return (
      <div
        key={punter.id}
        onClick={() => handlePunterClick(punter)}
        className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-4"
      >
        <div className="p-4 flex items-start">
          <div className="relative">
            <img
              src={punter.avatar}
              alt={punter.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#18ffc8]"
            />
            {punter.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1f1a]"></div>
            )}
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{punter.name}</h3>
                <p className="text-sm text-gray-400">{punter.specialty}</p>
              </div>
              <div className="flex items-center bg-[#1e332b] px-2 py-1 rounded-full">
                <FaStar className="text-[#fea92a] mr-1" />
                <span>{punter.rating}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-green-400 font-bold">{punter.wins}W</div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-red-400 font-bold">{punter.losses}L</div>
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
            <span className="font-medium">{punter.lastSignal}</span>
          </div>
          <button className="bg-[#f57cff] text-black font-bold px-4 py-2 rounded-full text-sm">
            Subscribe {punter.subscription}
          </button>
        </div>
      </div>
    );
  };

  // Filter punters based on selection
  const filteredPunters = allPunters.filter((punter) => {
    if (activePrimary === "sports") return punter.type === "sport";
    if (activePrimary === "trading") {
      if (activeTrading === "forex") return punter.type === "forex";
      return punter.type === "crypto";
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

      {/* CONTENT SLIDER */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {activePrimary === "sports"
            ? `Upcoming ${activeSport} Matches`
            : `Current ${activeTrading} Market`}
        </h2>

        <Slider {...sliderSettings}>
          {activePrimary === "sports"
            ? sportFixtures[activeSport]?.map((fixture, index) => (
                <div key={index} className="px-2">
                  {renderSportFixture(fixture)}
                </div>
              ))
            : marketData[activeTrading]?.map((item, index) => (
                <div key={index} className="px-2">
                  {renderMarketItem(item)}
                </div>
              ))}
        </Slider>
      </div>

      {/* PUNTERS LIST */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaStar className="mr-2 text-[#fea92a]" />
          Top {activePrimary === "sports" ? activeSport : activeTrading}{" "}
          {activePrimary === "sports" ? "Punters" : "Traders"}
        </h2>

        {/* Add these Tailwind classes to make this div scrollable */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredPunters.map((punter) => renderPunterCard(punter))}
        </div>
      </div>
    </div>
  );
};

export default Home;
