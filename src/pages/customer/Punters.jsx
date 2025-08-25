import React, { useState, useEffect } from "react";
import axios from "axios";
import localforage from "localforage";
import { useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaStar,
  FaChartLine,
  FaHistory,
  FaMoneyBillWave,
  FaUserFriends,
  FaArrowLeft,
  FaThumbtack,
} from "react-icons/fa";
import { FiThumbsUp, FiThumbsDown, FiEdit, FiTrash2 } from "react-icons/fi";
import { MdPushPin } from "react-icons/md";
import Api from "../../components/Api";

const PunterDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { punterId } = location.state || {};

  const [user, setUser] = useState(null);
  const [punter, setPunter] = useState(null);
  const [signals, setSignals] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper functions for formatting and styling
  const formatPostedAt = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    if (status === "win") return "bg-[#18ffc8]/20 text-[#18ffc8]";
    if (status === "loss") return "bg-[#f57cff]/20 text-[#f57cff]";
    if (status === "active") return "bg-[#fea92a]/20 text-[#fea92a]";
    return "bg-[#376553]/20 text-[#efefef]";
  };

  const getDirectionColor = (direction) => {
    return direction.toLowerCase() === "buy"
      ? "bg-green-900/20 text-green-400"
      : "bg-red-900/20 text-red-400";
  };

  const getInitials = (username) => {
    const fInitial = username ? username.charAt(0) : "";
    return `${fInitial}`.toUpperCase();
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!punterId) {
        setError("Punter ID not provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const userResponse = await axios.post(`${Api}/client/getUser`, {
          token,
        });
        const userData = userResponse.data.data;
        setUser(userData);

        const data = {
          userId: userData._id,
          punterId: punterId,
        };

        const subResponse = await axios.post(`${Api}/client/isSubscribed`, data);
        setIsSubscribed(subResponse.data.isSubscribed);

        const punterResponse = await axios.post(`${Api}/client/getPunterdetails`, {
          punterId,
        });
        setPunter(punterResponse.data.data.punter);
        setSignals(punterResponse.data.data.signals);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "An error occurred while fetching punter data.");
        setLoading(false);
      }
    };

    fetchAllData();
  }, [punterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09100d] text-white p-6 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09100d] text-red-400 p-6 text-center">
        Error: {error}
      </div>
    );
  }

  if (!punter) {
    return (
      <div className="min-h-screen bg-[#09100d] text-red-400 p-6 text-center">
        Punter not found.
      </div>
    );
  }

  const winRate =
    punter.win && punter.loss
      ? (punter.win / (punter.win + punter.loss)) * 100
      : 0;

  const pinnedSignals = signals.filter((signal) => signal.isPinned);
  const unpinnedSignals = signals.filter((signal) => !signal.isPinned);

const sliderSettings = {
  dots: true,
  infinite: pinnedSignals.length > 1,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  autoplay: true, // Enable automatic sliding
  autoplaySpeed: 3000, // Set the speed to 3 seconds (3000 milliseconds)
};

  const renderSignalCard = (signal) => (
    <div
      key={signal._id}
      className="relative rounded-xl bg-[#162821] border border-[#376553]/30 p-4"
    >
      <div className="flex justify-between items-start">
        <div>
          {signal.primaryCategory === "sports" ? (
            <h3 className="font-medium">{signal.bettingSite}</h3>
          ) : (
            <div className="flex items-center">
              <h3 className="font-medium mr-2">{signal.pair}</h3>
              {signal.direction && (
                <span className={`px-2 py-0.5 rounded text-xs ${getDirectionColor(signal.direction)}`}>
                  {signal.direction.toUpperCase()}
                </span>
              )}
            </div>
          )}
          <p className="text-sm text-[#efefef]/70 mt-1">
            {formatPostedAt(signal.createdAt)}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(signal.status, signal.result)}`}
        >
          {signal.result || signal.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {signal.primaryCategory !== "sports" ? (
          <>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Entry</p>
              <p>{signal.entryPrice}</p>
            </div>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Take Profit</p>
              <p className="text-[#18ffc8]">{signal.takeProfit}</p>
            </div>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Stop Loss</p>
              <p className="text-[#f57cff]">{signal.stopLoss}</p>
            </div>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Time Frame</p>
              <p>{signal.timeFrame}</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Site</p>
              <p>{signal.bettingSite}</p>
            </div>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Code</p>
              <p>{signal.bettingCode}</p>
            </div>
            <div className="text-sm">
              <p className="text-[#efefef]/70">Total Odd</p>
              <p>{signal.totalOdd}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Confidence Level</span>
          <span>{signal.confidenceLevel}%</span>
        </div>
        <div className="w-full bg-[#376553]/30 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              signal.confidenceLevel >= 80
                ? "bg-[#18ffc8]"
                : signal.confidenceLevel >= 60
                ? "bg-[#fea92a]"
                : "bg-[#f57cff]"
            }`}
            style={{ width: `${signal.confidenceLevel}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-between space-x-4">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1 text-green-400">
            <FiThumbsUp size={16} />
            <span className="text-sm">{signal.thumbsUpCount || 0}</span>
          </div>

          <div className="flex items-center space-x-1 text-red-400">
            <FiThumbsDown size={16} />
            <span className="text-sm">{signal.thumbsDownCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09100d] text-white">
      <div className="p-4 border-b border-[#2a3a34] flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-[#162821]"
        >
          <FaArrowLeft className="text-[#18ffc8]" />
        </button>
        <h1 className="text-xl font-bold">Punter Details</h1>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="relative mr-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-3xl font-bold border-2 border-[#18ffc8]">
              {getInitials(punter.username)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {punter.username}
            </h2>
            <p className="text-[#18ffc8]">
              {punter.primaryCategory} - {punter.secondaryCategory}
            </p>
            <div className="flex items-center mt-1">
              <FaStar className="text-[#fea92a] mr-1" />
              <span>{punter.rating || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-green-400 font-bold text-xl">
              {punter.win || 0}
            </div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-red-400 font-bold text-xl">
              {punter.loss || 0}
            </div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-[#18ffc8] font-bold text-xl">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
        </div>

        {pinnedSignals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FaThumbtack className="mr-2 text-[#f57cff]" />
              Pinned Signals
            </h3>
            <Slider {...sliderSettings} className="px-4 -mx-4">
              {pinnedSignals.map((signal) => (
                <div key={signal._id}>{renderSignalCard(signal)}</div>
              ))}
            </Slider>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 flex items-center">
            <FaHistory className="mr-2 text-[#fea92a]" />
            Recent Signals
          </h3>
          {isSubscribed ? (
            <div className="space-y-3">
              {unpinnedSignals.length > 0 ? (
                unpinnedSignals.map((signal) => (
                  <div key={signal._id}>{renderSignalCard(signal)}</div>
                ))
              ) : (
                <div className="text-center text-gray-400">
                  No recent signals available.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[#162821] rounded-lg text-center">
              <p className="mb-4 text-gray-300">
                Subscribe to view all recent signals.
              </p>
              <button className="w-full bg-[#f57cff] text-black font-bold py-3 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="mr-2" />
                Subscribe for {punter.price || "N/A"}/week
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PunterDetailsPage;