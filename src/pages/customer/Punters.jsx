import React, { useState, useEffect } from 'react';
import axios from 'axios';
import localforage from 'localforage';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaChartLine, FaHistory, FaMoneyBillWave, FaUserFriends, FaArrowLeft } from 'react-icons/fa';
import Api from '../../components/Api'; // Assuming this points to your API base URL

const PunterDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { punterId } = location.state || {}; 

  const [user, setUser] = useState(null);
  const [punter, setPunter] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a single useEffect to handle all data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      if (!punterId) {
        setError('Punter ID not provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Get user data using the token
        const token = await localforage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found.');
        }

        const userResponse = await axios.post(`${Api}/client/getUser`, { token });
        const userData = userResponse.data.data;
        setUser(userData);

        // 2. Check subscription status
        const subResponse = await axios.post(`${Api}/client/isSubscribed`, {
          userId: userData._id,
          punterId: punterId,
        });
        setIsSubscribed(subResponse.data.isSubscribed);

        // 3. Get all punter data
        const punterResponse = await axios.post(`${Api}/client/getPunterdetails`, { punterId });
        setPunter(punterResponse.data);

        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || 'An error occurred while fetching punter data.');
        setLoading(false);
      }
    };

    fetchAllData();
  }, [punterId]);

  // Handle loading and error states
  if (loading) {
    return <div className="min-h-screen bg-[#09100d] text-white p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#09100d] text-red-400 p-6 text-center">Error: {error}</div>;
  }
  
  if (!punter) {
    // This case might be hit if the punter data fetch failed silently or returned null
    return <div className="min-h-screen bg-[#09100d] text-red-400 p-6 text-center">Punter not found.</div>;
  }

  // Calculate win rate now that punter data is available
  const winRate = punter.wins && punter.losses ? ((punter.wins / (punter.wins + punter.losses)) * 100) : 0;

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
              src={punter.avatar || 'https://i.pravatar.cc/150?img=1'}
              alt={`${punter.firstname} ${punter.lastname}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#18ffc8]"
            />
            {punter.isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f1f1a]"></div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{punter.firstname} {punter.lastname}</h2>
            <p className="text-[#18ffc8]">{punter.primaryCategory} - {punter.secondaryCategory}</p>
            <div className="flex items-center mt-1">
              <FaStar className="text-[#fea92a] mr-1" />
              <span>{punter.rating || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-green-400 font-bold text-xl">{punter.wins || 0}W</div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-red-400 font-bold text-xl">{punter.losses || 0}L</div>
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
          <p className="text-gray-300">{punter.bio}</p>
        </div>

        {/* Performance Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <FaChartLine className="mr-2 text-[#fea92a]" />
            Performance
          </h3>
          <div className="bg-[#162821] p-4 rounded-lg">
            {/* The chart logic should be updated to use real data from the punter object */}
            {punter.performance?.length > 0 ? (
              <div className="flex justify-between items-end h-32">
                {punter.performance.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-6 bg-[#18ffc8] rounded-t-sm"
                      style={{ height: `${item.winRate * 0.8}px` }}
                    ></div>
                    <span className="text-xs mt-1">{item.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">No performance data available.</div>
            )}
          </div>
        </div>

        {/* Conditional Recent Signals or Subscribe Button */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <FaHistory className="mr-2 text-[#fea92a]" />
            Recent Signals
          </h3>
          {isSubscribed ? (
            <div className="space-y-3">
              {punter.recentSignals?.length > 0 ? (
                punter.recentSignals.map((signal) => (
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
                ))
              ) : (
                <div className="text-center text-gray-400">No recent signals available.</div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[#162821] rounded-lg text-center">
              <p className="mb-4 text-gray-300">Subscribe to view recent signals.</p>
              <button className="w-full bg-[#f57cff] text-black font-bold py-3 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="mr-2" />
                Subscribe for {punter.subscription || 'N/A'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PunterDetailsPage;