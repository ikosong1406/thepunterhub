import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaUser,
  FaStar,
  FaFire,
  FaChartLine,
  FaFutbol,
  FaCheck,
  FaCopy,
  FaEdit,
  FaTimesCircle,
  FaMoneyBillWave,
  FaClock,
  FaSpinner,
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import localforage from "localforage";
import Api from "../../components/Api";
import logoImage from "../../assets/logo2.png";

// NOTE: Assuming Header component exists in "./Header"
import Header from "./Header";

// =========================================================
// --- Tip Countdown Component (NO CHANGE) ---
// =========================================================
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

// =========================================================
// --- Modal Component (Punter Management) (NO CHANGE) ---
// =========================================================
const TipManagementModal = ({ tip, punterId, onClose, onTipAction }) => {
  // tip.status will be 'active', 'closed', or 'redeemed'
  const expiryTimestamp = useMemo(
    () => new Date(tip.expiryTime).getTime(),
    [tip.expiryTime]
  );
  const isExpired = useMemo(
    () => expiryTimestamp < Date.now(),
    [expiryTimestamp]
  );
  const totalSales = tip.salesCount * tip.price;
  const isPaidTip = tip.price > 0;

  // Function to handle all status/redemption changes
  const handleAction = (actionType) => {
    // actionType will be 'close', 'activate', or 'redeem'
    onTipAction(tip.id, punterId, actionType, totalSales);
    onClose();
  };

  if (!tip) return null;

  const currentStatus = tip.status.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#09100d] rounded-xl border border-[#18ffc8] w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4 border-b border-[#376553] pb-3">
          <h2 className="text-2xl font-bold text-[#18ffc8]">Manage Tip</h2>
          <button
            onClick={onClose}
            className="text-[#376553] hover:text-[#f57cff] transition-colors"
          >
            <FaTimesCircle size={24} />
          </button>
        </div>

        {/* Sales & Status Info */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#376553]">Price:</span>
            <span className="font-semibold text-[#fea92a]">
              {tip.price === 0 ? "FREE" : `${tip.price.toLocaleString()} coins`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#376553]">Sales Made:</span>
            <span className="font-semibold text-[#f57cff] text-xl">
              {tip.salesCount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#376553]">Total Revenue:</span>
            <span className="font-semibold text-[#fea92a] text-xl">
              {totalSales.toLocaleString()} coins
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#376553]">Current Status:</span>
            <span
              className={`font-semibold ${
                currentStatus === "active"
                  ? "text-[#18ffc8]"
                  : currentStatus === "redeemed"
                  ? "text-green-500"
                  : "text-[#f57cff]"
              }`}
            >
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="bg-[#162821] p-3 rounded-lg mb-6 border border-[#376553]">
          <TipCountdown expiryTime={tip.expiryTime} />
        </div>

        {/* --- Dynamic Actions Based on Status and Expiry --- */}
        <div className="space-y-3">
          {currentStatus === "redeemed" && (
            <div className="w-full py-3 text-center rounded-lg font-bold text-lg bg-[#376553] text-[#18ffc8]">
              Sales Redeemed! ({totalSales.toLocaleString()} coins)
            </div>
          )}

          {/* Case 1: Active & Valid -> Only option is to Close */}
          {currentStatus === "active" && !isExpired && (
            <button
              onClick={() => handleAction("closed")}
              className="w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-[#efefef] shadow-red-500/50 shadow-md"
            >
              <FaTimesCircle />
              <span>Close Tip Now</span>
            </button>
          )}

          {/* Case 2: Active & Expired -> Only option is to Redeem (if paid tip) */}
          {currentStatus === "active" && isExpired && isPaidTip && (
            <button
              onClick={() => handleAction("redeemed")}
              className="w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-[#fea92a] hover:bg-yellow-600 text-[#09100d] shadow-yellow-500/50 shadow-md"
            >
              <FaMoneyBillWave />
              <span>REDEEM SALES ({totalSales.toLocaleString()} coins)</span>
            </button>
          )}

          {/* Case 3: Closed & Valid/Expired -> Options: Activate or Redeem (if paid tip) */}
          {currentStatus === "closed" && (
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleAction("active")}
                className="w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-[#18ffc8] hover:bg-green-400 text-[#09100d] shadow-green-500/50 shadow-md"
                disabled={isExpired}
              >
                <FaCheck />
                <span>Activate Tip</span>
              </button>
              {isPaidTip && (
                <button
                  onClick={() => handleAction("redeemed")}
                  className="w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-[#f57cff] hover:bg-[#855391] text-[#09100d] shadow-purple-500/50 shadow-md"
                  disabled={totalSales === 0}
                >
                  <FaMoneyBillWave />
                  <span>
                    REDEEM SALES ({totalSales.toLocaleString()} coins)
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// --- Tip Card Component (NO CHANGE) ---
// =========================================================
const TipCard = ({ tip, handleOpenManagementModal, formatPrice }) => {
  const expiryTimestamp = new Date(tip.expiryTime).getTime();
  const isExpired = expiryTimestamp < Date.now();

  // Map status to a more restrained color
  const statusColors = {
    active: "bg-[#18ffc8] text-[#09100d]",
    closed: "bg-[#f57cff] text-[#09100d]",
    redeemed: "bg-green-700 text-[#efefef]",
  };

  const statusKey = tip.status.toLowerCase();
  // Using 'closed' as the fallback status for unknown types
  const statusClass = statusColors[statusKey] || "bg-[#f57cff] text-[#09100d]";
  const isFree = tip.price === 0;

  // The redemption logic is now handled exclusively in the Modal
  const needsRedemption =
    isExpired &&
    tip.price > 0 &&
    tip.salesCount > 0 &&
    statusKey !== "redeemed";

  return (
    <div
      key={tip.id}
      className={`bg-[#162821] rounded-xl overflow-hidden border border-[#376553] hover:border-[#f57cff] transition-all duration-300 shadow-lg ${
        needsRedemption ? "border-red-500 ring-2 ring-red-500" : ""
      }`}
    >
      {/* Punter Header */}
      <div className="bg-[#376553] p-4 border-b border-[#09100d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#09100d] rounded-full flex items-center justify-center">
              <FaUser className="text-[#efefef]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#efefef] flex items-center">
                {tip.punterName}{" "}
                <span className="ml-2 text-xs bg-[#18ffc8] text-[#09100d] px-2 py-0.5 rounded-full font-bold">
                  YOU
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => handleOpenManagementModal(tip)}
            className="text-[#efefef] hover:text-[#18ffc8] transition-colors"
            title="Manage Tip"
          >
            <FaEdit size={20} />
          </button>
        </div>
      </div>

      {/* Tip Content */}
      <div className="p-4">
        <p className="text-[#efefef] mb-4 leading-relaxed text-sm italic">
          {tip.description}
        </p>

        {/* Status Badge */}
        <div className="flex justify-between items-center mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}
          >
            {tip.status.toUpperCase()}
          </span>
          {needsRedemption && (
            <span className="text-sm font-bold text-red-500 flex items-center space-x-1 animate-pulse">
              <FaMoneyBillWave />
              <span>READY TO REDEEM!</span>
            </span>
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-[#09100d] rounded-lg p-3 mb-4 border border-[#376553]">
          <TipCountdown expiryTime={tip.expiryTime} />

          <div className="mt-2 pt-2 border-t border-[#162821] flex justify-between">
            <div className="text-[#376553] text-xs font-medium">
              Sales Count
            </div>
            <div className="text-[#f57cff] font-bold text-lg">
              {tip.salesCount}
            </div>
          </div>
        </div>

        {/* Full Details Revealed */}
        <div className="bg-[#09100d] rounded-lg p-4 mb-4 border border-[#18ffc8]">
          {/* Displaying Tip Details (Sports vs Trading) */}
          {tip.type === "sports" ? (
            <div>
              <h4 className="text-[#fea92a] font-semibold mb-2">
                Booking Codes:
              </h4>
              {tip.bookingCodes?.map((code, index) => (
                <div key={index} className="bg-[#162821] rounded p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <code className="text-[#f57cff] bg-[#09100d] px-2 py-1 rounded text-sm">
                      {code.company}: {code.code} (Odd: {code.odd})
                    </code>
                    <button
                      onClick={() =>
                        navigator.clipboard
                          .writeText(code.code)
                          .then(() => mockToast("Code copied!", "info"))
                      }
                      className="text-[#376553] hover:text-[#18ffc8] transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h4 className="text-[#fea92a] font-semibold mb-2">
                Trading Signals:
              </h4>
              {tip.assets?.map((asset, index) => (
                <div key={index} className="bg-[#162821] rounded p-3 mb-2">
                  <div className="text-[#efefef] font-medium mb-2">
                    {asset.pair} - ({asset.timeFrame})
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-[#18ffc8]">
                      <div className="text-xs text-[#376553]">Direction</div>
                      <div className="font-bold">{asset.direction}</div>
                    </div>
                    <div className="text-[#18ffc8]">
                      <div className="text-xs text-[#376553]">Entry Price</div>
                      <div className="font-bold">{asset.enteryPrice}</div>
                    </div>
                    <div className="text-[#f57cff]">
                      <div className="text-xs text-[#376553]">Take Profit</div>
                      <div className="font-bold">{asset.takeProfit}</div>
                    </div>
                    <div className="text-[#fea92a]">
                      <div className="text-xs text-[#376553]">Stop Loss</div>
                      <div className="font-bold">{asset.stopLoss}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Footer */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-[#376553] text-xs font-medium">Tip Price</div>
            <div
              className={`text-xl font-bold ${
                isFree ? "text-[#f57cff]" : "text-[#fea92a]"
              }`}
            >
              {isFree ? "FREE" : formatPrice(tip.price)}
            </div>
          </div>
          <div className="text-[#376553] text-sm">
            Total Revenue:{" "}
            <span className="font-bold text-[#fea92a]">
              {formatPrice(tip.salesCount * tip.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// --- DailyBread Component (UPDATED: FAB Loader Removed) ---
// =========================================================
const categories = [
  { id: "slice", name: "Slice", icon: <FaStar />, description: "Single Tip" },
  { id: "loaf", name: "Loaf", icon: <FaFire />, description: "Bundle Tip" },
];

const subCategories = [
  { id: "sports", name: "Sports", icon: <FaFutbol /> },
  { id: "trading", name: "Trading", icon: <FaChartLine /> },
];

const DailyBread = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [activeSubCategory, setActiveSubCategory] = useState(
    subCategories[0].id
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedTipForManagement, setSelectedTipForManagement] =
    useState(null);

  // --- State for Data Fetching ---
  const [allTips, setAllTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const formatPrice = (price) => {
    return `${price.toLocaleString()} coins`;
  };

  const mapApiTipToFrontend = useCallback(
    (apiTip) => {
      const categoryKey = apiTip.secondaryCategory.toLowerCase();

      return {
        id: apiTip._id,
        punterId: apiTip.userId,
        punterName: apiTip.punterName,
        description: apiTip.description,
        price: apiTip.price,
        rating:
          apiTip.rating ||
          (apiTip.punterName === user?.punterName ? 4.9 : "N/A"),
        type: apiTip.primaryCategory.toLowerCase(),
        category: categoryKey,
        status: apiTip.status.toLowerCase(),
        salesCount: apiTip.sales,
        expiryTime: new Date(apiTip.expiryTime).toISOString(),
        bookingCodes:
          apiTip.bookingCode?.map((bc) => ({
            company: bc.bookingSite,
            code: bc.code,
            odd: bc.odd,
          })) || [],
        timeframe: apiTip.timeframe,
        assets: apiTip.assets || [],
      };
    },
    [user]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await localforage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // 1. Fetch User Data to get punterId
      const userResponse = await axios.post(`${Api}/client/getUser`, { token });
      const userData = userResponse.data.data;
      setUser(userData);
      const punterId = userData._id;

      // 2. Fetch Punter Tips using punterId
      const tipsResponse = await axios.post(`${Api}/client/getPuntertip`, {
        userId: punterId,
      });

      // 3. Map API data to the frontend format
      const mappedTips = tipsResponse.data.data.map(mapApiTipToFrontend);
      setAllTips(mappedTips);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch tips and user data.");
    } finally {
      setLoading(false);
    }
  }, [mapApiTipToFrontend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Filtering Logic ---
  const filteredTips = useMemo(() => {
    return allTips.filter((tip) => {
      // 1. Filter out all free tips (price === 0)
      if (tip.price === 0) {
        return false;
      }

      // 2. Filter by Primary Category (Slice, Loaf)
      const matchesCategory = tip.category === activeCategory;

      // 3. Filter by Sub Category (Sports, Trading)
      const matchesSubCategory = tip.type === activeSubCategory;

      return matchesCategory && matchesSubCategory;
    });
  }, [allTips, activeCategory, activeSubCategory]);

  // --- Punter Management Functions ---

  const handleOpenManagementModal = (tip) => {
    setSelectedTipForManagement(tip);
    setShowModal(true);
  };

  /**
   * Handles all tip actions (close, activate, redeem) and calls the API.
   */
  const handleTipAction = useCallback(
    async (tipId, punterId, actionType, totalSales) => {
      const newStatus =
        actionType === "closed"
          ? "closed"
          : actionType === "active"
          ? "active"
          : "redeemed";
      const endpoint = `${Api}/client/redeemTip`;

      try {
        const response = await axios.post(endpoint, {
          tipId: tipId,
          punterId: punterId,
          status: newStatus,
        });

        if (response.data.success) {
          const successMessage =
            actionType === "redeemed"
              ? `Sales Redemption Complete! coins credited.`
              : `Tip status successfully updated`;

          toast.success(successMessage);

          // Update frontend state with the new status
          setAllTips((prevAllTips) => {
            const index = prevAllTips.findIndex((t) => t.id === tipId);
            if (index !== -1) {
              const updatedTip = { ...prevAllTips[index], status: newStatus };
              return [
                ...prevAllTips.slice(0, index),
                updatedTip,
                ...prevAllTips.slice(index + 1),
              ];
            }
            return prevAllTips;
          });
        } else {
          throw new Error(
            response.data.message || `API call failed for action: ${newStatus}`
          );
        }
      } catch (err) {
        console.error("Error performing tip action:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          `Failed to perform ${newStatus} action.`;
      } // finally { setLoading(false); } // Removed from global state
    },
    []
  );

  // --- Render Logic with Loading and Error States ---
  if (loading && allTips.length === 0 && !error) {
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
      <div className="min-h-screen bg-[#09100d] text-red-500 p-8 text-center">
        <Header />
        <p className="mt-4 text-xl">{error}</p>
        <p className="mt-2 text-[#376553]">
          Please check your network connection.
        </p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-[#f57cff] text-[#09100d] rounded-lg font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-10">
      <Toaster />
      <Header />
      {/* Header */}
      <header className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-[#f57cff] mb-2 tracking-tight">
          Daily Bread
        </h1>
      </header>

      {/* --- Category Navigation START --- */}

      {/* Primary Category Navigation */}
      <div className="flex justify-center mb-7 mt-8">
        <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553] w-[50%] justify-between">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 flex items-center px-4 md:px-6 py-3 rounded-lg transition-all duration-200 text-sm md:text-base ${
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
        {/* The container for subcategories now uses w-full and flex to distribute space */}
        <div className="bg-[#162821] rounded-xl p-1 flex w-full justify-between space-x-1 border border-[#376553]">
          {subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => setActiveSubCategory(subCategory.id)}
              // Added 'flex-1' here to make the buttons take equal width
              className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 text-sm md:text-base ${
                activeSubCategory === subCategory.id
                  ? "bg-[#fea92a] text-[#09100d] shadow-md"
                  : "text-[#efefef] hover:bg-[#376553]"
              }`}
            >
              {/* Adjusted spacing and centering for content inside the button */}
              <span className="mr-2">{subCategory.icon}</span>
              <span className="font-medium whitespace-nowrap">
                {subCategory.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- Category Navigation END --- */}

      {/* Tips Grid */}
      <div className="max-w-4xl mx-auto">
        {filteredTips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                handleOpenManagementModal={handleOpenManagementModal}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          /* Empty State for Filtered Results */
          <div className="text-center py-20">
            <h3 className="text-xl text-[#efefef] mb-2">
              No "{activeCategory}" Tips in "{activeSubCategory}" found.
            </h3>
            <p className="text-[#376553]">
              Try adjusting your category filters or creating a new tip!
            </p>
          </div>
        )}
      </div>

      {/* Tip Management Modal */}
      {showModal && selectedTipForManagement && (
        <TipManagementModal
          tip={selectedTipForManagement}
          punterId={user._id}
          onClose={() => {
            setShowModal(false);
            setSelectedTipForManagement(null);
          }}
          onTipAction={handleTipAction}
        />
      )}

      {/* Floating Create Tip Button (FAB) */}
      <button
        className="fixed bottom-30 right-8 h-16 rounded-full bg-[#855391] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group px-5"
        onClick={() => {
          navigate("/punter/createDaily");
        }}
      >
        <FiPlus className="text-2xl group-hover:rotate-90 transition-transform" />
        <span className="ml-2 font-semibold">Create New Tip</span>
      </button>
    </div>
  );
};

export default DailyBread;
