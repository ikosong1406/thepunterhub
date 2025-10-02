import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import Api from "../../components/Api";
import { formatDistanceToNow, addDays } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

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
  const [winRate, setWinRate] = useState("0%");
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [likedSignals, setLikedSignals] = useState({});
  const [dislikedSignals, setDislikedSignals] = useState({});
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);

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
              const newState = { ...prev };
              delete newState[signalId];
              return newState;
            });
          } else {
            s.thumbsUpCount += 1;
            setLikedSignals((prev) => ({ ...prev, [signalId]: true }));
            if (dislikedSignals[signalId]) {
              s.thumbsDownCount -= 1;
              setDislikedSignals((prev) => {
                const newState = { ...prev };
                delete newState[signalId];
                return newState;
              });
            }
          }
        } else if (type === "down") {
          if (dislikedSignals[signalId]) {
            s.thumbsDownCount -= 1;
            setDislikedSignals((prev) => {
              const newState = { ...prev };
              delete newState[signalId];
              return newState;
            });
          } else {
            s.thumbsDownCount += 1;
            setDislikedSignals((prev) => ({ ...prev, [signalId]: true }));
            if (likedSignals[signalId]) {
              s.thumbsUpCount -= 1;
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
      setSignals(signals);
      setLikedSignals((prev) => {
        const newState = { ...prev };
        if (type === "up") delete newState[signalId];
        return newState;
      });
      setDislikedSignals((prev) => {
        const newState = { ...prev };
        if (type === "down") delete newState[signalId];
        return newState;
      });
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
        const subDate = new Date(response.data.subscription.subscriptionDate);
        setExpiryDate(addDays(subDate, 7));
        setUser((prevUser) => ({
          ...prevUser,
          balance: response.data.newBalance,
        }));
        toast.success(response.data.message, { id: subscriptionToastId });
      } else {
        toast.error("Subscription failed. Please try again.", {
          id: subscriptionToastId,
        });
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error(
        err.response?.data?.message || "An error occurred during subscription.",
        { id: subscriptionToastId }
      );
    } finally {
      setProcessingSubscription(false);
    }
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

        const subResponse = await axios.post(
          `${Api}/client/isSubscribed`,
          data
        );
        setIsSubscribed(subResponse.data.isSubscribed);

        if (subResponse.data.isSubscribed) {
          const subDate = new Date(
            subResponse.data.subscription.subscriptionDate
          );
          setExpiryDate(addDays(subDate, 7));
        }

        const statsResponse = await axios.post(`${Api}/client/winloss`, {
          punterId,
        });
        const { wins, losses } = statsResponse.data;
        setWins(wins);
        setLosses(losses);
        setWinRate(
          wins + losses > 0
            ? `${((wins / (wins + losses)) * 100).toFixed(0)}%`
            : "0%"
        );

        const punterResponse = await axios.post(
          `${Api}/client/getPunterdetails`,
          {
            punterId,
          }
        );
        setPunter(punterResponse.data.data.punter);
        setSignals(punterResponse.data.data.signals);

        const reactionsResponse = await axios.post(
          `${Api}/client/getReaction`,
          {
            userId: userData._id,
            signalIds: punterResponse.data.data.signals.map((s) => s._id),
          }
        );
        setLikedSignals(reactionsResponse.data.likedSignals);
        setDislikedSignals(reactionsResponse.data.dislikedSignals);

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

  const pinnedSignals = signals.filter((signal) => signal.isPinned);
  const unpinnedSignals = signals.filter((signal) => !signal.isPinned);
  const sortedSignals = [...pinnedSignals, ...unpinnedSignals];

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
              {formatPostedAt(signal.createdAt)}
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
        <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-between space-x-4">
          <div className="flex space-x-4">
            <button
              onClick={() => handleThumbsClick(signal._id, "up")}
              className={`flex items-center space-x-1 ${
                isLiked ? "text-green-400" : "text-gray-500"
              }`}
              disabled={!user}
            >
              <FiThumbsUp size={16} />
              <span className="text-sm">{signal.thumbsUp || 0}</span>
            </button>

            <button
              onClick={() => handleThumbsClick(signal._id, "down")}
              className={`flex items-center space-x-1 ${
                isDisliked ? "text-red-400" : "text-gray-500"
              }`}
              disabled={!user}
            >
              <FiThumbsDown size={16} />
              <span className="text-sm">{signal.thumbsDown || 0}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const pricingPlans = punter.pricingPlans || {};

  return (
    <div className="min-h-screen bg-[#09100d] text-white">
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

      <div className="p-6">
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
                <div key={signal._id}>{renderSignalCard(signal)}</div>
              ))}
            </Slider>
          </div>
        )}

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
                {sortedSignals.length > 0 ? (
                  sortedSignals.map((signal) => (
                    <div key={signal._id}>{renderSignalCard(signal)}</div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">
                    No signals available.
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
