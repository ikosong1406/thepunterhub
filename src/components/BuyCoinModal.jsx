import { useState, useMemo } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { usePaystackPayment } from "react-paystack";
import { toast, Toaster } from "react-hot-toast";
import Api from "../components/Api";

// --- Base Price is 1 Coin = 100 NGN (₦100) ---
const COIN_TO_NGN_RATE = 100;

const coinOptions = [
  { coins: 10, priceNGN: 10 * COIN_TO_NGN_RATE, popular: false, bonus: 0 },
  { coins: 20, priceNGN: 20 * COIN_TO_NGN_RATE, popular: false, bonus: 0 },
  { coins: 50, priceNGN: 50 * COIN_TO_NGN_RATE, popular: true, bonus: 0 },
  { coins: 100, priceNGN: 100 * COIN_TO_NGN_RATE, popular: true, bonus: 0 },
  { coins: 250, priceNGN: 250 * COIN_TO_NGN_RATE, popular: false, bonus: 0 },
  { coins: 500, priceNGN: 500 * COIN_TO_NGN_RATE, popular: true, bonus: 0 },
  { coins: 1000, priceNGN: 1000 * COIN_TO_NGN_RATE, popular: false, bonus: 0 },
  { coins: 2000, priceNGN: 2000 * COIN_TO_NGN_RATE, popular: false, bonus: 0 },
];

// 🚀 UPDATED: Pricing calculation now only returns the equivalent coin price in NGN.
const calculatePricing = (selectedOption, customCoins) => {
  let baseCoins = 0;
  let basePriceNGN = 0;
  let bonusCoins = 0;

  if (selectedOption === -1) {
    baseCoins = parseInt(customCoins, 10) || 0;
    basePriceNGN = baseCoins * COIN_TO_NGN_RATE;
  } else if (selectedOption >= 0 && selectedOption < coinOptions.length) {
    const option = coinOptions[selectedOption];
    baseCoins = option.coins;
    basePriceNGN = option.priceNGN;
    bonusCoins = option.bonus || 0; // Ensure bonus is 0 if not set
  }

  const totalCoins = baseCoins + bonusCoins;

  // --- Transaction Fee Logic REMOVED ---
  // The user pays exactly the base price.
  const transactionPrice = basePriceNGN;

  // Amount in kobo for Paystack
  const amountInLowestUnit = Math.round(transactionPrice * 100);

  return {
    coins: totalCoins,
    baseCoins: baseCoins,
    bonusCoins: bonusCoins,
    displayPrice: basePriceNGN.toFixed(2),
    transactionPrice: transactionPrice.toFixed(2),
    transactionCurrency: "NGN",
    amount: amountInLowestUnit,
  };
};

