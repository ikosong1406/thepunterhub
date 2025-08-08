import { FaStar, FaChartLine, FaHistory, FaMoneyBillWave, FaUserFriends, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const PunterDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { punter } = location.state || {};

  // Fallback if navigated directly
  if (!punter) {
    navigate('/punters');
    return null;
  }

  const winRate = (punter.wins / (punter.wins + punter.losses)) * 100;

  // Extended punter details
  const punterDetails = {
    ...punter,
    bio: "Professional sports analyst with 5+ years experience in football predictions. Specializing in European leagues.",
    performance: [
      { month: 'Jan', winRate: 78 },
      { month: 'Feb', winRate: 82 },
      { month: 'Mar', winRate: 85 },
      { month: 'Apr', winRate: 79 },
      { month: 'May', winRate: 83 },
      { month: 'Jun', winRate: 81 },
    ],
    recentSignals: [
      { id: 1, match: "Man Utd vs Chelsea", prediction: "Over 2.5 Goals", result: "Won", odds: 1.85 },
      { id: 2, match: "Barcelona vs Real Madrid", prediction: "Barcelona Win", result: "Lost", odds: 2.10 },
      { id: 3, match: "Liverpool vs Man City", prediction: "Both Teams to Score", result: "Won", odds: 1.65 },
    ]
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-white">
      {/* Header with back button */}
      <div className="p-4 border-b border-[#2a3a34] flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-[#162821]"
        >
          <FaArrowLeft className="text-[#18ffc8]" />
        </button>
        <h1 className="text-xl font-bold">Punter Details</h1>
      </div>

      {/* Profile Section */}
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="relative mr-4">
            <img
              src={punterDetails.avatar}
              alt={punterDetails.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#18ffc8]"
            />
            {punterDetails.isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f1f1a]"></div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{punterDetails.name}</h2>
            <p className="text-[#18ffc8]">{punterDetails.specialty}</p>
            <div className="flex items-center mt-1">
              <FaStar className="text-[#fea92a] mr-1" />
              <span>{punterDetails.rating}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-green-400 font-bold text-xl">{punterDetails.wins}W</div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-red-400 font-bold text-xl">{punterDetails.losses}L</div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-[#18ffc8] font-bold text-xl">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <FaUserFriends className="mr-2 text-[#fea92a]" />
            About
          </h3>
          <p className="text-gray-300">{punterDetails.bio}</p>
        </div>

        {/* Performance Chart (simplified) */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <FaChartLine className="mr-2 text-[#fea92a]" />
            Performance
          </h3>
          <div className="bg-[#162821] p-4 rounded-lg">
            {/* In a real app, you would use a chart library here */}
            <div className="flex justify-between items-end h-32">
              {punterDetails.performance.map((item) => (
                <div key={item.month} className="flex flex-col items-center">
                  <div 
                    className="w-6 bg-[#18ffc8] rounded-t-sm"
                    style={{ height: `${item.winRate * 0.8}px` }}
                  ></div>
                  <span className="text-xs mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <FaHistory className="mr-2 text-[#fea92a]" />
            Recent Signals
          </h3>
          <div className="space-y-3">
            {punterDetails.recentSignals.map((signal) => (
              <div key={signal.id} className="bg-[#162821] p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">{signal.match}</span>
                  <span className={`${signal.result === 'Won' ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.result}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{signal.prediction}</span>
                  <span>Odds: {signal.odds}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe Button */}
        <button className="w-full bg-[#f57cff] text-black font-bold py-3 rounded-lg flex items-center justify-center">
          <FaMoneyBillWave className="mr-2" />
          Subscribe for {punterDetails.subscription}
        </button>
      </div>
    </div>
  );
};

export default PunterDetailsPage;