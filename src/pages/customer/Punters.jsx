import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import localforage from "localforage";
import { useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  FaArrowLeft,
  FaThumbtack,
  FaHistory,
  FaMoneyBillWave,
}
from "react-icons/fa";
import { FiThumbsUp, FiThumbsDown, FiChevronRight } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import Api from "../../components/Api";
import { formatDistanceToNow, addDays } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import logoImage from "../../assets/logo2.png";

const PunterDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { punterId } = location.state || {};

  const [user, setUser] = useState(null);
  const [punter, setPunter] = useState(null);
  const [signals, setSignals] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activePlanName, setActivePlanName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winRate, setWinRate] = useState("0%");
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [likedSignals, setLikedSignals] = useState({});
  const [dislikedSignals, setDislikedSignals] = useState({});
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);

  // Formats a date string into a relative time string (e.g., "about 2 hours ago").
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true
    });
  };

  const getStatusColor = (status) => {
    if (status === "win") return "bg-[#18ffc8]/20 text-[#18ffc8]";
    if (status === "loss") return "bg-[#f57cff]/20 text-[#f57cff]";
    if (status === "active") return "bg-[#fea92a]/20 text-[#fea92a]";
    return "bg-[#376553]/20 text-[#efefef]";
  };

  const getDirectionColor = (direction) => {
    return direction?.toLowerCase() === "buy" ?
      "bg-green-900/20 text-green-400" :
      "bg-red-900/20 text-red-400";
  };

  const getInitials = (username) => {
    const fInitial = username ? username.charAt(0) : "";
    return `${fInitial}`.toUpperCase();
  };

  const handleThumbsClick = async (signalId, type) => {
    if (!user) {
      toast.error("Please log in to like or dislike signals.");
      return;
    }

    const newSignals = signals.map((s) => {
      if (s._id === signalId) {
        if (type === "up") {
          if (likedSignals[signalId]) {
            s.thumbsUpCount -= 1;
            setLikedSignals((prev) => {
              const newState = { ...prev
              };
              delete newState[signalId];
              return newState;
            });
          } else {
            s.thumbsUpCount = (s.thumbsUpCount || s.thumbsUp) + 1;
            setLikedSignals((prev) => ({
              ...prev,
              [signalId]: true
            }));
            if (dislikedSignals[signalId]) {
              s.thumbsDownCount = (s.thumbsDownCount || s.thumbsDown) - 1;
              setDislikedSignals((prev) => {
                const newState = { ...prev
                };
                delete newState[signalId];
                return newState;
              });
            }
          }
        } else if (type === "down") {
          if (dislikedSignals[signalId]) {
            s.thumbsDownCount = (s.thumbsDownCount || s.thumbsDown) - 1;
            setDislikedSignals((prev) => {
              const newState = { ...prev
              };
              delete newState[signalId];
              return newState;
            });
          } else {
            s.thumbsDownCount = (s.thumbsDownCount || s.thumbsDown) + 1;
            setDislikedSignals((prev) => ({
              ...prev,
              [signalId]: true
            }));
            if (likedSignals[signalId]) {
              s.thumbsUpCount = (s.thumbsUpCount || s.thumbsUp) - 1;
              setLikedSignals((prev) => {
                const newState = { ...prev
                };
                delete newState[signalId];
                return newState;
              });
            }
          }
        }
      }
      return s;
    });
    setSignals(newSignals);

    try {
      const userId = user._id;
      await axios.post(`${Api}/client/updateReaction`, {
        signalId,
        userId,
        type,
      });
    } catch (err) {
      console.error("Failed to update signal reaction:", err);
      toast.error("Failed to update reaction.");
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please log in to subscribe.");
      navigate("/login");
      return;
    }

    if (!selectedPlan) {
      toast.error("Please select a pricing plan.");
      return;
    }

    const totalBalance = (user.balance || 0) + (user.promoBalance || 0);
    if (totalBalance < selectedPlan.price) {
      toast.error("Insufficient balance. Please top up your account.");
      return;
    }

    const subscriptionToastId = toast.loading(
      "Processing your subscription..."
    );
    setProcessingSubscription(true);

    try {
      const userId = user._id;
      const punterId = punter._id;
      const plan = selectedPlan.name;
      const price = selectedPlan.price;

      const response = await axios.post(`${Api}/client/subscribe`, {
        userId,
        punterId,
        plan,
        price,
      });

      if (response.status === 200) {
        setIsSubscribed(true);
        setActivePlanName(response.data.subscription.plan);
        const subDate = new Date(response.data.subscription.subscriptionDate);
        setExpiryDate(addDays(subDate, 7));
        setUser((prevUser) => ({
          ...prevUser,
          balance: response.data.newBalance,
        }));
        toast.success(response.data.message, {
          id: subscriptionToastId
        });
      } else {
        toast.error("Subscription failed. Please try again.", {
          id: subscriptionToastId,
        });
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error(
        err.response?.data?.message || "An error occurred during subscription.", {
          id: subscriptionToastId
        }
      );
    } finally {
      setProcessingSubscription(false);
    }
  };

  const navigateToTipDetails = (tipId) => {
    navigate("/customer/tip", {
      state: {
        tipId
      }
    });
  };

  // Memoize the sorting logic: Pinned signals (for slider) and Unpinned signals (for the list)
  const pinnedSignals = useMemo(() => {
    return signals.filter((signal) => signal.isPinned);
  }, [signals]);

  const unpinnedSignals = useMemo(() => {
    // 1. Filter out pinned signals
    const unpinned = signals.filter((signal) => !signal.isPinned);

    // 2. Sort unpinned signals from newest (largest createdAt date) to oldest
    return unpinned.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [signals]);


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
        let userResponse = null;
        let userData = null;
        let planToSend = null;

        if (token) {
          userResponse = await axios.post(`${Api}/client/getUser`, {
            token,
          });
          userData = userResponse.data.data;
          setUser(userData);

          const subResponse = await axios.post(`${Api}/client/isSubscribed`, {
            userId: userData._id,
            punterId: punterId,
          });

          setIsSubscribed(subResponse.data.isSubscribed);

          if (subResponse.data.isSubscribed) {
            planToSend = subResponse.data.plan;
            setActivePlanName(planToSend);

            const subDate = new Date(
              subResponse.data.subscription.subscriptionDate
            );
            setExpiryDate(addDays(subDate, 7));
          }
        }

        // Get Punter details and signals
        const punterResponse = await axios.post(
          `${Api}/client/getPunterdetails`, {
            punterId,
            plan: planToSend,
          }
        );

        const statsResponse = await axios.post(`${Api}/client/winloss`, {
          punterId,
        });
        const {
          wins,
          losses
        } = statsResponse.data;
        setWins(wins);
        setLosses(losses);
        setWinRate(
          wins + losses > 0 ?
          `${((wins / (wins + losses)) * 100).toFixed(0)}%` :
          "0%"
        );

        const fetchedSignals = punterResponse.data.data.signals.map((s) => {
          const totalComments = s.comments?.length || 0;
          const topComment =
            totalComments > 0 ?
            {
              user: s.comments[0].user?.username ||
                s.comments[0].user ||
                "User",
              comment: s.comments[0].comment,
            } :
            null;

          return {
            ...s,
            commentCount: totalComments,
            totalComments: totalComments,
            topComment: topComment,
            thumbsUpCount: s.thumbsUp || 0,
            thumbsDownCount: s.thumbsDown || 0,
          };
        });

        setPunter(punterResponse.data.data.punter);
        setSignals(fetchedSignals);

        if (userData?._id) {
          const reactionsResponse = await axios.post(
            `${Api}/client/getReaction`, {
              userId: userData._id,
              signalIds: fetchedSignals.map((s) => s._id),
            }
          );
          setLikedSignals(reactionsResponse.data.likedSignals);
          setDislikedSignals(reactionsResponse.data.dislikedSignals);
        }

        if (punterResponse.data.data.punter.pricingPlans?.silver) {
          setSelectedPlan({
            name: "silver",
            ...punterResponse.data.data.punter.pricingPlans.silver,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          err.message || "An error occurred while fetching punter data."
        );
        setLoading(false);
      }
    };

    fetchAllData();
  }, [punterId]);

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

  const sliderSettings = {
    dots: true,
    infinite: pinnedSignals.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const renderSignalCard = (signal) => {
    const isLiked = likedSignals[signal._id];
    const isDisliked = dislikedSignals[signal._id];

    return (
      <div
        key={signal._id}
        className="relative rounded-xl bg-[#162821] border border-[#376553]/30 p-2"
      >
        <div
          onClick={() => navigateToTipDetails(signal._id)}
          className="cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              {signal.primaryCategory === "sports" ? (
                <h3 className="font-medium">{signal.bettingSite}</h3>
              ) : (
                <div className="flex items-center">
                  <h3 className="font-medium mr-2">{signal.pair}</h3>
                  {signal.direction && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getDirectionColor(
                        signal.direction
                      )}`}
                    >
                      {signal.direction.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm text-[#efefef]/70 mt-1">
                {formatRelativeTime(signal.createdAt)}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(
                signal.status,
                signal.result
              )}`}
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
        </div>
        <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-between space-x-4">
          <div className="flex space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleThumbsClick(signal._id, "up");
              }}
              className={`flex items-center space-x-1 ${
                isLiked ? "text-green-400" : "text-gray-500"
              }`}
              disabled={!user}
            >
              <FiThumbsUp size={16} />
              <span className="text-sm">
                {signal.thumbsUpCount || signal.thumbsUp || 0}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleThumbsClick(signal._id, "down");
              }}
              className={`flex items-center space-x-1 ${
                isDisliked ? "text-red-400" : "text-gray-500"
              }`}
              disabled={!user}
            >
              <FiThumbsDown size={16} />
              <span className="text-sm">
                {signal.thumbsDownCount || signal.thumbsDown || 0}
              </span>
            </button>
          </div>
          <div
            className="flex items-center space-x-1 text-[#fea92a] cursor-pointer"
            onClick={() => navigateToTipDetails(signal._id)}
          >
            <AiOutlineMessage size={16} />
            <span className="text-sm">{signal.totalComments || 0}</span>
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
  };

  const pricingPlans = punter.pricingPlans || {};

  return (
    // min-h-screen, flex, and flex-col for the full-screen container
    <div className="min-h-screen bg-[#09100d] text-white flex flex-col">
      <Toaster />
      <div className="p-4 border-b border-[#2a3a34] flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-[#162821]"
        >
          <FaArrowLeft className="text-[#18ffc8]" />
        </button>
        <h1 className="text-xl font-bold">Punter Details</h1>
      </div>

      {/* FIXED CONTENT AREA: Flex-grow-0 ensures this area doesn't take up extra space */}
      <div className="p-6 flex-grow-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-3xl font-bold border-2 border-[#18ffc8]">
                {getInitials(punter.username)}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                {punter.username}
                {punter.isVerified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 ml-2 text-blue-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.69a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </h2>
              <p className="text-[#18ffc8]">
                {punter.primaryCategory} - {punter.secondaryCategory}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-green-400 font-bold text-xl">{wins}</div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-red-400 font-bold text-xl">{losses}</div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
          <div className="bg-[#162821] p-3 rounded-lg text-center">
            <div className="text-[#18ffc8] font-bold text-xl">{winRate}</div>
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
                <div key={signal._id} className="p-1">
                  {renderSignalCard(signal)}
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      {/* SCROLLABLE CONTENT AREA: Flex-grow-1 ensures this area fills the remaining space */}
      <div className="flex-grow overflow-y-auto p-6 pt-0">
        <div className="mb-6">
          {isSubscribed ? (
            <>
              {expiryDate && (
                <div className="text-center text-sm text-[#fea92a] mb-4">
                  Subscription expires{" "}
                  {formatDistanceToNow(expiryDate, { addSuffix: true })}.
                </div>
              )}
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <FaHistory className="mr-2 text-[#fea92a]" />
                All Signals
              </h3>
              <div className="space-y-3">
                {/* Now only contains UNPINNED signals, sorted by newest */}
                {unpinnedSignals.length > 0 ? (
                  unpinnedSignals.map((signal) => (
                    <div key={signal._id}>{renderSignalCard(signal)}</div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">
                    No unpinned signals available.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between space-x-2 mb-4">
                {Object.entries(pricingPlans).map(([planName, planDetails]) => (
                  <button
                    key={planName}
                    onClick={() =>
                      setSelectedPlan({
                        name: planName,
                        ...planDetails,
                      })
                    }
                    className={`flex-1 py-3 px-2 rounded-lg capitalize font-medium ${
                      selectedPlan?.name === planName
                        ? "bg-[#f57cff] text-black"
                        : "bg-[#162821] text-gray-300"
                    }`}
                  >
                    {planName}
                  </button>
                ))}
              </div>
              {selectedPlan && (
                <div className="p-4 bg-[#162821] rounded-lg">
                  <h4 className="text-lg font-bold capitalize mb-2">
                    {selectedPlan.name} Plan
                  </h4>
                  <p className="text-xl font-bold mb-4 text-[#18ffc8]">
                    {selectedPlan.price}
                    <span className="text-sm text-gray-400">/week</span>
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
                    {selectedPlan.offers && selectedPlan.offers.length > 0 ? (
                      selectedPlan.offers.map((offer, index) => (
                        <li key={index}>{offer}</li>
                      ))
                    ) : (
                      <li>No offers listed.</li>
                    )}
                  </ul>
                  <button
                    onClick={handleSubscribe}
                    disabled={processingSubscription}
                    className="w-full bg-[#f57cff] text-black font-bold py-3 rounded-lg flex items-center justify-center"
                  >
                    {processingSubscription ? (
                      "Processing..."
                    ) : (
                      <>
                        <FaMoneyBillWave className="mr-2" />
                        Subscribe for {selectedPlan.price}/week
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PunterDetailsPage;