import React, { useState, useEffect } from "react";
import axios from "axios";
import localforage from "localforage";
import { useNavigate } from "react-router-dom";
import { IoIosInformationCircleOutline, IoMdArrowBack } from "react-icons/io";
import { FiDollarSign } from "react-icons/fi";
import { FaRegBell } from "react-icons/fa";
import Header from "./Header"; // Assuming Header is in the same directory or accessible

// NOTE: You'll need to ensure 'Api' is correctly imported/defined in your actual file structure
// For this example, I'll assume Api is available globally or passed in if not imported
import Api from "../../components/Api";
import logoImage from "../../assets/logo2.png"; // Re-using the logo for the loading state

const PunterNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function from PunterDashboard
  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment":
        return <FiDollarSign className="text-xl" />;
      case "info":
      default:
        return <IoIosInformationCircleOutline className="text-gray-400 text-xl" />;
    }
  };

  // Helper function from PunterDashboard
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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        // Fetch user data to get the userId
        const userResponse = await axios.post(`${Api}/client/getUser`, {
          token,
        });
        const userId = userResponse.data.data._id;

        // Fetch all notifications using user ID
        const notificationsResponse = await axios.post(
          `${Api}/client/getNotification`,
          { userId }
        );

        const fetchedNotifications = notificationsResponse.data.notifications ?? [];

        // Process notifications for display
        const processedNotifications = fetchedNotifications.map((note) => ({
          ...note,
          action: note.title,
          details: note.description,
          time: formatPostedAt(note.createdAt),
          amount: note.amount > 0 ? `+${note.amount.toFixed(2)}` : null,
          icon: getNotificationIcon(note.type),
        }));

        // Sort by creation date (newest first)
        processedNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setNotifications(processedNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError(err.message || "Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center">
        {/* Re-using the custom loader from the dashboard */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-[15rem] h-[15rem] flex items-center justify-center">
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

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] flex justify-center items-center">
        <div className="text-center p-6 bg-red-900/20 rounded-lg">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="mt-2 text-red-300">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#fea92a] text-[#09100d] font-semibold rounded-lg hover:bg-[#ffc663] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-6">
      <Header />
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center mb-6 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="text-[#fea92a] hover:text-[#ffc663] transition-colors mr-4 p-2 rounded-full hover:bg-[#162821]"
            aria-label="Go back to dashboard"
          >
            <IoMdArrowBack className="text-2xl" />
          </button>
          <h1 className="text-xl font-bold flex items-center">
            All Notifications
          </h1>
        </div>

        <div className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30">
          <div className="divide-y divide-[#376553]/30">
            {notifications.length > 0 ? (
              notifications.map((activity, index) => (
                <div
                  key={index}
                  className="py-4 flex justify-between items-center"
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-[#376553]/20 text-[#fea92a] mr-4 flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-[#efefef]/70 mt-1">
                        {activity.details}
                      </p>
                      <p className="text-xs text-[#efefef]/50 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-[#18ffc8] font-semibold flex-shrink-0 ml-4">
                      {activity.amount}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-[#efefef]/50 text-lg">
                🎉 All caught up! No notifications yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunterNotifications;