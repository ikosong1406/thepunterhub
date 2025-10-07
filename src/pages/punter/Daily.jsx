import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaUser,
  FaStar,
  FaFire,
  FaGift,
  FaChartLine,
  FaFutbol,
  FaCheck,
  FaCopy,
  FaEdit,
  FaTimesCircle,
  FaMoneyBillWave,
  FaClock,
  FaSpinner, // Added for loading state
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 👈 New Import
import localforage from "localforage"; // 👈 New Import
import Api from "../../components/Api";

// NOTE: Assuming Header component exists in "./Header"
import Header from "./Header";

// --- Mock Toast for Demo ---
const mockToast = (message, type = "info") => {
  console.log(`[TOAST - ${type.toUpperCase()}]: ${message}`);
  alert(`[Notification]: ${message}`); // Use alert for a simple browser demo
};

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
// --- Modal Component (Punter Management) (Minor Change) ---
// =========================================================
const TipManagementModal = ({ tip, onClose, onUpdateTip, onRedeemSales }) => {
  // Ensure expiryTime is a number for comparison
  const expiryTimestamp = useMemo(
    () => new Date(tip.expiryTime).getTime(),
    [tip.expiryTime]
  );
  const isExpired = useMemo(
    () => expiryTimestamp < Date.now(),
    [expiryTimestamp]
  );

  const handleStatusChange = (newStatus) => {
    onUpdateTip(tip.id, { status: newStatus });
    onClose();
  };

  if (!tip) return null;

  const totalSales = tip.salesCount * tip.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#09100d] rounded-xl border border-[#18ffc8] w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4 border-b border-[#376553] pb-3">
          <h2 className="text-2xl font-bold text-[#18ffc8]">
            Manage Tip
          </h2>
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
                tip.status === "Active" ? "text-[#18ffc8]" : "text-[#f57cff]"
              }`}
            >
              {tip.status.charAt(0).toUpperCase() + tip.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="bg-[#162821] p-3 rounded-lg mb-6 border border-[#376553]">
          <TipCountdown expiryTime={tip.expiryTime} />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Status Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() =>
                handleStatusChange(
                  tip.status.toLowerCase() === "active"
                    ? "deactivated"
                    : "active"
                )
              }
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-[#09100d] ${
                tip.status.toLowerCase() === "active"
                  ? "bg-[#f57cff] hover:bg-[#855391]"
                  : "bg-[#18ffc8] hover:bg-[#376553] text-[#09100d]"
              }`}
              disabled={isExpired}
            >
              {tip.status.toLowerCase() === "active"
                ? "Deactivate"
                : "Activate"}
            </button>
            <button
              onClick={() => handleStatusChange("settled")}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-[#09100d] bg-[#fea92a] hover:bg-yellow-600 transition-all duration-200"
              disabled={isExpired}
            >
              Mark as Settled
            </button>
          </div>

          {/* REDEEM BUTTON (The Target Experience) */}
          {isExpired &&
            tip.price > 0 &&
            tip.status.toLowerCase() !== "redeemed" && (
              <button
                onClick={() => onRedeemSales(tip.id, totalSales)}
                className="w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-[#efefef] shadow-red-500/50 shadow-md"
              >
                <FaMoneyBillWave />
                <span>REDEEM SALES ({totalSales.toLocaleString()} coins)</span>
              </button>
            )}

          {tip.status.toLowerCase() === "redeemed" && (
            <div className="w-full py-3 text-center rounded-lg font-bold text-lg bg-[#376553] text-[#18ffc8]">
              Sales Redeemed! ({totalSales.toLocaleString()} coins)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// --- Tip Card Component (Minor Change) ---
// =========================================================
const TipCard = ({
  tip,
  handleOpenManagementModal,
  handleRedeemSales,
  formatPrice,
}) => {
  const expiryTimestamp = new Date(tip.expiryTime).getTime();
  const isExpired = expiryTimestamp < Date.now();

  const canRedeem =
    isExpired &&
    tip.price > 0 &&
    tip.salesCount > 0 &&
    tip.status.toLowerCase() !== "redeemed";

  // Map status to a more restrained color
  const statusColors = {
    active: "bg-[#18ffc8] text-[#09100d]",
    deactivated: "bg-[#f57cff] text-[#09100d]",
    settled: "bg-[#fea92a] text-[#09100d]",
    redeemed: "bg-green-700 text-[#efefef]",
  };

  const statusKey = tip.status.toLowerCase();
  const statusClass = statusColors[statusKey] || "bg-[#376553] text-[#efefef]";
  const isFree = tip.price === 0;

  return (
    <div
      key={tip.id}
      // Simplified border color to reduce noise
      className={`bg-[#162821] rounded-xl overflow-hidden border border-[#376553] hover:border-[#f57cff] transition-all duration-300 shadow-lg ${
        isExpired && tip.status.toLowerCase() !== "redeemed" ? "opacity-80" : ""
      }`}
    >
      {/* Punter Header */}
      {/* Simplified header background */}
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
              {/* Note: bookingCodes is an array of objects: { company, code, odd } */}
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
              {/* Note: assets is an array of objects: { symbol, buy, sell, stopLoss } */}
              {tip.assets?.map((asset, index) => (
                <div key={index} className="bg-[#162821] rounded p-3 mb-2">
                  <div className="text-[#efefef] font-medium mb-2">
                    {asset.symbol} - ({tip.timeframe})
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-[#18ffc8]">
                      <div className="text-xs text-[#376553]">Buy</div>
                      <div className="font-bold">{asset.buy}</div>
                    </div>
                    <div className="text-[#f57cff]">
                      <div className="text-xs text-[#376553]">Sell</div>
                      <div className="font-bold">{asset.sell}</div>
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

        {/* Redemption/Price Footer */}
        {canRedeem ? (
          <button
            onClick={() =>
              handleRedeemSales(tip.id, tip.salesCount * tip.price)
            }
            className="w-full mt-4 px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-[#efefef] shadow-red-500/50 shadow-md"
          >
            <FaMoneyBillWave />
            <span>
              REDEEM SALES ({formatPrice(tip.salesCount * tip.price)})
            </span>
          </button>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-[#376553] text-xs font-medium">
                Tip Price
              </div>
              <div
                className={`text-xl font-bold ${
                  isFree ? "text-[#f57cff]" : "text-[#fea92a]"
                }`}
              >
                {isFree ? "FREE" : formatPrice(tip.price)}
              </div>
            </div>
            {tip.status.toLowerCase() === "redeemed" && (
              <div className="text-sm text-green-500 font-bold">
                Sales Settled
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================
// --- DailyBread Component (MAJOR UPDATE) ---
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
  const [activeCategory, setActiveCategory] = useState(categories[0].id); // 'slice'
  const [activeSubCategory, setActiveSubCategory] = useState(
    subCategories[0].id
  ); // 'sports'
  const [showModal, setShowModal] = useState(false);
  const [selectedTipForManagement, setSelectedTipForManagement] =
    useState(null);

  // --- New State for Data Fetching ---
  const [allTips, setAllTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // --- Data Mapping and Formatting Logic ---

  /**
   * Transforms the raw API tip data into the frontend TipCard format.
   * @param {object} apiTip The raw tip object from the backend.
   */
  const mapApiTipToFrontend = useCallback(
    (apiTip) => {
      // Determine the category based on price/secondaryCategory
      let categoryKey = apiTip.secondaryCategory.toLowerCase();
      if (apiTip.price === 0) {
        categoryKey = "crust"; // Map price 0 to 'crust' for filter logic
      }

      return {
        id: apiTip._id,
        punterName: apiTip.punterName,
        description: apiTip.description,
        price: apiTip.price,
        // NOTE: Assuming a mock rating as it's not in the API response
        rating:
          apiTip.rating ||
          (apiTip.punterName === user?.punterName ? 4.9 : "N/A"),
        type: apiTip.primaryCategory.toLowerCase(),
        category: categoryKey,
        status: apiTip.status.toLowerCase(),
        salesCount: apiTip.sales, // Map 'sales' to 'salesCount'
        expiryTime: new Date(apiTip.expiryTime).getTime(), // Convert ISO string to timestamp
        // Map 'bookingCode' array to 'bookingCodes' array (renaming keys)
        bookingCodes:
          apiTip.bookingCode?.map((bc) => ({
            company: bc.bookingSite, // Map 'bookingSite' to 'company'
            code: bc.code,
            odd: bc.odd,
          })) || [],
        // 'assets' and 'timeframe' are for trading tips (assuming same structure as mock for now)
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
        // If no token, redirect to login or show an error
        throw new Error("No authentication token found. Please log in.");
      }

      // 1. Fetch User Data to get punterId
      const userResponse = await axios.post(`${Api}/client/getUser`, { token });
      const userData = userResponse.data.data;
      // Set the user data, including the punterName for TipCard to recognize "YOU"
      setUser(userData);
      const punterId = userData._id; // Assuming user ID is the punter ID

      // 2. Fetch Punter Tips using punterId
      const tipsResponse = await axios.post(`${Api}/client/getPuntertip`, {
        userId: punterId, // Using punterId for the userId field in the request
      });

      // 3. Map API data to the frontend format
      const mappedTips = tipsResponse.data.data.map(mapApiTipToFrontend);
      setAllTips(mappedTips);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch tips and user data.");
      mockToast(err.message || "Data fetch failed.", "error");
    } finally {
      setLoading(false);
    }
  }, [mapApiTipToFrontend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatPrice = (price) => {
    return `${price.toLocaleString()} coins`;
  };

  // --- Filtering Logic (Updated to account for 'crust' mapping) ---
  const filteredTips = useMemo(() => {
    return allTips.filter((tip) => {
      // 1. Filter by Primary Category (Slice, Loaf, Crust)
      const isFreeTip = tip.price === 0;
      const primaryCategory = isFreeTip ? "crust" : tip.category;

      const matchesCategory =
        activeCategory === primaryCategory ||
        (activeCategory === "crust" && isFreeTip) ||
        (activeCategory === "slice" && tip.category === "slice") ||
        (activeCategory === "loaf" && tip.category === "loaf");

      // 2. Filter by Sub Category (Sports, Trading)
      const matchesSubCategory = tip.type === activeSubCategory;

      return matchesCategory && matchesSubCategory;
    });
  }, [allTips, activeCategory, activeSubCategory]);

  // --- Punter Management Functions (Updated to use tip ID from API) ---

  const handleOpenManagementModal = (tip) => {
    setSelectedTipForManagement(tip);
    setShowModal(true);
  };

  const handleUpdateTip = useCallback((tipId, updates) => {
    // Frontend Update
    setAllTips((prevAllTips) => {
      const index = prevAllTips.findIndex((t) => t.id === tipId);
      if (index !== -1) {
        const updatedTip = { ...prevAllTips[index], ...updates };
        const newTips = [
          ...prevAllTips.slice(0, index),
          updatedTip,
          ...prevAllTips.slice(index + 1),
        ];
        // NOTE: A real application would call an API endpoint here to update the tip status in the backend.
        // e.g., axios.post(`${Api}/punter/updateTipStatus`, { tipId, status: updates.status, ... });
        mockToast(
          `Tip #${tipId} status updated to: ${updatedTip.status}! (Frontend only)`,
          "success"
        );
        return newTips;
      }
      return prevAllTips;
    });
  }, []);

  const handleRedeemSales = (tipId, totalSales) => {
    handleUpdateTip(tipId, { status: "redeemed" });
    // NOTE: A real application would call an API endpoint here to perform the redemption and credit the user.
    // e.g., axios.post(`${Api}/punter/redeemTipSales`, { tipId, amount: totalSales, ... });

    mockToast(
      `💰 Redemption Complete! ${totalSales.toLocaleString()} coins credited to your account for Tip #${tipId}. (Frontend only)`,
      "success"
    );
    setShowModal(false);
  };

  // --- Render Logic with Loading and Error States ---


  if (error) {
    return (
      <div className="min-h-screen bg-[#09100d] text-red-500 p-8 text-center">
        <Header />
        <p className="mt-4 text-xl">{error}</p>
        <p className="mt-2 text-[#376553]">
          Please check your token and API connection.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-10">
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
                handleRedeemSales={handleRedeemSales}
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
          onClose={() => setShowModal(false)}
          onUpdateTip={handleUpdateTip}
          onRedeemSales={handleRedeemSales}
        />
      )}

      {/* Floating Create Tip Button */}

      <button
        className="fixed bottom-30 right-8 h-16 rounded-full bg-[#855391] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group px-5"
        onClick={() => {
          navigate("/punter/createDaily");
        }}
      >
        <FiPlus className="text-2xl group-hover:rotate-90 transition-transform" />
        <span className="ml-2">Create New Tip</span>
      </button>
    </div>
  );
};

export default DailyBread;
