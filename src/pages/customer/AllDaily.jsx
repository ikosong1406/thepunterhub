import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast"; // Import Toaster and toast
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  FaClock,
  FaCopy,
  FaBookmark,
  FaArrowUp,
  FaArrowDown,
  FaLock,
  FaHistory, // New icon for "My Tips" page
} from "react-icons/fa";
import Header from "./Header";
import Api from "../../components/Api";
import logoImage from "../../assets/logo2.png";

// --- END CONFIGURATION ---

// Helper function for Punter initials (Reused from DailyBread)
const getPunterInitials = (name) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

// Helper function to format price (Reused from DailyBread)
const formatPrice = (price) => {
  return `${price.toLocaleString()} coins`;
};

// Helper function for direction details (Reused from DailyBread)
const getDirectionDetails = (direction) => {
  const normalizedDirection =
    direction?.toLowerCase().includes("buy") ||
    direction?.toLowerCase().includes("long")
      ? "Buy"
      : direction?.toLowerCase().includes("sell") ||
        direction?.toLowerCase().includes("short")
      ? "Sell"
      : "N/A";

  if (normalizedDirection === "Buy") {
    return {
      text: "BUY",
      color: "text-[#18ffc8]",
      icon: <FaArrowUp className="w-4 h-4 mr-1" />,
    };
  }
  if (normalizedDirection === "Sell") {
    return {
      text: "SELL",
      color: "text-[#f57cff]",
      icon: <FaArrowDown className="w-4 h-4 mr-1" />,
    };
  }
  return { text: "N/A", color: "text-[#376553]", icon: null };
};

// Helper function to calculate total odds (Reused from DailyBread)
const calculateTotalOdds = (bookingCodes) => {
  return bookingCodes
    .reduce((total, code) => total + (code.odd || 0), 0)
    .toFixed(2);
};

// Helper component for the "Back to Daily Bread" button/link
const BackToDailyBreadButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 rounded-xl bg-[#162821] text-[#fea92a] hover:bg-[#376553] transition-colors duration-200 border border-[#376553] ml-4 flex items-center space-x-1"
    aria-label="Go back to Daily Bread market"
  >
    <FaHistory className="text-xl" />
    <span className="text-xs">Market</span>
  </button>
);

const TipCountdown = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Note: expiryTime can be a date string from the API, convert it.
    const numericExpiryTime = new Date(expiryTime).getTime();

    const calculateTimeLeft = () => {
      const difference = numericExpiryTime - Date.now();
      return difference > 0 ? difference : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const formatTime = (value) => String(value).padStart(2, "0");
  const isExpired = timeLeft === 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#376553] font-medium flex items-center">
        <FaClock className="mr-1" /> Validity:
      </span>
      {isExpired ? (
        <span className="font-bold text-red-500">Expired</span>
      ) : (
        <div className="flex items-center space-x-1 font-bold text-[#18ffc8]">
          <span>{formatTime(days)}d</span>
          <span>:</span>
          <span>{formatTime(hours)}h</span>
          <span>:</span>
          <span>{formatTime(minutes)}m</span>
          <span>:</span>
          <span>{formatTime(seconds)}s</span>
        </div>
      )}
    </div>
  );
};

