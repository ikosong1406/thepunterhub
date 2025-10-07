import { useState, useEffect, useMemo } from "react";
import { FiPlus, FiX, FiDollarSign, FiTag } from "react-icons/fi";
import { FaFutbol, FaChartLine } from "react-icons/fa";
import axios from "axios";
import Api from "../../components/Api"; // Assuming this path is correct
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";
import logoImage from "../../assets/logo2.png";

// Helper components for consistency (to avoid duplicating complex JSX)

const TipInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  step = null,
  icon: Icon = null,
  colorClass = null,
}) => (
  <div>
    <label className="block text-sm mb-1 text-[#efefef]/70">{label}</label>
    <div className="relative">
      <input
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 ${
          Icon ? "pl-10" : ""
        } focus:outline-none ${
          colorClass ? `focus:border-[${colorClass}]` : "focus:border-[#fea92a]"
        }`}
        placeholder={placeholder}
        required={required}
      />
      {Icon && (
        <Icon
          className={`absolute left-3 top-3 ${
            colorClass ? `text-[${colorClass}]` : "text-[#efefef]/50"
          }`}
        />
      )}
    </div>
  </div>
);

const CreateDaily = () => {
  // Primary Category selection (Sports/Trading)
  const [activeCategory, setActiveCategory] = useState("sports");
  const primaryCategories = [
    { key: "sports", name: "Sports Betting", icon: <FaFutbol /> },
    { key: "trading", name: "Trading Signal", icon: <FaChartLine /> },
  ];

  // Secondary Category selection (Slice/Loaf) - NEW
  const [secondaryCategory, setSecondaryCategory] = useState("slice");
  const secondaryCategories = [
    { key: "slice", name: "Slice" }, // Max 2, 2-5 Coin
    { key: "loaf", name: "Loaf" }, // Max 5, 5-15 Coin
  ];

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tip Schema fields
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // Maps to TipSchema.price

  // Dynamic Constraints based on secondaryCategory - NEW
  const { maxItems, minPrice, maxPrice } = useMemo(() => {
    if (secondaryCategory === "slice") {
      return { maxItems: 2, minPrice: 2, maxPrice: 5 };
    }
    return { maxItems: 5, minPrice: 5, maxPrice: 15 };
  }, [secondaryCategory]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }
        const response = await axios.post(`${Api}/client/getUser`, { token });
        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to fetch user data.");
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Sports betting form state
  const [sportsForm, setSportsForm] = useState({
    bookingCode: [{ bookingSite: "", code: "", odd: "" }],
    // Removed startTime as it's now handled by backend based on slice/loaf
  });

  // Trading signal form state
  const [tradingForm, setTradingForm] = useState({
    assets: [
      {
        // Start with one asset
        pair: "",
        direction: "buy",
        enteryPrice: "", // NOTE: Typo in schema: enteryPrice
        takeProfit: "",
        stopLoss: "",
        timeFrame: "H4",
      },
    ],
  });

  // --- Sports Betting Handlers ---
  const handleBookingCodeChange = (index, field, value) => {
    const newCodes = [...sportsForm.bookingCode];
    newCodes[index][field] = value;
    setSportsForm({ ...sportsForm, bookingCode: newCodes });
  };

  const addBookingCode = () => {
    if (sportsForm.bookingCode.length >= maxItems) {
      toast.error(
        `A ${secondaryCategory} tip can only contain up to ${maxItems} booking codes.`
      );
      return;
    }
    setSportsForm({
      ...sportsForm,
      bookingCode: [
        ...sportsForm.bookingCode,
        { bookingSite: "", code: "", odd: "" },
      ],
    });
  };

  const removeBookingCode = (index) => {
    if (sportsForm.bookingCode.length === 1 && secondaryCategory === "slice") {
      // Allow removal in slice only if it's not the single required input, but with the new constraint logic, we allow removal
    }
    const newCodes = [...sportsForm.bookingCode];
    newCodes.splice(index, 1);
    setSportsForm({ ...sportsForm, bookingCode: newCodes });
  };

  // --- Trading Signal Handlers ---
  const handleTradingAssetChange = (index, field, value) => {
    const newAssets = [...tradingForm.assets];
    newAssets[index][field] = value;
    setTradingForm({ ...tradingForm, assets: newAssets });
  };

  const addTradingAsset = () => {
    if (tradingForm.assets.length >= maxItems) {
      toast.error(
        `A ${secondaryCategory} signal can only contain up to ${maxItems} assets.`
      );
      return;
    }
    setTradingForm({
      ...tradingForm,
      assets: [
        ...tradingForm.assets,
        {
          pair: "",
          direction: "buy",
          enteryPrice: "",
          takeProfit: "",
          stopLoss: "",
          timeFrame: "H4",
        },
      ],
    });
  };

  const removeTradingAsset = (index) => {
    const newAssets = [...tradingForm.assets];
    newAssets.splice(index, 1);
    setTradingForm({ ...tradingForm, assets: newAssets });
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.isVerified) {
        toast.error("You must be verified to publish a tip.");
        setIsSubmitting(false);
        return;
      }

      const parsedPrice = parseFloat(price);
      if (
        isNaN(parsedPrice) ||
        parsedPrice < minPrice ||
        parsedPrice > maxPrice
      ) {
        toast.error(
          `Price must be between ${minPrice} and ${maxPrice} coin for a ${secondaryCategory} tip.`
        );
        setIsSubmitting(false);
        return;
      }

      let tipData = {
        punterName: user.username,
        punterId: user._id,
        description: description,
        price: parsedPrice, // Already validated
        primaryCategory: activeCategory,
        secondaryCategory: secondaryCategory, // This is now 'slice' or 'loaf'
      };

      if (activeCategory === "sports") {
        const hasValidCodes = sportsForm.bookingCode.every(
          (code) => code.bookingSite && code.code
        );
        if (sportsForm.bookingCode.length === 0 || !hasValidCodes) {
          toast.error("Please ensure all Booking Codes have a Site and Code.");
          setIsSubmitting(false);
          return;
        }

        const formattedBookingCodes = sportsForm.bookingCode.map((code) => ({
          bookingSite: code.bookingSite,
          code: code.code,
          odd: parseFloat(code.odd) || null,
        }));

        tipData = {
          ...tipData,
          bookingCode: formattedBookingCodes,
          assets: [],
        };
      } else {
        const hasValidAssets = tradingForm.assets.every(
          (asset) => asset.pair && asset.enteryPrice
        );
        if (tradingForm.assets.length === 0 || !hasValidAssets) {
          toast.error(
            "Please ensure all Trading Assets have a Pair and Entry Price."
          );
          setIsSubmitting(false);
          return;
        }

        const formattedAssets = tradingForm.assets.map((asset) => ({
          pair: asset.pair,
          direction: asset.direction,
          enteryPrice: parseFloat(asset.enteryPrice),
          takeProfit: parseFloat(asset.takeProfit) || null,
          stopLoss: parseFloat(asset.stopLoss) || null,
          timeFrame: asset.timeFrame,
        }));

        tipData = {
          ...tipData,
          assets: formattedAssets,
          bookingCode: [],
        };
      }

      // Submit to backend
      await axios.post(`${Api}/client/createTip`, tipData);

      // Clear form on success
      setDescription("");
      setPrice("");
      setSportsForm({ bookingCode: [{ bookingSite: "", code: "", odd: "" }] });
      setTradingForm({
        assets: [
          {
            pair: "",
            direction: "buy",
            enteryPrice: "",
            takeProfit: "",
            stopLoss: "",
            timeFrame: "H4",
          },
        ],
      });
      setSecondaryCategory("slice"); // Reset to default

      toast.success("Daily Tip published successfully!");
    } catch (error) {
      console.error("Error publishing tip:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to publish tip. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading/Error UI (omitted for brevity, assume the previous logic remains) ---
  if (loading)
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

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#fea92a]">Create Daily Bread</h1>
        <p className="text-[#efefef]/70">
          Share your daily prediction
        </p>
      </div>

      {/* Primary Category Selector */}
      <div className="flex border-b border-[#2a3a34] mb-6">
        {primaryCategories.map((category) => (
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
        <div className="space-y-6">
          {/* Secondary Category Selector (Slice/Loaf) - NEW */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#efefef]/70"></label>
            <div className="flex space-x-4">
              {secondaryCategories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSecondaryCategory(category.key)}
                  className={`flex-1 py-2 capitalize font-semibold rounded-lg transition-colors border-2 ${
                    secondaryCategory === category.key
                      ? "bg-[#fea92a] text-[#09100d] border-[#fea92a]"
                      : "bg-[#162821] text-[#efefef]/70 border-[#376553]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-[#2a3a34]" />

          {/* General Tip Info (Description and Price) */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Description (Max 200 chars)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none min-h-[80px]"
                placeholder="Brief summary of the tip/signal."
                required
              />
            </div>
            <TipInput
              label={`Price (Coins)`}
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={`${minPrice}.00 to ${maxPrice}.00`}
              required={true}
            />
          </div>

          <hr className="border-[#2a3a34]" />

          {activeCategory === "sports" ? (
            /* Sports Betting Form (Booking Codes) */
            <div className="space-y-4">
              {/* Booking Codes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-[#efefef]/70">
                    Booking Codes ({sportsForm.bookingCode.length} / {maxItems})
                  </label>
                  <button
                    type="button"
                    onClick={addBookingCode}
                    disabled={sportsForm.bookingCode.length >= maxItems}
                    className={`text-sm flex items-center transition-opacity ${
                      sportsForm.bookingCode.length >= maxItems
                        ? "text-[#efefef]/50"
                        : "text-[#18ffc8] hover:opacity-80"
                    }`}
                  >
                    <FiPlus size={14} className="mr-1" /> Add Code
                  </button>
                </div>

                <div className="space-y-3">
                  {sportsForm.bookingCode.map((code, index) => (
                    <div
                      key={index}
                      className="bg-[#162821]/50 p-3 rounded-lg border border-[#376553]/30"
                    >
                      {sportsForm.bookingCode.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeBookingCode(index)}
                            className="text-[#f57cff] hover:text-[#f57cff]/70"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Site Input */}
                        <TipInput
                          label="Site"
                          value={code.bookingSite}
                          onChange={(e) =>
                            handleBookingCodeChange(
                              index,
                              "bookingSite",
                              e.target.value
                            )
                          }
                          placeholder="Bet9ja"
                          required={true}
                        />
                        {/* Code Input */}
                        <TipInput
                          label="Code"
                          value={code.code}
                          onChange={(e) =>
                            handleBookingCodeChange(
                              index,
                              "code",
                              e.target.value
                            )
                          }
                          placeholder="3HG7D"
                          required={true}
                        />
                        {/* Odd Input */}
                        <TipInput
                          label="Odd (Optional)"
                          type="number"
                          step="0.01"
                          value={code.odd}
                          onChange={(e) =>
                            handleBookingCodeChange(
                              index,
                              "odd",
                              e.target.value
                            )
                          }
                          placeholder="5.60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Trading Signal Form (Assets) */
            <div className="space-y-4">
              {/* Assets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-[#efefef]/70">
                    Trading Assets ({tradingForm.assets.length} / {maxItems})
                  </label>
                  <button
                    type="button"
                    onClick={addTradingAsset}
                    disabled={tradingForm.assets.length >= maxItems}
                    className={`text-sm flex items-center transition-opacity ${
                      tradingForm.assets.length >= maxItems
                        ? "text-[#efefef]/50"
                        : "text-[#18ffc8] hover:opacity-80"
                    }`}
                  >
                    <FiPlus size={14} className="mr-1" /> Add Asset
                  </button>
                </div>

                <div className="space-y-3">
                  {tradingForm.assets.map((asset, index) => (
                    <div
                      key={index}
                      className="bg-[#162821]/50 p-3 rounded-lg border border-[#376553]/30"
                    >
                      {tradingForm.assets.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeTradingAsset(index)}
                            className="text-[#f57cff] hover:text-[#f57cff]/70"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Pair Input */}
                        <TipInput
                          label="Pair/Symbol"
                          value={asset.pair}
                          onChange={(e) =>
                            handleTradingAssetChange(
                              index,
                              "pair",
                              e.target.value
                            )
                          }
                          placeholder="EUR/USD or BTC/USDT"
                          required={true}
                        />
                        {/* Direction Select */}
                        <div>
                          <label className="block text-sm mb-1 text-[#efefef]/70">
                            Direction
                          </label>
                          <select
                            value={asset.direction}
                            onChange={(e) =>
                              handleTradingAssetChange(
                                index,
                                "direction",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                          >
                            <option value="buy">BUY / LONG</option>
                            <option value="sell">SELL / SHORT</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {/* Entry Price */}
                        <TipInput
                          label="Entry Price"
                          type="number"
                          step="any"
                          value={asset.enteryPrice}
                          onChange={(e) =>
                            handleTradingAssetChange(
                              index,
                              "enteryPrice",
                              e.target.value
                            )
                          }
                          required={true}
                        />
                        {/* Take Profit */}
                        <TipInput
                          label="Take Profit"
                          type="number"
                          step="any"
                          value={asset.takeProfit}
                          onChange={(e) =>
                            handleTradingAssetChange(
                              index,
                              "takeProfit",
                              e.target.value
                            )
                          }
                          colorClass="#18ffc8"
                        />
                        {/* Stop Loss */}
                        <TipInput
                          label="Stop Loss"
                          type="number"
                          step="any"
                          value={asset.stopLoss}
                          onChange={(e) =>
                            handleTradingAssetChange(
                              index,
                              "stopLoss",
                              e.target.value
                            )
                          }
                          colorClass="#f57cff"
                        />
                        {/* Time Frame Select */}
                        <div>
                          <label className="block text-sm mb-1 text-[#efefef]/70">
                            Time Frame
                          </label>
                          <select
                            value={asset.timeFrame}
                            onChange={(e) =>
                              handleTradingAssetChange(
                                index,
                                "timeFrame",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none"
                          >
                            <option value="M15">M15</option>
                            <option value="M30">M30</option>
                            <option value="H1">H1</option>
                            <option value="H4">H4</option>
                            <option value="D1">D1</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-[#fea92a] to-[#855391] text-[#09100d] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
          disabled={isSubmitting}
        >
          {isSubmitting ? `Publishing Daily Bread...` : `Publish Daily Bread`}
        </button>
      </form>
    </div>
  );
};

export default CreateDaily;
