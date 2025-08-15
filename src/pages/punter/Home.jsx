import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiDollarSign, FiBarChart2, FiChevronRight } from 'react-icons/fi';
import Header from "./Header";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import Colors from "../../components/colors"

const PunterDashboard = () => {
  const navigate = useNavigate();
  
  // State for fetching and displaying data
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
       const token = await localforage.getItem("token"); // or wherever you store your auth token
        if (!token) {
          throw new Error("No authentication token found.");
        }

        // Fetch user data
        const userResponse = await axios.post(`${Api}/client/getUser`, { token });
        const userData = userResponse.data.data;
        
        // --- Data Processing and Fallbacks ---
        // Handle potential null/empty values from the backend
        const winRateValue = userData.win && userData.loss
          ? ((userData.win / (userData.win + userData.loss)) * 100).toFixed(0) + '%'
          : '0%'; // Fallback for win rate
        
        const subscribersCount = userData.subscribers?.length || 0;
        const totalEarnings = userData.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

        // Set state with processed data and fallbacks
        setUser(userData);
        setStats([
          { title: "Total Subscribers", value: subscribersCount, change: "+12%", icon: <FiUsers className="text-xl" /> },
          { title: "Total Earnings", value: `$${totalEarnings.toFixed(2)}`, change: "+18%", icon: <FiDollarSign className="text-xl" /> },
          { title: "Win Rate", value: winRateValue, change: "+3%", icon: <FiBarChart2 className="text-xl" /> },
        ]);
        
        // This is a placeholder for recent activity, you'll need a separate endpoint for this
        setRecentActivity([
          { id: 1, action: "New subscriber", user: "John D.", time: "2 mins ago", amount: "+$10" },
          { id: 2, action: "Tip won", details: "BTC prediction", time: "1 hour ago", amount: null },
          { id: 3, action: "Subscription renewed", user: "Sarah M.", time: "3 hours ago", amount: "+$20" },
        ]);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Show a loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: Colors.orange }}>Loading Dashboard...</h1>
          <p className="mt-2" style={{ color: Colors.white }}>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // Show an error message if fetching fails
  if (error) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] flex justify-center items-center">
        <div className="text-center p-6 bg-red-900/20 rounded-lg">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="mt-2 text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  // Fallback for user object if data fetching succeeded but user is null for some reason
  const username = user?.username || "Guest";

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-6">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, <span className="font-medium text-[#fea92a]">{username}</span></h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30 hover:border-[#fea92a]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#efefef]/70 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#376553]/20 text-[#fea92a]">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-sm text-[#fea92a] hover:underline">View All</button>
          </div>
          
          <div className="divide-y divide-[#376553]/30">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div key={activity.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-[#376553]/20 text-[#fea92a] mr-3">
                      {activity.icon || <FiUsers className="text-lg" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-[#efefef]/70">
                        {activity.user || activity.details || 'N/A'} · {activity.time || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-[#18ffc8] font-medium">{activity.amount}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-5 text-[#efefef]/50">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-30 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#fea92a] to-[#855391] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
        onClick={() => {navigate('/punter/create')}}
      >
        <FiPlus className="text-2xl text-[#09100d] group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  )
}

export default PunterDashboard;