const AllDaily = () => {
  const navigate = useNavigate();
  const [purchasedTips, setPurchasedTips] = useState([]); // All purchased tips
  const [user, setUser] = useState(null); // Stores user data including userId
  const [loadingTips, setLoadingTips] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  // --- API Fetch Logic ---

  // 1. Fetch User Data (essential for getting userId)
  const fetchUserData = useCallback(async () => {
    try {
      const token = await localforage.getItem("token");
      if (!token) {
        // Redirect to login if no token is found
        toast.error("You must be logged in to view purchased tips.");
        navigate("/login");
        return;
      }
      const response = await axios.post(`${Api}/client/getUser`, { token });
      const userData = response.data.data;
      setUser(userData);
    } catch (err) {
      console.error("User data fetch failed:", err);
      setError(err.message);
      toast.error("Failed to authenticate user. Please log in again.");
      navigate("/login"); // Redirect on auth failure
    } finally {
      setLoadingUser(false);
    }
  }, [navigate]);

  // 2. Fetch All Purchased Tips
  const fetchAllDailyTips = useCallback(async (userId) => {
    if (!userId) return;

    setLoadingTips(true);
    try {
      // NOTE: Using `Api/client/getAllDaily` as per request
      const response = await axios.post(`${Api}/client/getBoughttip`, {
        userId,
      });
      const fetchedTips = response.data.data;

      // ➡️ Sort the array client-side by the 'createdAt' field (newest to oldest)
      const sortedTips = fetchedTips.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setPurchasedTips(sortedTips);
    } catch (err) {
      console.error("All daily tips fetch failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to load purchased tips."
      );
    } finally {
      setLoadingTips(false);
    }
  }, []);

  // UseEffect for initial fetch and dependency tracking
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (user && user._id) {
      fetchAllDailyTips(user._id);
      // Optional: Set up an interval to fetch data every 60 seconds (1 minute)
      const intervalId = setInterval(() => {
        fetchAllDailyTips(user._id);
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [user, fetchAllDailyTips]);

  // --- Tip Processing Logic ---

  const processedTips = useMemo(() => {
    const now = new Date();

    return purchasedTips
      .filter((tip) => {
        // Filter out tips that are not valid (expired)
        if (tip.expiryTime && new Date(tip.expiryTime) < now) {
          return false;
        }
        // Filter out tips with status "redeemed" or "blocked" from the display
        if (tip.status === "redeemed" || tip.status === "blocked") {
          return false;
        }
        return true;
      })
      .map((tip) => ({
        // Map API data to a consistent, cleaner structure (Reusing logic)
        id: tip._id,
        punterName: tip.punterName,
        punterId: tip.punterId,
        description: tip.description,
        price: tip.price,
        type: tip.primaryCategory,
        direction: tip.assets?.[0]?.direction || tip.direction,
        timeframe: tip.assets?.[0]?.timeFrame || tip.timeframe,
        matches: tip.matches,
        expiryTime: tip.expiryTime,
        bookingCodes:
          tip.bookingCode?.map((bc) => ({
            company: bc.bookingSite,
            code: bc.code,
            odd: bc.odd,
          })) || [],
        assets: tip.assets,
        status: tip.status,
        isPurchased: true, // Always true here since it's the "My Tips" page
        createdAt: tip.createdAt,
      }));
  }, [purchasedTips]);

  // --- Handlers ---

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 1500,
      style: { background: "#162821", color: "#18ffc8" },
    });
  };

