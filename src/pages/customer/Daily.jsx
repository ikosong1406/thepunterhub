import { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaStar, FaFire, FaGift, FaChartLine, FaFutbol, FaCheck, FaCopy } from 'react-icons/fa';
import Header from "./Header"

const DailyBread = () => {
  const [activeCategory, setActiveCategory] = useState('slice');
  const [activeSubCategory, setActiveSubCategory] = useState('sports');
  const [tips, setTips] = useState([]);
  const [purchasedTips, setPurchasedTips] = useState({});

  // Mock data for sports and trading tips
  useEffect(() => {
    const mockData = {
      slice: {
        sports: [
          {
            id: 1,
            punterName: "Elite Punter Pro",
            description: "Secure win prediction with 85% accuracy rate based on recent form and head-to-head statistics",
            price: 500,
            rating: 4.9,
            type: "sports",
            matches: ["Man City vs Arsenal"],
            confidence: 92,
            bookingCodes: [
              { company: "Bet365", code: "MCAR123", odd: 2.45 },
              { company: "1xBet", code: "X1AR456", odd: 2.40 }
            ]
          },
          {
            id: 2,
            punterName: "Goal Hunter",
            description: "Over 2.5 goals prediction with strong offensive lineup analysis",
            price: 350,
            rating: 4.7,
            type: "sports",
            matches: ["Barcelona vs PSG"],
            confidence: 88,
            bookingCodes: [
              { company: "Bet365", code: "BAPSG789", odd: 1.85 }
            ]
          }
        ],
        trading: [
          {
            id: 3,
            punterName: "Crypto Analyst",
            description: "BTC short-term position with clear entry and exit points based on technical analysis",
            price: 600,
            rating: 4.8,
            type: "trading",
            assets: [
              { symbol: "BTC/USDT", buy: 42500, sell: 43500, stopLoss: 42000 }
            ],
            timeframe: "4H",
            confidence: 85
          },
          {
            id: 4,
            punterName: "Forex Master",
            description: "EUR/USD breakout trade with risk management strategy included",
            price: 450,
            rating: 4.6,
            type: "trading",
            assets: [
              { symbol: "EUR/USD", buy: 1.0850, sell: 1.0950, stopLoss: 1.0800 }
            ],
            timeframe: "1D",
            confidence: 90
          }
        ]
      },
      loaf: {
        sports: [
          {
            id: 5,
            punterName: "Bundle Master",
            description: "5 carefully selected accumulator tips with comprehensive analysis",
            price: 1200,
            rating: 4.8,
            type: "sports",
            matches: ["Premier League Multi", "Champions League Special"],
            confidence: 78,
            bookingCodes: [
              { company: "Bet365", code: "ACC123", odd: 12.5 },
              { company: "1xBet", code: "ACC456", odd: 11.8 }
            ]
          }
        ],
        trading: [
          {
            id: 6,
            punterName: "Portfolio Manager",
            description: "3 crypto swing trades with detailed technical analysis and risk management",
            price: 1500,
            rating: 4.7,
            type: "trading",
            assets: [
              { symbol: "ETH/USDT", buy: 2500, sell: 2700, stopLoss: 2400 },
              { symbol: "SOL/USDT", buy: 95, sell: 110, stopLoss: 85 },
              { symbol: "XRP/USDT", buy: 0.58, sell: 0.65, stopLoss: 0.54 }
            ],
            timeframe: "Swing",
            confidence: 80
          }
        ]
      },
      crust: {
        sports: [
          {
            id: 7,
            punterName: "Free Tip Daily",
            description: "Daily free tip to help you get started - no risk involved",
            price: 0,
            rating: 4.5,
            type: "sports",
            matches: ["Free Match Pick"],
            confidence: 75,
            bookingCodes: [
              { company: "Bet365", code: "FREE123", odd: 2.1 }
            ]
          }
        ],
        trading: [
          {
            id: 8,
            punterName: "Market Analyst",
            description: "Free trading signal with basic technical analysis and entry points",
            price: 0,
            rating: 4.4,
            type: "trading",
            assets: [
              { symbol: "ADA/USDT", buy: 0.48, sell: 0.55, stopLoss: 0.45 }
            ],
            timeframe: "Intraday",
            confidence: 70
          }
        ]
      }
    };
    
    setTips(mockData[activeCategory]?.[activeSubCategory] || []);
  }, [activeCategory, activeSubCategory]);

  const categories = [
    { id: 'slice', name: 'Slice', icon: <FaStar />, description: 'Single Tip' },
    { id: 'loaf', name: 'Loaf', icon: <FaFire />, description: 'Bundle Tip' },
    { id: 'crust', name: 'Crust', icon: <FaGift />, description: 'Free Tip' }
  ];

  const subCategories = [
    { id: 'sports', name: 'Sports', icon: <FaFutbol /> },
    { id: 'trading', name: 'Trading', icon: <FaChartLine /> }
  ];

  const formatPrice = (price) => {
    return `${price.toLocaleString()} coins`;
  };

  const handleBuyTip = (tipId) => {
    setPurchasedTips(prev => ({
      ...prev,
      [tipId]: true
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-10">
        <Header />
      {/* Header */}
      <header className="text-center mb-12 pt-8">
        <h1 className="text-3xl font-bold text-[#18ffc8] mb-3 tracking-tight">Daily Bread</h1>
      </header>

      {/* Primary Category Navigation */}
      <div className="flex justify-center mb-7">
        <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553]">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-[#18ffc8] text-[#09100d] shadow-lg'
                  : 'text-[#efefef] hover:bg-[#376553] hover:text-[#efefef]'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{category.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sub Category Navigation */}
      <div className="flex justify-center mb-12">
        <div className="bg-[#162821] rounded-xl p-1 flex space-x-1 border border-[#376553]">
          {subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => setActiveSubCategory(subCategory.id)}
              className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 ${
                activeSubCategory === subCategory.id
                  ? 'bg-[#fea92a] text-[#09100d] shadow-md'
                  : 'text-[#efefef] hover:bg-[#376553]'
              }`}
            >
              <span className="mr-2">{subCategory.icon}</span>
              <span className="font-medium">{subCategory.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tips Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tips.map((tip) => (
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
                      <h3 className="font-semibold text-[#efefef]">{tip.punterName}</h3>
                      <div className="flex items-center space-x-2">
                        <FaStar className="text-[#fea92a] text-sm" />
                        <span className="text-sm text-[#efefef]">{tip.rating}</span>
                        <span className="text-xs bg-[#09100d] px-2 py-1 rounded-full text-[#376553]">
                          {tip.type === 'sports' ? 'Sports' : 'Trading'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tip Content */}
              <div className="p-4">
                <p className="text-[#efefef] mb-4 leading-relaxed text-sm">
                  {tip.description}
                </p>
                
                {/* Details Section */}
                <div className="bg-[#09100d] rounded-lg p-3 mb-4 border border-[#376553]">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-[#376553] text-xs font-medium">Confidence</div>
                      <div className="text-lg font-bold text-[#fea92a]">{tip.confidence}%</div>
                    </div>
                    {tip.type === 'sports' && (
                      <div>
                        <div className="text-[#376553] text-xs font-medium">Total Odds</div>
                        <div className="text-lg font-bold text-[#18ffc8]">
                          {tip.bookingCodes?.[0]?.odd || 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Specific Details */}
                  <div className="mt-2 pt-2 border-t border-[#162821]">
                    <div className="text-[#376553] text-xs font-medium">
                      {tip.type === 'sports' ? 'Matches' : 'Timeframe'}
                    </div>
                    <div className="text-[#efefef] text-sm mt-1">
                      {tip.type === 'sports' 
                        ? tip.matches?.join(', ')
                        : tip.timeframe
                      }
                    </div>
                  </div>
                </div>

                {/* Purchased Content */}
                {purchasedTips[tip.id] && (
                  <div className="bg-[#09100d] rounded-lg p-4 mb-4 border border-[#18ffc8]">
                    <div className="flex items-center mb-3">
                      <FaCheck className="text-[#18ffc8] mr-2" />
                      <span className="text-[#18ffc8] font-semibold">Purchased</span>
                    </div>
                    
                    {tip.type === 'sports' ? (
                      <div>
                        <h4 className="text-[#fea92a] font-semibold mb-2">Booking Codes:</h4>
                        {tip.bookingCodes?.map((code, index) => (
                          <div key={index} className="bg-[#162821] rounded p-3 mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[#efefef] font-medium">{code.company}</span>
                              <span className="text-[#18ffc8] font-bold">Odd: {code.odd}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <code className="text-[#f57cff] bg-[#09100d] px-2 py-1 rounded text-sm">
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
                        <h4 className="text-[#fea92a] font-semibold mb-2">Trading Signals:</h4>
                        {tip.assets?.map((asset, index) => (
                          <div key={index} className="bg-[#162821] rounded p-3 mb-2">
                            <div className="text-[#efefef] font-medium mb-2">{asset.symbol}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
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
                )}

                {/* Price & Buy Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[#376553] text-xs font-medium">Price</div>
                    <div className={`text-xl font-bold ${
                      tip.price === 0 ? 'text-[#f57cff]' : 'text-[#fea92a]'
                    }`}>
                      {tip.price === 0 ? 'FREE' : formatPrice(tip.price)}
                    </div>
                  </div>
                  
                  {!purchasedTips[tip.id] ? (
                    <button
                      onClick={() => handleBuyTip(tip.id)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        tip.price === 0
                          ? 'bg-[#855391] hover:bg-[#f57cff] text-[#efefef]'
                          : 'bg-[#18ffc8] hover:bg-[#fea92a] text-[#09100d]'
                      }`}
                    >
                      <FaShoppingCart />
                      <span className="font-bold">
                        {tip.price === 0 ? 'Get Free' : 'Buy Now'}
                      </span>
                    </button>
                  ) : (
                    <div className="text-[#18ffc8] font-semibold flex items-center">
                      <FaCheck className="mr-1" />
                      Purchased
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {tips.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 text-[#376553]">🍞</div>
          <h3 className="text-xl text-[#efefef] mb-2">No tips available</h3>
          <p className="text-[#376553]">Check back later for fresh insights!</p>
        </div>
      )}
    </div>
  );
};

export default DailyBread;