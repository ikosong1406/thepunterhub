import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiPhone,
  FiCalendar,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";
import { FaFutbol, FaChartLine, FaExchangeAlt } from "react-icons/fa";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";

const CreateTipPage = () => {
  // Category selection
  const [activeCategory, setActiveCategory] = useState("sports");
  const categories = [
    { key: "sports", name: "Sports Betting", icon: <FaFutbol /> },
    { key: "trading", name: "Trading Signal", icon: <FaChartLine /> },
  ];
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token"); // or wherever you store your auth token
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.post(`${Api}/client/getUser`, { token });

        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Sports betting form state
  const [sportsForm, setSportsForm] = useState({
    site: "",
    code: "",
    startTime: "",
    totalOdd: "",
    confidence: 50,
    matches: [],
    sport: "football",
  });

  // Trading signal form state
  const [tradingForm, setTradingForm] = useState({
    pair: "",
    direction: "buy",
    entryPrice: "",
    takeProfit: "",
    stopLoss: "",
    timeFrame: "H4",
    confidence: 50,
    type: "forex", // default to forex
  });

  // Add new match to sports tip
  const addMatch = () => {
    setSportsForm({
      ...sportsForm,
      matches: [...sportsForm.matches, { teams: "", prediction: "", odd: "" }],
    });
  };

  // Remove match from sports tip
  const removeMatch = (index) => {
    const newMatches = [...sportsForm.matches];
    newMatches.splice(index, 1);
    setSportsForm({ ...sportsForm, matches: newMatches });
  };

  // Handle sports match input change
  const handleMatchChange = (index, field, value) => {
    const newMatches = [...sportsForm.matches];
    newMatches[index][field] = value;
    setSportsForm({ ...sportsForm, matches: newMatches });
  };

  // Handle trading form input change
  const handleTradingChange = (field, value) => {
    setTradingForm({ ...tradingForm, [field]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user.isVerified) {
        toast.error("You must be verified to publish a tip.");
        setIsSubmitting(false);
        return; // Stop the function execution
      }
      // This is the updated code block
      let signalData = {};

      if (activeCategory === "sports") {
        // Ensure matches is an array of objects
        const formattedMatches = sportsForm.matches.map((match) => ({
          team: match.team,
          prediction: match.prediction,
        }));

        signalData = {
          userId: user._id,
          primaryCategory: "sports",
          secondaryCategory: sportsForm.sport,
          bettingSite: sportsForm.site,
          bettingCode: sportsForm.code,
          startTime: sportsForm.startTime
            ? new Date(sportsForm.startTime)
            : null, // Convert to a Date object
          totalOdd: parseFloat(sportsForm.totalOdd), // Ensure totalOdd is a number
          confidenceLevel: parseInt(sportsForm.confidence, 10), // Ensure confidenceLevel is an integer
          matches: formattedMatches, // Matches field should be an array of objects
        };
      } else {
        signalData = {
          userId: user._id,
          primaryCategory: "trading",
          secondaryCategory: tradingForm.type,
          pair: tradingForm.pair,
          direction: tradingForm.direction,
          entryPrice: parseFloat(tradingForm.entryPrice), // Ensure entryPrice is a number
          takeProfit: parseFloat(tradingForm.takeProfit), // Ensure takeProfit is a number
          stopLoss: parseFloat(tradingForm.stopLoss), // Ensure stopLoss is a number
          timeFrame: tradingForm.timeFrame,
          confidenceLevel: parseInt(tradingForm.confidence, 10), // Ensure confidenceLevel is an integer
        };
      }

      // Submit to backend
      const response = await axios.post(
        `${Api}/client/createSignal`,
        signalData
      );

      // Clear form on success
      if (activeCategory === "sports") {
        setSportsForm({
          site: "",
          code: "",
          startTime: "",
          totalOdd: "",
          confidence: 50,
          matches: [],
          sport: "football",
        });
      } else {
        setTradingForm({
          pair: "",
          direction: "BUY",
          entryPrice: "",
          takeProfit: "",
          stopLoss: "",
          timeFrame: "H4",
          confidence: 50,
          type: "forex",
        });
      }

      // Show success message
      toast.success("Tip published successfully!");
    } catch (error) {
      console.error("Error publishing tip:", error);
      toast.error("Failed to publish tip. Please try again.");
    } finally {
      setIsSubmitting(false); // End the loading state
    }
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#fea92a]">Create New Tip</h1>
        <p className="text-[#efefef]/70">
          Share your prediction with subscribers
        </p>
      </div>

      {/* Category Selector */}
      <div className="flex border-b border-[#2a3a34] mb-6">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${
              activeCategory === category.key
                ? "text-[#18ffc8] border-b-2 border-[#18ffc8]"
                : "text-[#efefef]/50"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {activeCategory === "sports" ? (
          /* Sports Betting Form */
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Betting Site
                </label>
                <input
                  type="text"
                  value={sportsForm.site}
                  onChange={(e) =>
                    setSportsForm({ ...sportsForm, site: e.target.value })
                  }
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                  placeholder="Bet9ja, 1xBet, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Booking Code
                </label>
                <input
                  type="text"
                  value={sportsForm.code}
                  onChange={(e) =>
                    setSportsForm({ ...sportsForm, code: e.target.value })
                  }
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                  placeholder="3HG7D"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={sportsForm.startTime}
                    onChange={(e) =>
                      setSportsForm({
                        ...sportsForm,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none"
                    required
                  />
                  <FiClock className="absolute left-3 top-3 text-[#efefef]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Total Odd
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={sportsForm.totalOdd}
                    onChange={(e) =>
                      setSportsForm({ ...sportsForm, totalOdd: e.target.value })
                    }
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none"
                    placeholder="5.60"
                    required
                  />
                  <FiTrendingUp className="absolute left-3 top-3 text-[#efefef]/50" />
                </div>
              </div>
            </div>

            {/* Sport Selection */}
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Sport
              </label>
              <select
                value={sportsForm.sport}
                onChange={(e) =>
                  setSportsForm({ ...sportsForm, sport: e.target.value })
                }
                className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="cricket">Cricket</option>
                <option value="baseball">Baseball</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Confidence Slider */}
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Confidence: {sportsForm.confidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sportsForm.confidence}
                onChange={(e) =>
                  setSportsForm({ ...sportsForm, confidence: e.target.value })
                }
                className="w-full h-2 bg-[#376553] rounded-lg appearance-none cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(to right, #f57cff 0%, #fea92a ${sportsForm.confidence}%, #376553 ${sportsForm.confidence}%, #376553 100%)`,
                }}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Matches */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-[#efefef]/70">
                  Matches (Optional)
                </label>
                <button
                  type="button"
                  onClick={addMatch}
                  className="text-sm flex items-center text-[#18ffc8]"
                >
                  <FiPlus size={14} className="mr-1" /> Add Match
                </button>
              </div>

              {sportsForm.matches.length > 0 ? (
                <div className="space-y-3">
                  {sportsForm.matches.map((match, index) => (
                    <div
                      key={index}
                      className="bg-[#162821]/50 p-3 rounded-lg border border-[#376553]/30"
                    >
                      {/* Match fields remain the same */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeMatch(index)}
                          className="text-[#f57cff] hover:text-[#f57cff]/70"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs mb-1 text-[#efefef]/70">
                            Teams/Event
                          </label>
                          <input
                            type="text"
                            value={match.teams}
                            onChange={(e) =>
                              handleMatchChange(index, "teams", e.target.value)
                            }
                            className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none"
                            placeholder="Chelsea vs Arsenal"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1 text-[#efefef]/70">
                            Prediction
                          </label>
                          <input
                            type="text"
                            value={match.prediction}
                            onChange={(e) =>
                              handleMatchChange(
                                index,
                                "prediction",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none"
                            placeholder="Over 2.5 Goals"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#efefef]/50 italic">
                  No matches added. You can add matches if you want to specify
                  individual bets.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Trading Signal Form */
          <div className="space-y-4">
            {/* Trading Type Selection */}
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Trading Type
              </label>
              <select
                value={tradingForm.type}
                onChange={(e) => handleTradingChange("type", e.target.value)}
                className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
              >
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
                <option value="stocks">Stocks</option>
                <option value="commodities">Commodities</option>
                <option value="indices">Indices</option>
              </select>
            </div>

            {/* Pair and Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  {tradingForm.type === "forex"
                    ? "Currency Pair"
                    : tradingForm.type === "crypto"
                    ? "Crypto Pair"
                    : tradingForm.type === "stocks"
                    ? "Stock Symbol"
                    : tradingForm.type === "commodities"
                    ? "Commodity"
                    : "Index"}
                </label>
                <input
                  type="text"
                  value={tradingForm.pair}
                  onChange={(e) => handleTradingChange("pair", e.target.value)}
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                  placeholder={
                    tradingForm.type === "forex"
                      ? "EUR/USD"
                      : tradingForm.type === "crypto"
                      ? "BTC/USDT"
                      : tradingForm.type === "stocks"
                      ? "AAPL"
                      : tradingForm.type === "commodities"
                      ? "Gold"
                      : "SPX500"
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Direction
                </label>
                <select
                  value={tradingForm.direction}
                  onChange={(e) =>
                    handleTradingChange("direction", e.target.value)
                  }
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                >
                  <option value="buy">BUY</option>
                  <option value="sell">SELL</option>
                </select>
              </div>
            </div>

            {/* Price Levels */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Entry Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={tradingForm.entryPrice}
                    onChange={(e) =>
                      handleTradingChange("entryPrice", e.target.value)
                    }
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none"
                    required
                  />
                  <FiDollarSign className="absolute left-3 top-3 text-[#efefef]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#18ffc8]">
                  Take Profit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={tradingForm.takeProfit}
                    onChange={(e) =>
                      handleTradingChange("takeProfit", e.target.value)
                    }
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#18ffc8] focus:outline-none"
                    required
                  />
                  <FiTrendingUp className="absolute left-3 top-3 text-[#18ffc8]" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#f57cff]">
                  Stop Loss
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={tradingForm.stopLoss}
                    onChange={(e) =>
                      handleTradingChange("stopLoss", e.target.value)
                    }
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#f57cff] focus:outline-none"
                    required
                  />
                  <FiTrendingDown className="absolute left-3 top-3 text-[#f57cff]" />
                </div>
              </div>
            </div>

            {/* Time Frame and Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Time Frame
                </label>
                <select
                  value={tradingForm.timeFrame}
                  onChange={(e) =>
                    handleTradingChange("timeFrame", e.target.value)
                  }
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                >
                  <option value="M1">M1</option>
                  <option value="M5">M5</option>
                  <option value="M15">M15</option>
                  <option value="M30">M30</option>
                  <option value="H1">H1</option>
                  <option value="H4">H4</option>
                  <option value="D1">D1</option>
                  <option value="W1">W1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Confidence: {tradingForm.confidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tradingForm.confidence}
                  onChange={(e) =>
                    handleTradingChange("confidence", e.target.value)
                  }
                  className="w-full h-2 bg-[#376553] rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to right, #f57cff 0%, #fea92a ${tradingForm.confidence}%, #376553 ${tradingForm.confidence}%, #376553 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-[#fea92a] to-[#855391] text-[#09100d] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
          disabled={isSubmitting} // Disable the button while submitting
        >
          {isSubmitting
            ? `Publishing ${activeCategory === "sports" ? "Tip" : "Signal"}...`
            : `Publish ${activeCategory === "sports" ? "Tip" : "Signal"}`}
        </button>
      </form>
    </div>
  );
};

export default CreateTipPage;