const handleGoBack = () => {
    // Navigates one step back in the history stack (equivalent to goBack()).
    navigate(-1);
};

  const handleGoToPunterDetails = (punterId) => {
    navigate(`/customer/punters`, { state: { punterId } });
  };

  // --- Rendering ---

  if (loadingUser || loadingTips) {
    return (
      <div className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center">
        {/* Reusing the loading spinner from DailyBread */}
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

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-10">
      <Toaster />
      <Header />
      {/* Sticky Header with Title and Back Button */}
      <div className="sticky top-0 z-10 bg-[#09100d] pb-4">
        <header className="flex justify-between items-center mb-6 pt-8">
          <h1 className="text-3xl font-bold text-[#f57cff] tracking-tight">
            Purchased Bread
          </h1>
          <BackToDailyBreadButton onClick={handleGoBack} />
        </header>
      </div>
      {/* Purchased Tips Grid (Scrollable Content) */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {processedTips.map((tip) => {
            const directionDetails =
              tip.type === "trading"
                ? getDirectionDetails(tip.direction)
                : null;
            const totalOdds =
              tip.type === "sports"
                ? calculateTotalOdds(tip.bookingCodes)
                : "N/A";
            const assetCount = tip.type === "trading" ? tip.assets.length : 0;

            return (
              <div
                key={tip.id}
                className="bg-[#162821] rounded-xl overflow-hidden border border-[#18ffc8] shadow-lg"
              >
                {/* Punter Header - Clickable */}
                <div
                  className="bg-[#376553] p-4 cursor-pointer hover:bg-[#855391] transition-colors duration-200"
                  onClick={() => handleGoToPunterDetails(tip.punterId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Punter Initials */}
                      <div className="w-10 h-10 bg-[#855391] rounded-full flex items-center justify-center text-[#efefef] font-bold text-sm">
                        {getPunterInitials(tip.punterName)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#efefef]">
                          {tip.punterName}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tip Content */}
                <div className="p-4">
                  <p className="text-[#efefef] mb-4 leading-relaxed text-sm italic">
                    "{tip.description}"
                  </p>

                  {/* Purchased Details Section */}
                  <div className="bg-[#09100d] rounded-lg p-4 mb-4 border border-[#fea92a]">
                    <div className="mb-4">
                      <TipCountdown expiryTime={tip.expiryTime} />
                    </div>

                    {tip.type === "sports" ? (
                      <div>
                        <h4 className="text-[#18ffc8] font-semibold mb-2 flex justify-between items-center">
                          Booking Codes:
                          <span className="text-sm font-normal text-[#376553]">
                            Total Odd: {totalOdds}
                          </span>
                        </h4>
                        {/* Render Booking Codes */}
                        {tip.bookingCodes?.map((code, index) => (
                          <div
                            key={index}
                            className="bg-[#162821] rounded p-3 mb-2"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[#efefef] font-medium">
                                {code.company}
                              </span>
                              <span className="text-[#18ffc8] font-bold">
                                Odd: {code.odd}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <code className="text-[#f57cff] bg-[#09100d] px-2 py-1 rounded text-sm overflow-auto max-w-[80%]">
                                {code.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(code.code)}
                                className="text-[#376553] hover:text-[#fea92a] transition-colors"
                              >
                                <FaCopy />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Trading Signals
                      <div>
                        <h4 className="text-[#18ffc8] font-semibold mb-2 flex justify-between items-center">
                          Trading Signals:
                          <div
                            className={`flex items-center text-sm font-normal ${directionDetails.color}`}
                          >
                            {directionDetails.icon}
                            {directionDetails.text}
                          </div>
                        </h4>
                        {tip.assets?.map((asset, index) => {
                          const isBuy = directionDetails?.text === "BUY";
                          const entryLabel = isBuy ? "Entry" : "Take Profit";
                          const profitLabel = isBuy ? "Take Profit" : "Entry";
                          const entryValue = isBuy
                            ? asset.enteryPrice
                            : asset.takeProfit;
                          const profitValue = isBuy
                            ? asset.takeProfit
                            : asset.enteryPrice;

                          return (
                            <div
                              key={index}
                              className="bg-[#162821] rounded p-3 mb-2"
                            >
                              <div className="text-[#efefef] font-medium mb-2 border-b border-[#376553] pb-2">
                                {asset.pair} ({asset.timeFrame || "N/A"})
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm pt-2">
                                <div className="text-[#18ffc8] text-center">
                                  <div className="text-xs text-[#376553]">
                                    {entryLabel}
                                  </div>
                                  <div className="font-bold">
                                    {entryValue || "N/A"}
                                  </div>
                                </div>
                                <div className="text-[#f57cff] text-center">
                                  <div className="text-xs text-[#376553]">
                                    {profitLabel}
                                  </div>
                                  <div className="font-bold">
                                    {profitValue || "N/A"}
                                  </div>
                                </div>
                                <div className="text-[#fea92a] text-center">
                                  <div className="text-xs text-[#376553]">
                                    Stop Loss
                                  </div>
                                  <div className="font-bold">
                                    {asset.stopLoss || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer (Price Paid) */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#376553]">
                    <div>
                      <div className="text-[#376553] text-xs font-medium">
                        Price Paid
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          tip.price === 0 ? "text-[#f57cff]" : "text-[#fea92a]"
                        }`}
                      >
                        {tip.price === 0 ? "FREE" : formatPrice(tip.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#376553] text-xs font-medium">
                        Purchased On
                      </div>
                      <div className="text-[#efefef] text-sm font-medium">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Empty State */}
      {processedTips.length === 0 && !loadingTips && (
        <div className="text-center py-20">
          <h3 className="text-xl text-[#efefef] mb-2">
            No active purchased tips found.
          </h3>
          <p className="text-[#376553]">
            You can find new tips on the Daily Bread market.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllDaily;
