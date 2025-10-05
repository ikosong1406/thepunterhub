import { useState, useEffect } from "react";
import {
  FaUser,
  FaShoppingCart,
  FaStar,
  FaFire,
  FaGift,
  FaChartLine,
  FaFutbol,
  FaCheck,
  FaCopy,
  FaBookmark,
  FaArrowUp, // New icon for 'Buy' direction
  FaArrowDown, // New icon for 'Sell' direction
} from "react-icons/fa";
import Header from "./Header";

// Helper component for the "My Tips" button/link
// Note: In a real app, this would use React Router's <Link> or history.push()
const MyTipsButton = ({ tipCount, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 rounded-full bg-[#162821] text-[#fea92a] hover:bg-[#376553] transition-colors duration-200 border border-[#376553] ml-4"
    aria-label="Go to My Purchased Tips Page"
  >
    <FaBookmark className="text-xl" />
    {tipCount > 0 && (
      <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-[#18ffc8] text-[#09100d] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#09100d]">
        {tipCount}
      </span>
    )}
  </button>
);

const DailyBread = () => {
  const [activeCategory, setActiveCategory] = useState("slice");
  const [activeSubCategory, setActiveSubCategory] = useState("sports");
  const [tips, setTips] = useState([]);
  const [purchasedTips, setPurchasedTips] = useState({});

  // --- MOCK DATA (UPDATED with 'direction' for trading tips) ---
  const mockData = {
    slice: {
      sports: [
        {
          id: 1,
          punterName: "Elite Punter Pro",
          description:
            "Secure win prediction with 85% accuracy rate based on recent form and head-to-head statistics",
          price: 500,
          rating: 4.9,
          type: "sports",
          matches: ["Man City vs Arsenal"],
          bookingCodes: [
            { company: "Bet365", code: "MCAR123", odd: 2.45 },
            { company: "1xBet", code: "X1AR456", odd: 2.4 },
          ],
        },
        {
          id: 2,
          punterName: "Goal Hunter",
          description:
            "Over 2.5 goals prediction with strong offensive lineup analysis",
          price: 350,
          rating: 4.7,
          type: "sports",
          matches: ["Barcelona vs PSG"],
          bookingCodes: [{ company: "Bet365", code: "BAPSG789", odd: 1.85 }],
        },
      ],
      trading: [
        {
          id: 3,
          punterName: "Crypto Analyst",
          description:
            "BTC short-term position with clear entry and exit points based on technical analysis",
          price: 600,
          rating: 4.8,
          type: "trading",
          direction: "Sell", // Added direction
          assets: [
            { symbol: "BTC/USDT", buy: 42500, sell: 43500, stopLoss: 42000 },
          ],
          timeframe: "4H",
        },
        {
          id: 4,
          punterName: "Forex Master",
          description:
            "EUR/USD breakout trade with risk management strategy included",
          price: 450,
          rating: 4.6,
          type: "trading",
          direction: "Buy", // Added direction
          assets: [
            { symbol: "EUR/USD", buy: 1.085, sell: 1.095, stopLoss: 1.08 },
          ],
          timeframe: "1D",
        },
      ],
    },
    loaf: {
      sports: [
        {
          id: 5,
          punterName: "Bundle Master",
          description:
            "5 carefully selected accumulator tips with comprehensive analysis",
          price: 1200,
          rating: 4.8,
          type: "sports",
          matches: ["Premier League Multi", "Champions League Special"],
          bookingCodes: [
            { company: "Bet365", code: "ACC123", odd: 12.5 },
            { company: "1xBet", code: "ACC456", odd: 11.8 },
          ],
        },
      ],
      trading: [
        {
          id: 6,
          punterName: "Portfolio Manager",
          description:
            "3 crypto swing trades with detailed technical analysis and risk management",
          price: 1500,
          rating: 4.7,
          type: "trading",
          direction: "Buy", // Added direction
          assets: [
            { symbol: "ETH/USDT", buy: 2500, sell: 2700, stopLoss: 2400 },
            { symbol: "SOL/USDT", buy: 95, sell: 110, stopLoss: 85 },
            { symbol: "XRP/USDT", buy: 0.58, sell: 0.65, stopLoss: 0.54 },
          ],
          timeframe: "Swing",
        },
      ],
    },
    crust: {
      sports: [
        {
          id: 7,
          punterName: "Free Tip Daily",
          description:
            "Daily free tip to help you get started - no risk involved",
          price: 0,
          rating: 4.5,
          type: "sports",
          matches: ["Free Match Pick"],
          bookingCodes: [{ company: "Bet365", code: "FREE123", odd: 2.1 }],
        },
      ],
      trading: [
        {
          id: 8,
          punterName: "Market Analyst",
          description:
            "Free trading signal with basic technical analysis and entry points",
          price: 0,
          rating: 4.4,
          type: "trading",
          direction: "Sell", // Added direction
          assets: [
            { symbol: "ADA/USDT", buy: 0.48, sell: 0.55, stopLoss: 0.45 },
          ],
          timeframe: "Intraday",
        },
      ],
    },
  };
  // --- END MOCK DATA ---

  useEffect(() => {
    // Reverted to original loading logic: load tips based on active category/subcategory
    setTips(mockData[activeCategory]?.[activeSubCategory] || []);
  }, [activeCategory, activeSubCategory]);

  const categories = [
    { id: "slice", name: "Slice", icon: <FaStar />, description: "Single Tip" },
    { id: "loaf", name: "Loaf", icon: <FaFire />, description: "Bundle Tip" },
    { id: "crust", name: "Crust", icon: <FaGift />, description: "Free Tip" },
  ];

  const subCategories = [
    { id: "sports", name: "Sports", icon: <FaFutbol /> },
    { id: "trading", name: "Trading", icon: <FaChartLine /> },
  ];

  const formatPrice = (price) => {
    return `${price.toLocaleString()} coins`;
  };

  const handleBuyTip = (tipId) => {
    setPurchasedTips((prev) => ({
      ...prev,
      [tipId]: true,
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const purchasedTipCount = Object.keys(purchasedTips).length;

  // Function to simulate redirection - doesn't need to change state here
  const handleGoToMyTips = () => {
    alert("Redirecting to the /my-purchased-tips page...");
    // In a real application, you would use:
    // navigate('/my-purchased-tips');
  };

  // Helper to determine the text and color for trading direction
  const getDirectionDetails = (direction) => {
    if (direction === "Buy") {
      return {
        text: "Buy",
        color: "text-[#18ffc8]",
        icon: <FaArrowUp className="w-4 h-4 mr-1" />,
      };
    }
    if (direction === "Sell") {
      return {
        text: "Sell",
        color: "text-[#f57cff]",
        icon: <FaArrowDown className="w-4 h-4 mr-1" />,
      };
    }
    return { text: "N/A", color: "text-[#376553]", icon: null };
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-10">
      <Header />
      
      {/* Fixed Navigation Container */}
      <div className="sticky top-0 z-10 bg-[#09100d] pb-4">
        {/* Header - Daily Bread Title and My Tips Icon */}
        <header className="flex justify-between items-center mb-6 pt-8">
          <h1 className="text-3xl font-bold text-[#18ffc8] tracking-tight">
            Daily Bread
          </h1>
          <MyTipsButton
            tipCount={purchasedTipCount}
            onClick={handleGoToMyTips} // Simulate redirection
          />
        </header>

        {/* Primary Category Navigation */}
        <div className="flex justify-center mb-3">
          <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553] w-full max-w-lg">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 flex items-center justify-center px-2 py-3 rounded-lg transition-all duration-200 text-center ${
                  activeCategory === category.id
                    ? "bg-[#18ffc8] text-[#09100d] shadow-lg"
                    : "text-[#efefef] hover:bg-[#376553] hover:text-[#efefef]"
                }`}
              >
                <span className="mr-2 text-xl">{category.icon}</span>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-sm">{category.name}</div>
                  <div className="text-xs opacity-80">{category.description}</div>
                </div>
                {/* Mobile-only name */}
                <div className="font-semibold text-sm sm:hidden">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sub Category Navigation */}
        <div className="flex justify-center">
          <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553] w-full max-w-sm">
            {subCategories.map((subCategory) => (
              <button
                key={subCategory.id}
                onClick={() => setActiveSubCategory(subCategory.id)}
                className={`flex-1 flex items-center justify-center px-6 py-2 rounded-lg transition-all duration-200 ${
                  activeSubCategory === subCategory.id
                    ? "bg-[#fea92a] text-[#09100d] shadow-md"
                    : "text-[#efefef] hover:bg-[#376553]"
                }`}
              >
                <span className="mr-2 text-lg">{subCategory.icon}</span>
                <span className="font-medium">{subCategory.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* End Fixed Navigation Container */}
      <hr className="border-t border-[#376553] mb-8" />


      {/* Tips Grid (Scrollable Content) */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tips.map((tip) => {
            const directionDetails = tip.type === 'trading' ? getDirectionDetails(tip.direction) : null;
            
            return (
            <div
              key={tip.id}
              className="bg-[#162821] rounded-xl overflow-hidden border border-[#376553] hover:border-[#18ffc8] transition-all duration-300 group"
            >
              {/* Punter Header */}
              <div className="bg-[#376553] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#855391] rounded-full flex items-center justify-center">
                      <FaUser className="text-[#efefef]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#efefef]">
                        {tip.punterName}
                      </h3>
                      <div className="flex items-center text-xs text-[#fea92a]">
                        <FaStar className="mr-1" />
                        <span>{tip.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tip Content */}
              <div className="p-4">
                <p className="text-[#efefef] mb-4 leading-relaxed text-sm italic">
                  "{tip.description}"
                </p>

                {/* Details Section - Simplified */}
                <div className="bg-[#09100d] rounded-lg p-3 mb-4 border border-[#376553]">
                  {tip.type === "sports" && (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[#376553] text-xs font-medium">
                          Potential Max Odd
                        </div>
                        <div className="text-xl font-bold text-[#18ffc8]">
                          {tip.bookingCodes?.[0]?.odd || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[#376553] text-xs font-medium">
                          {tip.type === "sports" ? "Matches" : "Timeframe"}
                        </div>
                        <div className="text-[#efefef] text-sm mt-1 font-medium">
                          {tip.type === "sports"
                            ? `${tip.matches?.length} Event(s)`
                            : tip.timeframe}
                        </div>
                      </div>
                    </div>
                  )}
                  {tip.type === "trading" && directionDetails && (
                     <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-[#376553] text-xs font-medium mr-4">
                          Direction
                        </div>
                        <div className={`flex items-center text-xl font-bold ${directionDetails.color}`}>
                          {directionDetails.icon}
                          {directionDetails.text}
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[#376553] text-xs font-medium">
                          Timeframe
                        </div>
                        <div className="text-[#efefef] text-sm mt-1 font-medium">
                          {tip.timeframe}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Purchased Content (Unchanged) */}
                {purchasedTips[tip.id] && (
                  <div className="bg-[#09100d] rounded-lg p-4 mb-4 border border-[#18ffc8]">
                    <div className="flex items-center mb-3">
                      <FaCheck className="text-[#18ffc8] mr-2" />
                      <span className="text-[#18ffc8] font-semibold">
                        Purchased Details
                      </span>
                    </div>

                    {tip.type === "sports" ? (
                      <div>
                        <h4 className="text-[#fea92a] font-semibold mb-2">
                          Booking Codes:
                        </h4>
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
                              <code className="text-[#f57cff] bg-[#09100d] px-2 py-1 rounded text-sm overflow-auto">
                                {code.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(code.code)}
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
                          <div
                            key={index}
                            className="bg-[#162821] rounded p-3 mb-2"
                          >
                            <div className="text-[#efefef] font-medium mb-2 border-b border-[#376553] pb-2">
                              {asset.symbol}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm pt-2">
                              <div className="text-[#18ffc8] text-center">
                                <div className="text-xs text-[#376553]">Buy</div>
                                <div className="font-bold">{asset.buy}</div>
                              </div>
                              <div className="text-[#f57cff] text-center">
                                <div className="text-xs text-[#376553]">Sell</div>
                                <div className="font-bold">{asset.sell}</div>
                              </div>
                              <div className="text-[#fea92a] text-center">
                                <div className="text-xs text-[#376553]">
                                  Stop Loss
                                </div>
                                <div className="font-bold">
                                  {asset.stopLoss}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Price & Buy Button (Unchanged) */}
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

                  {!purchasedTips[tip.id] ? (
                    <button
                      onClick={() => handleBuyTip(tip.id)}
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
                    <div className="text-[#18ffc8] font-semibold flex items-center">
                      <FaCheck className="mr-1" />
                      View Details
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
          <div className="text-6xl mb-4 text-[#376553]">🍞</div>
          <h3 className="text-xl text-[#efefef] mb-2">No tips available for this category.</h3>
          <p className="text-[#376553]">Check back later for fresh insights!</p>
        </div>
      )}
    </div>
  );
};

export default DailyBread;