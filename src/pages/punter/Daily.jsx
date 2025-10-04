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
} from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// NOTE: Assuming Header component exists in "./Header"
// If it doesn't, you'll need to remove the import and usage.
import Header from "./Header";

// --- Mock Current User (Focus: Elite Punter Pro) ---
const CURRENT_USER_PUNTER_NAME = "Elite Punter Pro";

// --- Mock Toast for Demo ---
const mockToast = (message, type = "info") => {
  console.log(`[TOAST - ${type.toUpperCase()}]: ${message}`);
  alert(`[Notification]: ${message}`); // Use alert for a simple browser demo
};

// --- Tip Countdown Component ---
const TipCountdown = ({ expiryTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiryTime - Date.now();
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

// --- Modal Component (Punter Management) ---
const TipManagementModal = ({ tip, onClose, onUpdateTip, onRedeemSales }) => {
  const isExpired = useMemo(
    () => tip.expiryTime < Date.now(),
    [tip.expiryTime]
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
            Manage Tip #{tip.id}
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
              {tip.status}
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
                  tip.status === "Active" ? "Deactivated" : "Active"
                )
              }
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-[#09100d] ${
                tip.status === "Active"
                  ? "bg-[#f57cff] hover:bg-[#855391]"
                  : "bg-[#18ffc8] hover:bg-[#376553] text-[#09100d]"
              }`}
              disabled={isExpired}
            >
              {tip.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => handleStatusChange("Settled")}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-[#09100d] bg-[#fea92a] hover:bg-yellow-600 transition-all duration-200"
              disabled={isExpired}
            >
              Mark as Settled
            </button>
          </div>

          {/* REDEEM BUTTON (The Target Experience) */}
          {isExpired && tip.price > 0 && tip.status !== "Redeemed" && (
            <button
              onClick={() => onRedeemSales(tip.id, totalSales)}
              className="w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-[#efefef] shadow-red-500/50 shadow-md"
            >
              <FaMoneyBillWave />
              <span>REDEEM SALES ({totalSales.toLocaleString()} coins)</span>
            </button>
          )}

          {tip.status === "Redeemed" && (
            <div className="w-full py-3 text-center rounded-lg font-bold text-lg bg-[#376553] text-[#18ffc8]">
              Sales Redeemed! ({totalSales.toLocaleString()} coins)
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg font-semibold text-[#efefef] bg-[#162821] hover:bg-[#376553] transition-all duration-200 mt-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Tip Card Component for Punter Dashboard ---
// Simplified colors here
const TipCard = ({ tip, handleOpenManagementModal, handleRedeemSales, formatPrice }) => {
  const canRedeem =
    tip.expiryTime < Date.now() &&
    tip.price > 0 &&
    tip.salesCount > 0 &&
    tip.status !== "Redeemed";

  // Map status to a more restrained color
  const statusColors = {
    Active: "bg-[#18ffc8] text-[#09100d]",
    Deactivated: "bg-[#f57cff] text-[#09100d]",
    Settled: "bg-[#fea92a] text-[#09100d]",
    Redeemed: "bg-green-700 text-[#efefef]",
  };

  const statusClass = statusColors[tip.status] || "bg-[#376553] text-[#efefef]";
  const isFree = tip.price === 0;
  const isExpired = tip.expiryTime < Date.now();

  return (
    <div
      key={tip.id}
      // Simplified border color to reduce noise
      className={`bg-[#162821] rounded-xl overflow-hidden border border-[#376553] hover:border-[#f57cff] transition-all duration-300 shadow-lg ${
        isExpired && tip.status !== "Redeemed" ? "opacity-80" : ""
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
              <div className="flex items-center space-x-2">
                <FaStar className="text-[#fea92a] text-sm" />
                <span className="text-sm text-[#efefef]">{tip.rating}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass}`}>
                  {tip.status}
                </span>
              </div>
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
          <div className="grid grid-cols-2 gap-2 text-center mb-3">
            <div>
              <div className="text-[#376553] text-xs font-medium">Type</div>
              <div className="text-lg font-bold text-[#fea92a]">
                {tip.type === "sports" ? "Sports Tip" : "Trading Signal"}
              </div>
            </div>
            {/* Added Tip Category (Slice/Loaf/Crust) */}
            <div>
              <div className="text-[#376553] text-xs font-medium">Category</div>
              <div className="text-lg font-bold text-[#f57cff]">
                {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
              </div>
            </div>
          </div>

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
          <div className="flex items-center mb-3">
            <FaCheck className="text-[#18ffc8] mr-2" />
            <span className="text-[#18ffc8] font-semibold">
              Full Details (Your Tip)
            </span>
          </div>

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
                      onClick={() => navigator.clipboard.writeText(code.code).then(() => mockToast("Code copied!", "info"))}
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
            {tip.status === "Redeemed" && (
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

// --- Tip Data Setup (Expanded) ---

// Define categories outside the component for clarity
const categories = [
  { id: 'slice', name: 'Slice', icon: <FaStar />, description: 'Single Tip' },
  { id: 'loaf', name: 'Loaf', icon: <FaFire />, description: 'Bundle Tip' },
  { id: 'crust', name: 'Crust', icon: <FaGift />, description: 'Free Tip' }
];

const subCategories = [
  { id: 'sports', name: 'Sports', icon: <FaFutbol /> },
  { id: 'trading', name: 'Trading', icon: <FaChartLine /> }
];

const DailyBread = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(categories[0].id); // 'slice'
  const [activeSubCategory, setActiveSubCategory] = useState(subCategories[0].id); // 'sports'
  const [showModal, setShowModal] = useState(false);
  const [selectedTipForManagement, setSelectedTipForManagement] = useState(null);

  // --- Mock Tips State (Expanded and Categorized) ---
  const [allTips, setAllTips] = useState(() => {
    const baseTime = Date.now() + 12 * 60 * 60 * 1000; // 12 hours from now
    const nearExpiredTime = Date.now() + 1 * 60 * 60 * 1000; // 1 hour from now
    const expiredTime = Date.now() - 3600000; // 1 hour ago - READY FOR REDEMPTION

    // Filtered data relevant to CURRENT_USER_PUNTER_NAME: "Elite Punter Pro"
    return [
      // 1. Slice (Paid) - Sports - Active (Near Expired)
      {
        id: 1,
        punterName: CURRENT_USER_PUNTER_NAME,
        description: "Secure win prediction with 85% accuracy rate based on recent form and head-to-head statistics",
        price: 500,
        rating: 4.9,
        type: "sports",
        category: "slice",
        status: "Active",
        salesCount: 15,
        expiryTime: nearExpiredTime,
        bookingCodes: [
          { company: "Bet365", code: "MCAR123", odd: 2.45 },
        ],
      },
      // 2. Loaf (Bundle) - Sports - Expired (Ready for Redemption)
      {
        id: 5,
        punterName: CURRENT_USER_PUNTER_NAME,
        description: "5 carefully selected accumulator tips with comprehensive analysis. Max Profit Potential!",
        price: 1200,
        rating: 4.8,
        type: "sports",
        category: "loaf",
        status: "Active", // Will be redeemable because it's expired
        salesCount: 5,
        expiryTime: expiredTime,
        bookingCodes: [
          { company: "Bet365", code: "ACC123", odd: 12.5 },
          { company: "1xBet", code: "ACC456", odd: 11.8 },
        ],
      },
      // 3. Crust (Free) - Sports - Settled
      {
        id: 7,
        punterName: CURRENT_USER_PUNTER_NAME,
        description: "Quick, low-stakes tip to test the waters. High-confidence single match over/under.",
        price: 0,
        rating: 4.5,
        type: "sports",
        category: "crust",
        status: "Settled",
        salesCount: 55,
        expiryTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        bookingCodes: [
          { company: "Bet9ja", code: "FREE999", odd: 1.85 },
        ],
      },
      // 4. Slice (Paid) - Trading - Active
      {
        id: 10,
        punterName: CURRENT_USER_PUNTER_NAME,
        description: "Short-term EUR/USD signal based on key support and resistance bounce.",
        price: 750,
        rating: 4.7,
        type: "trading",
        category: "slice",
        status: "Active",
        salesCount: 12,
        expiryTime: baseTime + 2 * 60 * 60 * 1000, // 14 hours from now
        timeframe: "H1",
        assets: [
          { symbol: "EURUSD", buy: 1.0850, sell: 1.0920, stopLoss: 1.0820 },
        ],
      },
      // 5. Loaf (Bundle) - Trading - Redeemed (Previously Expired)
      {
        id: 12,
        punterName: CURRENT_USER_PUNTER_NAME,
        description: "Complete crypto portfolio rebalance recommendations for Q4 2024.",
        price: 2500,
        rating: 5.0,
        type: "trading",
        category: "loaf",
        status: "Redeemed",
        salesCount: 3,
        expiryTime: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        timeframe: "D1/W1",
        assets: [
          { symbol: "BTC", buy: "HODL", sell: 75000, stopLoss: 55000 },
          { symbol: "ETH", buy: "HODL", sell: 4500, stopLoss: 3000 },
        ],
      },
    ];
  });

  const formatPrice = (price) => {
    return `${price.toLocaleString()} coins`;
  };

  // --- Filtering Logic (Use useMemo for performance) ---
  const filteredTips = useMemo(() => {
    return allTips.filter(tip => {
      // 1. Filter by Primary Category (Slice, Loaf, Crust)
      const matchesCategory =
        activeCategory === 'all' || // Option for 'all' tips
        (tip.price === 0 && activeCategory === 'crust') ||
        (tip.category === activeCategory);

      // 2. Filter by Sub Category (Sports, Trading)
      const matchesSubCategory = tip.type === activeSubCategory;

      return matchesCategory && matchesSubCategory;
    });
  }, [allTips, activeCategory, activeSubCategory]);

  // --- Punter Management Functions ---

  const handleOpenManagementModal = (tip) => {
    setSelectedTipForManagement(tip);
    setShowModal(true);
  };

  const handleUpdateTip = useCallback((tipId, updates) => {
    setAllTips((prevAllTips) => {
      const index = prevAllTips.findIndex((t) => t.id === tipId);
      if (index !== -1) {
        const updatedTip = { ...prevAllTips[index], ...updates };
        const newTips = [
          ...prevAllTips.slice(0, index),
          updatedTip,
          ...prevAllTips.slice(index + 1),
        ];
        mockToast(
          `Tip #${tipId} status updated to: ${updatedTip.status}!`,
          "success"
        );
        return newTips;
      }
      return prevAllTips;
    });
  }, []);

  const handleRedeemSales = (tipId, totalSales) => {
    handleUpdateTip(tipId, { status: "Redeemed" });
    mockToast(
      `💰 Redemption Complete! ${totalSales.toLocaleString()} coins credited to your account for Tip #${tipId}.`,
      "success"
    );
    setShowModal(false);
  };

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
      <div className="flex justify-center mb-7">
        <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553] max-w-full overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-4 md:px-6 py-3 rounded-lg transition-all duration-200 text-sm md:text-base ${
                activeCategory === category.id
                  ? 'bg-[#18ffc8] text-[#09100d] shadow-lg'
                  : 'text-[#efefef] hover:bg-[#376553] hover:text-[#efefef]'
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
      <div className="flex justify-center mb-12">
        <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553] max-w-full overflow-x-auto">
          {subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => setActiveSubCategory(subCategory.id)}
              className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 text-sm md:text-base ${
                activeSubCategory === subCategory.id
                  ? 'bg-[#fea92a] text-[#09100d] shadow-md'
                  : 'text-[#efefef] hover:bg-[#376553]'
              }`}
            >
              <span className="mr-2">{subCategory.icon}</span>
              <span className="font-medium whitespace-nowrap">{subCategory.name}</span>
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
            <div className="text-6xl mb-4 text-[#376553]">📭</div>
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
          navigate("/punter/create");
        }}
      >
        <FiPlus className="text-2xl group-hover:rotate-90 transition-transform" />
        <span className="ml-2">Create New Tip</span>
      </button>
    </div>
  );
};

export default DailyBread;