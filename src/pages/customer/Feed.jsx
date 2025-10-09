import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import axios from "axios";
import { FaFootballBall, FaChartLine } from "react-icons/fa";
import { FiThumbsUp, FiThumbsDown, FiChevronRight } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import Header from "../customer/Header";
import Api from "../../components/Api";

// Primary Categories
const primaryCategories = [
  { name: "Sports", key: "sports", icon: <FaFootballBall /> },
  { name: "Trading", key: "trading", icon: <FaChartLine /> },
];

const FeedPage = () => {
  const [activePrimary, setActivePrimary] = useState("sports");
  const [allFeedData, setAllFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [likedSignals, setLikedSignals] = useState({});
  const [dislikedSignals, setDislikedSignals] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }
        const response = await axios.post(`${Api}/client/getUser`, { token });
        setUser(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

 useEffect(() => {
  if (!user) return;

  const fetchAllFeed = async () => {
    setLoading(true);
    try {
      const feedResponse = await axios.post(`${Api}/client/getFeed`, {
        userId: user._id,
      });

      // ✅ Process feed to include totalComments and topComment
      const processedFeed = (feedResponse.data?.data || []).map((item) => {
        const comments = item.comments || [];
        const totalComments = comments.length;
        const topComment =
          totalComments > 0 ? comments[comments.length - 1] : null; // latest comment
        return { ...item, totalComments, topComment };
      });

      setAllFeedData(processedFeed);

      // Fetch reactions
      const signalIds = processedFeed.map((s) => s._id);
      const reactionsResponse = await axios.post(
        `${Api}/client/getReaction`,
        { userId: user._id, signalIds }
      );

      setLikedSignals(reactionsResponse.data.likedSignals);
      setDislikedSignals(reactionsResponse.data.dislikedSignals);
    } catch (error) {
      console.error("Error fetching feed data:", error);
      setAllFeedData([]);
      setLikedSignals({});
      setDislikedSignals({});
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  fetchAllFeed();

  // ✅ Auto refresh every 30 seconds
  const interval = setInterval(() => {
    fetchAllFeed();
  }, 30000);

  return () => clearInterval(interval);
}, [user]);

  const handleThumbsClick = async (signalId, type) => {
    if (!user) {
      setError("Please log in to like or dislike signals.");
      return;
    }
    const newFeedData = allFeedData.map((s) => {
      if (s._id === signalId) {
        if (type === "up") {
          if (likedSignals[signalId]) {
            s.thumbsUp -= 1;
            setLikedSignals((prev) => {
              const newState = { ...prev };
              delete newState[signalId];
              return newState;
            });
          } else {
            s.thumbsUp += 1;
            setLikedSignals((prev) => ({ ...prev, [signalId]: true }));
            if (dislikedSignals[signalId]) {
              s.thumbsDown -= 1;
              setDislikedSignals((prev) => {
                const newState = { ...prev };
                delete newState[signalId];
                return newState;
              });
            }
          }
        } else if (type === "down") {
          if (dislikedSignals[signalId]) {
            s.thumbsDown -= 1;
            setDislikedSignals((prev) => {
              const newState = { ...prev };
              delete newState[signalId];
              return newState;
            });
          } else {
            s.thumbsDown += 1;
            setDislikedSignals((prev) => ({ ...prev, [signalId]: true }));
            if (likedSignals[signalId]) {
              s.thumbsUp -= 1;
              setLikedSignals((prev) => {
                const newState = { ...prev };
                delete newState[signalId];
                return newState;
              });
            }
          }
        }
      }
      return s;
    });
    setAllFeedData(newFeedData);

    try {
      const userId = user._id;
      await axios.post(`${Api}/client/updateReaction`, {
        signalId,
        userId,
        type,
      });
    } catch (err) {
      console.error("Failed to update signal reaction:", err);
      setAllFeedData(allFeedData);
      setLikedSignals(likedSignals);
      setDislikedSignals(dislikedSignals);
      setError("Failed to update reaction.");
    }
  };

  const getInitials = (username) => {
    const fInitial = username ? username.charAt(0) : "";
    return `${fInitial}`.toUpperCase();
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

  const getStatusColor = (status) => {
    if (status === "win") return "bg-[#18ffc8]/20 text-[#18ffc8]";
    if (status === "loss") return "bg-[#f57cff]/20 text-[#f57cff]";
    if (status === "active") return "bg-[#fea92a]/20 text-[#fea92a]";
    return "bg-[#376553]/20 text-[#efefef]";
  };

  const getDirectionColor = (direction) => {
    return direction.toLowerCase() === "buy" ||
      direction.toLowerCase() === "long"
      ? "bg-green-900/20 text-green-400"
      : "bg-red-900/20 text-red-400";
  };

  const handlePunterClick = (punterId) => {
    navigate(`/customer/punters`, { state: { punterId: punterId } });
  };

  const navigateToTipDetails = (tipId) => {
    navigate("/customer/tip", { state: { tipId } });
  };

  const renderSportTip = (tip) => (
    <div
      key={tip._id}
      className="relative rounded-xl bg-[#162821] border border-[#376553]/30 p-4 mb-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg text-white">
            {tip.bettingSite || "Sports Tip"}
          </h3>
          <p className="text-sm text-[#efefef]/70 mt-1">
            {tip.createdAt ? formatPostedAt(tip.createdAt) : "Just now"}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize font-bold ${getStatusColor(
            tip.status
          )}`}
        >
          {tip.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-white">
        <div className="text-sm">
          <p className="text-[#efefef]/70">Code</p>
          <p>{tip.bettingCode || "N/A"}</p>
        </div>
        <div className="text-sm">
          <p className="text-[#efefef]/70">Total Odd</p>
          <p>{tip.totalOdd || "N/A"}</p>
        </div>
        <div className="text-sm col-span-2">
          <p className="text-[#efefef]/70">Matches</p>
          {tip.matches?.length > 0 ? (
            tip.matches.map((match, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs bg-[#0f1f1a] p-2 rounded mt-1"
              >
                <span>{match.teams}</span>
                <span className="text-[#18ffc8]">
                  {match.prediction}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No matches listed.</p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1 text-white">
          <span>Confidence Level</span>
          <span>{tip.confidenceLevel || 0}%</span>
        </div>
        <div className="w-full bg-[#376553]/30 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              tip.confidenceLevel >= 80
                ? "bg-[#18ffc8]"
                : tip.confidenceLevel >= 60
                ? "bg-[#fea92a]"
                : "bg-[#f57cff]"
            }`}
            style={{ width: `${tip.confidenceLevel || 0}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-between items-center">
        <div
          className="flex items-center space-x-2 text-sm text-[#efefef]"
          onClick={() => handlePunterClick(tip.punterId)}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-sm font-bold border-2 border-[#18ffc8]">
            {getInitials(tip.punterUsername)}
          </div>
          <span>{tip.punterUsername || "Anonymous"}</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleThumbsClick(tip._id, "up")}
            className={`flex items-center space-x-1 transition ${
              likedSignals[tip._id] ? "text-[#18ffc8]" : "text-gray-400"
            }`}
          >
            <FiThumbsUp size={20} />
            <span className="text-sm">{tip.thumbsUp || 0}</span>
          </button>
          <button
            onClick={() => handleThumbsClick(tip._id, "down")}
            className={`flex items-center space-x-1 transition ${
              dislikedSignals[tip._id] ? "text-red-400" : "text-gray-400"
            }`}
          >
            <FiThumbsDown size={20} />
            <span className="text-sm">{tip.thumbsDown || 0}</span>
          </button>
          <div
            className="flex items-center space-x-1 text-[#fea92a] cursor-pointer"
            onClick={() => navigateToTipDetails(signal._id)}
          >
            <AiOutlineMessage size={16} />
            <span className="text-sm">{tip.totalComments || 0}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#376553]/30">
        {tip.topComment ? (
          <>
            <div className="text-sm mb-2 p-2 bg-[#376553]/20 rounded-lg">
              <p className="font-bold text-[#fea92a] text-xs">
                {tip.topComment.user}
              </p>
              <p className="text-[#efefef]/90 line-clamp-2">
                {tip.topComment.comment}
              </p>
            </div>
            {tip.totalComments > 1 && (
              <button
                onClick={() => navigateToTipDetails(tip._id)}
                className="text-xs font-medium text-[#18ffc8] hover:text-[#18ffc8]/80 flex items-center transition"
              >
                {`See ${tip.totalComments - 1} more comment${
                  tip.totalComments - 1 !== 1 ? "s" : ""
                }`}
                <FiChevronRight size={14} className="ml-1" />
              </button>
            )}
            {tip.totalComments === 1 && (
              <button
                onClick={() => navigateToTipDetails(tip._id)}
                className="text-xs font-medium text-[#18ffc8] hover:text-[#18ffc8]/80 flex items-center transition"
              >
                View Tip Details
                <FiChevronRight size={14} className="ml-1" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-start space-y-2">
            <p className="text-sm text-[#efefef]/70">
              Be the first to comment on this tip!
            </p>
            <button
              onClick={() => navigateToTipDetails(tip._id)}
              className="w-full p-2 text-sm font-medium rounded-md bg-[#376553]/50 text-[#efefef] hover:bg-[#376553] flex justify-between items-center transition"
            >
              Drop a comment...
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTradingSignal = (signal) => (
    <div
      key={signal._id}
      className="relative rounded-xl bg-[#162821] border border-[#376553]/30 p-4 mb-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg text-white">
            {signal.pair || "Trading Signal"}
          </h3>
          <p className="text-sm text-[#efefef]/70 mt-1">
            {signal.createdAt ? formatPostedAt(signal.createdAt) : "Just now"}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize font-bold ${getStatusColor(
            signal.status
          )}`}
        >
          {signal.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-white">
        <div className="text-sm">
          <p className="text-[#efefef]/70">Direction</p>
          <p className={`font-bold ${getDirectionColor(signal.direction)}`}>
            {signal.direction || "N/A"}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-[#efefef]/70">Entry</p>
          <p>{signal.entryPrice || "N/A"}</p>
        </div>
        <div className="text-sm">
          <p className="text-[#efefef]/70">Take Profit</p>
          <p className="text-[#18ffc8]">{signal.takeProfit || "N/A"}</p>
        </div>
        <div className="text-sm">
          <p className="text-[#efefef]/70">Stop Loss</p>
          <p className="text-[#f57cff]">{signal.stopLoss || "N/A"}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1 text-white">
          <span>Confidence Level</span>
          <span>{signal.confidenceLevel || 0}%</span>
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
            style={{ width: `${signal.confidenceLevel || 0}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-[#efefef]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-sm font-bold border-2 border-[#18ffc8]">
            {getInitials(signal.punterUsername)}
          </div>
          <span>{signal.punterUsername || "Anonymous"}</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleThumbsClick(signal._id, "up")}
            className={`flex items-center space-x-1 transition ${
              likedSignals[signal._id] ? "text-[#18ffc8]" : "text-gray-400"
            }`}
          >
            <FiThumbsUp size={20} />
            <span className="text-sm">{signal.thumbsUp || 0}</span>
          </button>
          <button
            onClick={() => handleThumbsClick(signal._id, "down")}
            className={`flex items-center space-x-1 transition ${
              dislikedSignals[signal._id] ? "text-red-400" : "text-gray-400"
            }`}
          >
            <FiThumbsDown size={20} />
            <span className="text-sm">{signal.thumbsDown || 0}</span>
          </button>
          <div
            className="flex items-center space-x-1 text-[#fea92a] cursor-pointer"
            onClick={() => navigateToTipDetails(signal._id)}
          >
            <AiOutlineMessage size={16} />
            <span className="text-sm">{signal.totalComments || 0}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#376553]/30">
        {signal.topComment ? (
          <>
            <div className="text-sm mb-2 p-2 bg-[#376553]/20 rounded-lg">
              <p className="font-bold text-[#fea92a] text-xs">
                {signal.topComment.user}
              </p>
              <p className="text-[#efefef]/90 line-clamp-2">
                {signal.topComment.comment}
              </p>
            </div>
            {signal.totalComments > 1 && (
              <button
                onClick={() => navigateToTipDetails(signal._id)}
                className="text-xs font-medium text-[#18ffc8] hover:text-[#18ffc8]/80 flex items-center transition"
              >
                {`See ${signal.totalComments - 1} more comment${
                  signal.totalComments - 1 !== 1 ? "s" : ""
                }`}
                <FiChevronRight size={14} className="ml-1" />
              </button>
            )}
            {signal.totalComments === 1 && (
              <button
                onClick={() => navigateToTipDetails(signal._id)}
                className="text-xs font-medium text-[#18ffc8] hover:text-[#18ffc8]/80 flex items-center transition"
              >
                View Tip Details
                <FiChevronRight size={14} className="ml-1" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-start space-y-2">
            <p className="text-sm text-[#efefef]/70">
              Be the first to comment on this tip!
            </p>
            <button
              onClick={() => navigateToTipDetails(signal._id)}
              className="w-full p-2 text-sm font-medium rounded-md bg-[#376553]/50 text-[#efefef] hover:bg-[#376553] flex justify-between items-center transition"
            >
              Drop a comment...
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeedContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-400">Loading feed...</div>
      );
    }
    const filteredFeedData = allFeedData.filter(
      (item) => item.primaryCategory === activePrimary
    );
    if (
      !filteredFeedData ||
      !Array.isArray(filteredFeedData) ||
      filteredFeedData.length === 0
    ) {
      return (
        <div className="text-center py-8 text-gray-400">
          No {activePrimary === "sports" ? "tips" : "signals"} available right
          now.
        </div>
      );
    }
    if (activePrimary === "sports") {
      return filteredFeedData.map((tip) => renderSportTip(tip));
    } else {
      return filteredFeedData.map((signal) => renderTradingSignal(signal));
    }
  };

  return (
    <div className="bg-[#0a120e] min-h-screen text-white px-4 py-6 pb-20">
      <Header />
      <div className="flex border-b border-[#2a3a34] mb-4">
        {primaryCategories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActivePrimary(category.key)}
            className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 text-sm ${
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
      <div className="space-y-6">{renderFeedContent()}</div>
    </div>
  );
};

export default FeedPage;
