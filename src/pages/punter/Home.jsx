import React, { useState, useEffect } from "react";
import { FiUsers, FiDollarSign, FiBarChart2 } from "react-icons/fi";
import { IoIosInformationCircleOutline } from "react-icons/io";
import Header from "./Header";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/logo2.png";
import { FaCoins } from "react-icons/fa";

const PunterDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        // Fetch user data
        const userResponse = await axios.post(`${Api}/client/getUser`, {
          token,
        });
        const userData = userResponse.data.data;
        setUser(userData);

        // --- NEW API CALL FOR WIN/LOSS STATS ---
        const punterId = userData._id;
        const statsResponse = await axios.post(`${Api}/client/winloss`, {
          punterId,
        });
        const { wins, losses } = statsResponse.data;
        const winRateValue =
          wins + losses > 0
            ? ((wins / (wins + losses)) * 100).toFixed(0) + "%"
            : "0%";
        // --- END OF NEW API CALL ---

        // --- NEW API CALL FOR EARNINGS ---
        const earningsResponse = await axios.post(
          `${Api}/client/getTransaction`,
          { userId: userData._id }
        );
        const paymentTransactions = earningsResponse.data.transactions.filter(
          (t) => t.type === "payment"
        );
        const totalEarnings = paymentTransactions
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(1);
        // --- END OF NEW API CALL ---

        const subscribersCount = userData.subscribers?.length || 0;

        setStats([
          {
            title: "Total Subscribers",
            value: subscribersCount,
            change: "+12%",
            icon: <FiUsers className="text-xl" />,
          },
          {
            title: "Total Earnings",
            value: `${totalEarnings}`,
            change: "+18%",
            icon: <FaCoins className="text-xl" />,
          },
          {
            title: "Win Rate",
            value: winRateValue,
            change: "+3%",
            icon: <FiBarChart2 className="text-xl" />,
          },
        ]);

        // Fetch recent notifications using user ID
        const notificationsResponse = await axios.post(
          `${Api}/client/getNotification`,
          { userId: userData._id }
        );
        const notifications = notificationsResponse.data.notifications ?? [];

        // Process notifications for display (top 5 only)
        const recentNotifications = notifications.slice(0, 5).map((note) => ({
          ...note,
          action: note.title,
          details: note.description,
          time: formatPostedAt(note.createdAt),
          amount: note.amount > 0 ? `+${note.amount.toFixed(2)}` : null,
          icon: getNotificationIcon(note.type),
        }));

        setRecentActivity(recentNotifications);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
      default:
        return <IoIosInformationCircleOutline className="text-gray-400" />;
    }
  };

  const formatPostedAt = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postedDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center">
        {/* Arcs + Logo */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-[15rem] h-[15rem] flex items-center justify-center">
            {/* ... (Your SVG and logo JSX here) */}
            <svg
              className="absolute w-full h-full spin-slow"
              viewBox="0 0 100 100"
            >
              <path
                d="M50,0 A50,50 0 1,1 0,50"
                fill="none"
                stroke="#fea92a"
                strokeWidth="4"
                strokeLinecap="round"
                className="glow-stroke"
              />
            </svg>
            <svg
              className="absolute w-[13rem] h-[13rem] spin-medium"
              viewBox="0 0 100 100"
            >
              <path
                d="M50,0 A50,50 0 1,1 0,50"
                fill="none"
                stroke="#855391"
                strokeWidth="4"
                strokeLinecap="round"
                className="glow-stroke"
              />
            </svg>
            <div className="relative flex items-center justify-center w-[10rem] h-[10rem] p-6 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
              <img
                src={logoImage}
                alt="Platform Logo"
                className="max-w-full max-h-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const username = user?.username || "Guest";

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-6">
      <Header />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome,{" "}
              <span className="font-medium text-[#fea92a]">{username}</span>
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30 hover:border-[#fea92a]/30 transition-all"
            >
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
        <div className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-sm text-[#fea92a] hover:underline" onClick={() => navigate('/punter/notifications')}>
              View All
            </button>
          </div>
          <div className="divide-y divide-[#376553]/30">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-[#376553]/20 text-[#fea92a] mr-3">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-[#efefef]/70">
                        {activity.details} · {activity.time}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-[#18ffc8] font-medium">
                      {activity.amount}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-5 text-[#efefef]/50">
                No recent activity found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunterDashboard;
