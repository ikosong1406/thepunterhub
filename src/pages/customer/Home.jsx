import React, { useState } from "react";
import Header from "./Header";
import { FaFootballBall, FaBasketballBall, FaVolleyballBall, FaTableTennis, FaBaseballBall, FaStar, FaRegClock, FaChartLine } from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { GiTennisBall } from "react-icons/gi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const sports = [
  { name: "Football", icon: <IoMdFootball size={20} />, key: "football" },
  { name: "Basketball", icon: <FaBasketballBall size={18} />, key: "basketball" },
  { name: "Volleyball", icon: <FaVolleyballBall size={18} />, key: "volleyball" },
  { name: "Tennis", icon: <GiTennisBall size={18} />, key: "tennis" },
  { name: "Baseball", icon: <FaBaseballBall size={18} />, key: "baseball" },
];

const clubLogos = {
  "Chelsea": "https://resources.premierleague.com/premierleague/badges/50/t8.png",
  "Arsenal": "https://resources.premierleague.com/premierleague/badges/50/t3.png",
  "Real Madrid": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png",
  "Barcelona": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/83.png",
  "Nigeria": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/nigeria.png",
  "Ghana": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/ghana.png",
  "Lakers": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lal.png",
  "Celtics": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png",
  "Warriors": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/gsw.png",
  "Nets": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bkn.png",
  "Brazil": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/bra.png",
  "USA": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/usa.png",
  "Italy": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/ita.png",
  "Poland": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/pol.png",
  "Nadal": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/rafael-nadal.png",
  "Federer": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/roger-federer.png",
  "Djokovic": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/novak-djokovic.png",
  "Alcaraz": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/carlos-alcaraz.png",
  "Yankees": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/nyy.png",
  "Red Sox": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/bos.png",
  "Dodgers": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/lad.png",
  "Cubs": "https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/chc.png"
};

const sampleFixtures = {
  football: [
    { match: "Chelsea vs Arsenal", time: "18:00", league: "Premier League" },
    { match: "Real Madrid vs Barcelona", time: "20:45", league: "La Liga" },
    { match: "Nigeria vs Ghana", time: "22:30", league: "International" }
  ],
  basketball: [
    { match: "Lakers vs Celtics", time: "01:30", league: "NBA" },
    { match: "Warriors vs Nets", time: "04:00", league: "NBA" }
  ],
  volleyball: [
    { match: "Brazil vs USA", time: "15:00", league: "FIVB" },
    { match: "Italy vs Poland", time: "17:30", league: "European Championship" }
  ],
  tennis: [
    { match: "Nadal vs Federer", time: "14:00", league: "Wimbledon" },
    { match: "Djokovic vs Alcaraz", time: "16:30", league: "US Open" }
  ],
  baseball: [
    { match: "Yankees vs Red Sox", time: "23:00", league: "MLB" },
    { match: "Dodgers vs Cubs", time: "02:15", league: "MLB" }
  ],
};

const bettingTips = [
  {
    punterName: "Tipster Joe",
    dp: "https://i.pravatar.cc/150?img=1",
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
    followers: 1243
  },
  {
    punterName: "Winning Guru",
    dp: "https://i.pravatar.cc/150?img=2",
    site: "1xBet",
    code: "X7Y8Z",
    startTime: "21:15",
    totalOdd: "12.40",
    confidence: 60,
    matches: [
      { teams: "Lakers vs Celtics", prediction: "Lakers -3.5", odd: "1.90" },
      { teams: "Warriors vs Nets", prediction: "Over 220.5", odd: "1.85" },
      { teams: "Nadal vs Federer", prediction: "Federer Win", odd: "2.50" }
    ],
    streak: 3,
    followers: 876
  }
];

const Home = () => {
  const [selectedSport, setSelectedSport] = useState("football");

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    customPaging: i => (
      <div className="w-2 h-2 rounded-full bg-gray-600 mt-4"></div>
    )
  };

  const getTeamLogo = (teamName) => {
    return clubLogos[teamName] || "https://via.placeholder.com/50";
  };

  const renderFixture = (fixture) => {
    const [team1, team2] = fixture.match.split(" vs ");
    
    return (
      <div className="bg-gradient-to-r from-[#0f1f1a] to-[#162821] p-4 rounded-xl shadow-lg border border-[#2a3a34]">
        <div className="text-xs text-[#18ffc8] uppercase font-medium mb-2">{fixture.league}</div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 w-1/3 justify-end">
            <span className="text-right">{team1}</span>
            <img src={getTeamLogo(team1)} alt={team1} className="w-8 h-8 object-contain" />
          </div>
          <div className="px-4 py-1 bg-[#0f1f1a] rounded-md text-sm font-bold">VS</div>
          <div className="flex items-center space-x-2 w-1/3">
            <img src={getTeamLogo(team2)} alt={team2} className="w-8 h-8 object-contain" />
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

  return (
    <div className="bg-[#0a120e] min-h-screen text-white px-4 py-6">
      <Header />

      {/* Sport Category Icons */}
      <div className="flex justify-between items-center my-6 gap-2 overflow-x-auto pb-2">
        {sports.map((sport) => (
          <button
            key={sport.key}
            onClick={() => setSelectedSport(sport.key)}
            className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-3 rounded-xl transition-all duration-300 ${
              selectedSport === sport.key 
                ? "bg-[#855391]  text-white shadow-lg shadow-[#efefef]/30" 
                : "bg-[#162821] text-white hover:bg-[#1e332b]"
            }`}
          >
            <span className="text-lg mb-1">{sport.icon}</span>
            <span className="text-xs font-medium">{sport.name}</span>
          </button>
        ))}
      </div>

      {/* Fixtures Slideshow */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaFootballBall className="mr-2" />
          Upcoming Matches
        </h2>
        <Slider {...sliderSettings}>
          {sampleFixtures[selectedSport].map((fixture, index) => (
            <div key={index} className="px-2">
              {renderFixture(fixture)}
            </div>
          ))}
        </Slider>
      </div>

      {/* Betting Tips Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaStar className="mr-2 text-yellow-400" />
          Today's Top Tips
        </h2>
        
        {bettingTips.map((tip, idx) => (
          <div key={idx} className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34]">
            {/* Tipster Header */}
            <div className="flex items-center p-4 border-b border-[#2a3a34]">
              <img
                src={tip.dp}
                alt={tip.punterName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#18ffc8]"
              />
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
        ))}
      </div>
    </div>
  );
};

export default Home;