const BuyCoinModal = ({ user, onClose, onDepositSuccess }) => {
  // Set default selection to the first "POPULAR" package (index 2: 50 coins)
  const defaultPopularIndex = coinOptions.findIndex(opt => opt.popular);
  const [selectedOption, setSelectedOption] = useState(defaultPopularIndex !== -1 ? defaultPopularIndex : 0);
  const [customCoins, setCustomCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // You can switch to the test key if needed: "pk_test_c42384ba4484dd9a4be899cbd29120e0811d9494";
  const PAYSTACK_PUBLIC_KEY = "pk_live_88049df40dfab386bf10d09a9956ec7ae346b91d";

  // Use useMemo to ensure pricing recalculates ONLY when state changes
  const pricing = useMemo(() => {
    return calculatePricing(selectedOption, customCoins);
  }, [selectedOption, customCoins]);

  // Destructure the memoized pricing for use in the UI and config
  const {
    coins,
    baseCoins,
    displayPrice,
    transactionPrice,
    transactionCurrency,
    amount,
  } = pricing;

  // The config uses the fresh memoized amount
  const config = {
    reference: new Date().getTime().toString(),
    email: user.email,
    amount: amount, 
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: "NGN",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference) => {
    setLoading(true);
    setError(null);

    // Re-calculate the current amount just before sending for reliability.
    const currentPricing = calculatePricing(selectedOption, customCoins);

    try {
      // Send the TOTAL coins (currentPricing.coins) to the backend
      const data = {
        userId: user._id,
        // Use the freshest calculated value for the deposit amount
        amount: Number(currentPricing.coins), 
      };

      // Check for valid amount before sending
      if (isNaN(data.amount) || data.amount <= 0) {
        throw new Error("Invalid deposit amount calculated (0 or less).");
      }

      await axios.post(`${Api}/client/deposit`, data);

      toast.success("Deposit successful! Please refresh the page.");

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to update balance. Please contact support.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onClosePaystack = () => {
    console.log("Payment modal closed");
    setLoading(false);
  };

  const handlePayment = () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    // Minimum coin purchase (base coins)
    if (baseCoins < 5 && selectedOption === -1) {
      toast.error("Minimum custom deposit is 5 coins.");
      setLoading(false);
      return;
    }
    if (baseCoins <= 0) {
      setError("Please select or enter a valid number of coins.");
      setLoading(false);
      return;
    }
    if (amount <= 0 || isNaN(amount)) {
      setError(
        "Calculated transaction amount is zero or less. Please select a larger coin amount."
      );
      setLoading(false);
      return;
    }

    initializePayment({
      onSuccess,
      onClose: onClosePaystack,
    });
  };

  const getCurrencySymbol = (currencyCode) => {
    return "₦";
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <Toaster />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "#efefef" }}>
            Buy Coins
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        {/* Main Content */}
        <div className="flex-1 px-6 py-4">
          {/* Coin Packages */}
          <div className="mb-8">
            <h3
              className="text-base font-semibold mb-4"
              style={{ color: "#efefef" }}
            >
              Select Package (1 Coin = ₦100)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {coinOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedOption(index);
                    setCustomCoins("");
                  }}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOption === index
                      ? "border-orange-500 scale-105"
                      : "border-gray-500 hover:border-blue-500"
                  }`}
                  style={{
                    backgroundColor:
                      selectedOption === index ? "#162821" : "#09100d",
                    borderColor:
                      selectedOption === index
                        ? "#fea92a"
                        : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {option.popular && (
                    <div
                      className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: "#fea92a", color: "#09100d" }}
                    >
                      BEST VALUE
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end mb-1">
                      <span
                        className="text-xl font-bold mr-1"
                        style={{ color: "#efefef" }}
                      >
                        {option.coins}
                      </span>
                      <span className="text-xs" style={{ color: "#18ffc8" }}>
                        coins
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-400 my-4 text-xs">OR</p>
          {/* Custom Coin Input */}
          <div className="mb-8">
            <h3
              className="text-base font-semibold mb-4"
              style={{ color: "#efefef" }}
            >
              Enter Custom Amount (Min 5)
            </h3>
            <div
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedOption === -1
                  ? "border-orange-500 scale-105"
                  : "border-gray-500 hover:border-blue-500"
              }`}
              style={{
                backgroundColor: selectedOption === -1 ? "#162821" : "#09100d",
                borderColor:
                  selectedOption === -1
                    ? "#fea92a"
                    : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <input
                type="number"
                value={customCoins}
                onChange={(e) => {
                  setCustomCoins(e.target.value);
                  setSelectedOption(-1);
                }}
                placeholder="Enter number of coins"
                className="w-full text-center text-white bg-transparent outline-none border-none text-xl placeholder-gray-500 placeholder:text-base"
                style={{ color: "#efefef" }}
                min="5"
              />
            </div>
          </div>
          <div
            className="mb-8 p-4 rounded-lg"
            style={{ backgroundColor: "#162821" }}
          >
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: "#efefef" }} className="text-sm">Coins Purchased:</span>
              <span className="font-bold text-sm" style={{ color: "#18ffc8" }}>
                {baseCoins}
              </span>
            </div>
            <div
              className="border-t my-2"
              style={{ borderColor: "#376553" }}
            ></div>
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: "#efefef" }} className="text-sm">Price:</span>
              <span className="font-bold text-sm" style={{ color: "#efefef" }}>
                {getCurrencySymbol("NGN")} {displayPrice} NGN
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t" style={{ borderColor: "#376553" }}>
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-center text-sm"
              style={{
                backgroundColor: "rgba(245, 124, 255, 0.1)",
                color: "#f57cff",
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handlePayment}
            disabled={loading || baseCoins <= 0 || amount <= 0 || isNaN(amount)}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all text-base${
              loading || baseCoins <= 0 || amount <= 0 || isNaN(amount)
                ? "opacity-70 cursor-not-allowed"
                : "hover:opacity-90"
            }`}
            style={{ backgroundColor: "#fea92a", color: "#09100d" }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <span className="text-base">
              PAY {getCurrencySymbol(
                transactionCurrency
              )} {transactionPrice}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCoinModal;