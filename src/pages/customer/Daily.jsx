import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast"; // Import Toaster and toast
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  FaClock,
  FaShoppingCart,
  FaStar,
  FaFire,
  FaGift,
  FaChartLine,
  FaFutbol,
  FaCheck,
  FaCopy,
  FaBookmark,
  FaArrowUp,
  FaArrowDown,
  FaLock,
} from "react-icons/fa";
import Header from "./Header";
import Api from "../../components/Api";
import logoImage from "../../assets/logo2.png";

// --- END CONFIGURATION ---

// Helper function for Punter initials
const getPunterInitials = (name) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

// Helper component for the "My Tips" button/link
const MyTipsButton = ({ tipCount, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 rounded-xl bg-[#162821] text-[#fea92a] hover:bg-[#376553] transition-colors duration-200 border border-[#376553] ml-4 flex items-center space-x-1"
    aria-label="Go to My Purchased Tips Page"
  >
    <FaBookmark className="text-base" />
    <span className="text-xs">My Tips</span>
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

const DailyBread = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [activeCategory, setActiveCategory] = useState("slice");
  const [activeSubCategory, setActiveSubCategory] = useState("sports");
  const [allTips, setAllTips] = useState([]); // Raw tips from API
  // Stores purchased tip IDs for quick lookup (including tips from user.dailyBought)
  const [purchasedTipIds, setPurchasedTipIds] = useState({});
  const [user, setUser] = useState(null); // Stores user data including userId
  const [loadingTips, setLoadingTips] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  // --- API Fetch Logic ---

  // 1. Fetch User Data (for userId and initial purchased tips)
  const fetchUserData = useCallback(async () => {
    try {
      const token = await localforage.getItem("token");
      if (!token) {
        setUser(null);
        setLoadingUser(false);
        return;
      }
      const response = await axios.post(`${Api}/client/getUser`, { token });
      const userData = response.data.data;
      setUser(userData);

      // Extract and format purchased tip IDs for quick lookup
      if (userData.dailyBought && Array.isArray(userData.dailyBought)) {
        const purchasedMap = userData.dailyBought.reduce((acc, tipId) => {
          acc[tipId] = true;
          return acc;
        }, {});
        setPurchasedTipIds(purchasedMap);
      }
    } catch (err) {
      console.error("User data fetch failed:", err);
      setError(err.message);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // 2. Fetch Daily Tips
  // NOTE: We will remove setLoadingTips(true) inside the polling function
  // to prevent the full-screen loading state from showing every 3 seconds,
  // making the background refresh seamless. We'll keep it for the initial load.
  const fetchDailyTips = useCallback(async (isInitial = false) => {
    if (isInitial) {
        setLoadingTips(true);
    }
    try {
      const response = await axios.get(`${Api}/client/getDaily`);
      const fetchedTips = response.data.data;

      // ➡️ Sort the array client-side by the 'createdAt' field
      const sortedTips = fetchedTips.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setAllTips(sortedTips);
    } catch (err) {
      console.error("Daily tips fetch failed:", err);
    } finally {
      if (isInitial) {
        setLoadingTips(false);
      }
    }
  }, []);

  // UseEffect for initial fetch and polling
  useEffect(() => {
    // Initial fetch
    fetchUserData();
    fetchDailyTips(true); // Pass true for initial load to show loading screen

    // Set up the interval to fetch data every 3 seconds
    const POLLING_INTERVAL = 3000; // 3 seconds
    const intervalId = setInterval(() => {
      // Fetch user data (to update coins/purchased status)
      fetchUserData();
      // Fetch daily tips (to update the list)
      fetchDailyTips(); // Do not pass true here to avoid showing the loading spinner
    }, POLLING_INTERVAL);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [fetchUserData, fetchDailyTips]); // Dependencies are already correct

  // --- Tip Filtering Logic ---

  const tips = useMemo(() => {
    const now = new Date();

    return allTips
      .filter((tip) => {
        // 1. Filter out tips that are not valid (expired)
        if (tip.expiryTime && new Date(tip.expiryTime) < now) {
          return false;
        }
        // 2. Filter out tips with status "redeemed"
        if (tip.status === "redeemed") {
          return false;
        }
        // 3. Filter out tips that are already purchased by the user
        if (purchasedTipIds[tip._id]) {
          return false;
        }
        // 4. Filter by active category and subcategory
        const isPrimaryMatch = tip.secondaryCategory === activeCategory;
        const isSecondaryMatch = tip.primaryCategory === activeSubCategory;

        return isPrimaryMatch && isSecondaryMatch;
      })
      .map((tip) => ({
        // Map API data to a consistent, slightly cleaner structure
        id: tip._id,
        punterName: tip.punterName,
        punterId: tip.punterId,
        description: tip.description,
        price: tip.price,
        type: tip.primaryCategory, // e.g., 'sports' or 'trading'
        direction: tip.assets?.[0]?.direction || tip.direction, // Use asset direction as primary for trading if available
        timeframe: tip.assets?.[0]?.timeFrame || tip.timeframe, // Use asset timeframe as primary for trading if available
        matches: tip.matches, // For sports tips (if API provided)
        expiryTime: tip.expiryTime, // Expiry time for the tip
        bookingCodes:
          tip.bookingCode?.map((bc) => ({
            // Map bookingCode structure
            company: bc.bookingSite,
            code: bc.code,
            odd: bc.odd,
          })) || [],
        assets: tip.assets, // For trading tips
        status: tip.status, // 'active' or 'blocked'
        // isPurchased logic is now ONLY used for display/button text
        isPurchased: purchasedTipIds[tip._id] || false,
      }));
  }, [allTips, activeCategory, activeSubCategory, purchasedTipIds]);

  // --- Handlers & Helpers ---

  const handleBuyTip = async (tipId, price) => {
    if (!user) {
      toast.error("Please log in to purchase tips.");
      return;
    }

    const buyToastId = toast.loading("Processing purchase...");
    try {
      const response = await axios.post(`${Api}/client/buyTip`, {
        userId: user._id, // Assumes user._id is the correct ID field
        tipId: tipId,
      });

      if (response.data.message.includes("successful")) {
        setPurchasedTipIds((prev) => ({ ...prev, [tipId]: true }));
        toast.success(response.data.message, { id: buyToastId });

        // Immediately refresh user data to update the purchased list, though the UI already hides it
        fetchUserData();
      } else {
        toast.error(response.data.message || "Purchase failed.", {
          id: buyToastId,
        });
      }
    } catch (err) {
      console.error("Buy tip failed:", err);
      // Use the error message from the backend if available
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred during purchase.";
      toast.error(errorMessage, { id: buyToastId });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 1500,
      style: { background: "#162821", color: "#18ffc8" },
    });
  };

  const purchasedTipCount = useMemo(
    () => Object.keys(purchasedTipIds).length,
    [purchasedTipIds]
  );

  const handleGoToMyTips = () => {
    navigate(`/customer/allDaily`);
  };

  const handleGoToPunterDetails = (punterId) => {
    navigate(`/customer/punters`, { state: { punterId } });
  };

  const formatPrice = (price) => {
    return `${price.toLocaleString()} coins`;
  };

  const getDirectionDetails = (direction) => {
    // Normalize direction to 'Buy' or 'Sell' for display
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

  const calculateTotalOdds = (bookingCodes) => {
    return bookingCodes
      .reduce((total, code) => total + (code.odd || 0), 0)
      .toFixed(2);
  };

  // --- UI Components Config ---

  const categories = [
    { id: "slice", name: "Slice", icon: <FaStar />, description: "Single Tip" },
    { id: "loaf", name: "Loaf", icon: <FaFire />, description: "Bundle Tip" },
    // Removed 'crust' category
  ];

  const subCategories = [
    { id: "sports", name: "Sports", icon: <FaFutbol /> },
    { id: "trading", name: "Trading", icon: <FaChartLine /> },
  ];

  // --- Rendering ---

  if (loadingUser || loadingTips) {
    return (
      <div className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center">
        {/* Arcs + Logo (Loading State) */}
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
      <Toaster /> {/* Toast container for notifications */}
      <Header />
      {/* Fixed Navigation Container */}
      <div className="sticky top-0 z-10 bg-[#09100d] pb-4">
        {/* Header - Daily Bread Title and My Tips Icon */}
        <header className="flex justify-between items-center mb-6 pt-5">
          <h1 className="text-2xl font-bold text-[#18ffc8] tracking-tight">
            Daily Bread
          </h1>
          <MyTipsButton
            tipCount={purchasedTipCount}
            onClick={handleGoToMyTips} // Simulate redirection
          />
        </header>

        {/* Primary Category Navigation */}
        <div className="flex justify-center mb-7 mt-8">
          <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553] w-[50%] justify-between">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 flex items-center px-4 md:px-6 py-3 rounded-lg transition-all duration-200 text-xs md:text-base ${
                  activeCategory === category.id
                    ? "bg-[#18ffc8] text-[#09100d] shadow-lg"
                    : "text-[#efefef] hover:bg-[#376553] hover:text-[#efefef]"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                <div className="text-left whitespace-nowrap">
                  <div className="font-semibold">{category.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sub Category Navigation */}
        <div className="flex mb-6 w-full justify-between">
          <div className="bg-[#162821] rounded-xl p-1 flex w-full justify-between space-x-1 border border-[#376553]">
            {subCategories.map((subCategory) => (
              <button
                key={subCategory.id}
                onClick={() => setActiveSubCategory(subCategory.id)}
                className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 text-xs md:text-base ${
                  activeSubCategory === subCategory.id
                    ? "bg-[#fea92a] text-[#09100d] shadow-md"
                    : "text-[#efefef] hover:bg-[#376553]"
                }`}
              >
                <span className="mr-2">{subCategory.icon}</span>
                <span className="font-medium whitespace-nowrap">
                  {subCategory.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Tips Grid (Scrollable Content) */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tips.map((tip) => {
            const directionDetails =
              tip.type === "trading"
                ? getDirectionDetails(tip.direction)
                : null;
            const isBlocked = tip.status === "blocked";
            const isPurchased = tip.isPurchased; // This is now always false since purchased tips are filtered out

            // Calculate total odds for sports
            const totalOdds =
              tip.type === "sports"
                ? calculateTotalOdds(tip.bookingCodes)
                : "N/A";
            const assetCount = tip.type === "trading" ? tip.assets.length : 0;

            return (
              <div
                key={tip.id}
                className={`bg-[#162821] rounded-xl overflow-hidden border transition-all duration-300 group ${
                  isBlocked
                    ? "border-red-800 opacity-70"
                    : isPurchased // Though filtered out, keeping logic for consistency
                    ? "border-[#18ffc8] hover:border-[#fea92a]"
                    : "border-[#376553] hover:border-[#18ffc8]"
                }`}
              >
                {/* Punter Header - Now Clickable */}
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
                    {isBlocked && (
                      <div className="text-sm text-red-400 font-bold flex items-center">
                        <FaLock className="mr-1" /> Blocked
                      </div>
                    )}
                  </div>
                </div>

                {/* Tip Content */}
                <div className="p-4">
                  <p className="text-[#efefef] mb-4 leading-relaxed text-sm italic">
                    "{tip.description}"
                  </p>

                  {/* Details Section */}
                  <div className="bg-[#09100d] rounded-lg p-3 mb-4 border border-[#376553]">
                    <TipCountdown expiryTime={tip.expiryTime} />
                    {tip.type === "sports" && (
                      <div className="flex justify-between items-center mt-5">
                        <div>
                          <div className="text-[#376553] text-xs font-medium">
                            Potential Max Odd
                          </div>
                          <div className="text-xl font-bold text-[#18ffc8]">
                            {/* SUM of all odds */}
                            {totalOdds}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#376553] text-xs font-medium">
                            Booking Codes
                          </div>
                          <div className="text-[#efefef] text-sm mt-1 font-medium">
                            {`${tip.bookingCodes?.length || 0} Code(s)`}
                          </div>
                        </div>
                      </div>
                    )}
                    {tip.type === "trading" && directionDetails && (
                      <div className="flex justify-between items-center mt-5">
                        <div className="flex items-center">
                          <div className="text-[#376553] text-xs font-medium mr-4">
                            Direction
                          </div>
                          <div
                            className={`flex items-center text-xl font-bold ${directionDetails.color}`}
                          >
                            {directionDetails.icon}
                            {directionDetails.text}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#376553] text-xs font-medium">
                            Assets
                          </div>
                          <div className="text-[#efefef] text-sm mt-1 font-medium">
                            {/* New: Show asset count instead of timeframe */}
                            {`${assetCount} Asset(s)`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price & Buy Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#376553]">
                    <div>
                      <div className="text-[#376553] text-xs font-medium">
                        Price
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          tip.price === 0 ? "text-[#f57cff]" : "text-[#fea92a]"
                        }`}
                      >
                        {tip.price === 0 ? "FREE" : formatPrice(tip.price)}
                      </div>
                    </div>

                    {tip.status === "active" ? (
                      <button
                        onClick={() => handleBuyTip(tip.id, tip.price)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                          tip.price === 0
                            ? "bg-[#855391] hover:bg-[#f57cff] text-[#efefef]"
                            : "bg-[#18ffc8] hover:bg-[#fea92a] text-[#09100d]"
                        }`}
                      >
                        <FaShoppingCart />
                        <span className="font-bold">
                          {tip.price === 0 ? "Get Free" : "Buy Now"}
                        </span>
                      </button>
                    ) : (
                      <div className="bg-red-900/50 text-red-400 font-semibold px-4 py-2 rounded-lg flex items-center">
                        <FaLock className="mr-2" /> closed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Empty State */}
      {tips.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-base text-[#efefef] mb-2">
            {loadingTips
              ? "Fetching tips..."
              : `No unpurchased tips available.`}
          </h3>
          {!loadingTips && (
            <p className="text-[#376553] text-sm">
              Check back later for fresh insights!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyBread;