import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { usePaystackPayment } from "react-paystack";
import { toast, Toaster } from "react-hot-toast";
import Api from "../components/Api";

// --- UPDATED: Base Price is 1 Coin = 100 NGN (₦100) ---
const COIN_TO_NGN_RATE = 100;

const coinOptions = [
  { coins: 10, priceNGN: 10 * COIN_TO_NGN_RATE, popular: false }, // ₦1,000
  { coins: 20, priceNGN: 20 * COIN_TO_NGN_RATE, popular: false }, // ₦2,000
  { coins: 50, priceNGN: 50 * COIN_TO_NGN_RATE, popular: true }, // ₦5,000 (sweet spot)
  { coins: 100, priceNGN: 100 * COIN_TO_NGN_RATE, popular: true }, // ₦10,000
  { coins: 250, priceNGN: 250 * COIN_TO_NGN_RATE, popular: false }, // ₦25,000
  { coins: 500, priceNGN: 500 * COIN_TO_NGN_RATE, popular: true }, // ₦50,000 (premium popular)
  { coins: 1000, priceNGN: 1000 * COIN_TO_NGN_RATE, popular: false }, // ₦100,000
  { coins: 2000, priceNGN: 2000 * COIN_TO_NGN_RATE, popular: false }, // ₦200,000 (whale package)
];

const BuyCoinModal = ({ user, onClose, onDepositSuccess }) => {
  // Set default selection to the first "POPULAR" package (index 1)
  const [selectedOption, setSelectedOption] = useState(1);
  const [customCoins, setCustomCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const PAYSTACK_PUBLIC_KEY =
    "pk_live_8cae50cbecfc7b94bb6d0fa77b5fb5ce2c5b5ad2";

  // --- UPDATED: Pricing and Tax Logic (Simplified for NGN only) ---
  const getPriceAndCurrency = () => {
    let baseCoins = 0;
    let basePriceNGN = 0;
    let bonusCoins = 0;

    if (selectedOption === -1) {
      baseCoins = parseInt(customCoins, 10) || 0;
      basePriceNGN = baseCoins * COIN_TO_NGN_RATE;
      bonusCoins = 0;
    } else {
      const option = coinOptions[selectedOption];
      baseCoins = option.coins;
      basePriceNGN = option.priceNGN;
      bonusCoins = option.bonus;
    }

    const totalCoins = baseCoins + bonusCoins;

    const transactionCurrency = "NGN";
    const displayCurrency = "NGN";

    // --- Transaction Fee Logic (2% Tax + ₦100 flat fee for high value) ---
    const taxRate = 0.02; // 2% tax
    let flatFee = 0;

    // NGN flat fee for base prices over ₦2500
    flatFee = basePriceNGN >= 2500 ? 50 : 0;

    // Price = (Base NGN Price + FlatFee) / (1 - TaxRate)
    const transactionPrice = (basePriceNGN + flatFee) / (1 - taxRate);

    // Amount in kobo for Paystack
    const amountInLowestUnit = Math.round(transactionPrice * 100);

    return {
      coins: totalCoins, // The total coins the user receives (Base + Bonus)
      baseCoins: baseCoins, // The actual number of coins purchased (for display)
      bonusCoins: bonusCoins,
      displayPrice: basePriceNGN.toFixed(2), // Base NGN price for clean display
      displayCurrency,
      transactionPrice: transactionPrice.toFixed(2),
      transactionCurrency,
      amount: amountInLowestUnit,
    };
  };

  const {
    coins,
    baseCoins,
    bonusCoins,
    displayPrice,
    transactionPrice,
    transactionCurrency,
    amount,
  } = getPriceAndCurrency();

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

    try {
      // Send the TOTAL coins (base + bonus) to the backend for updating the user's balance
      const data = {
        userId: user._id,
        amount: Number(coins),
      };
      await axios.post(`${Api}/client/deposit`, data);

      toast.success("Deposit successful! Your coins have been added.");
      onDepositSuccess(coins);

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
      // Adjusted minimum to 50 for custom
      toast.error("Minimum deposit is 5 coins.");
      setLoading(false);
      return;
    }
    if (baseCoins <= 0) {
      setError("Please select or enter a valid number of coins.");
      setLoading(false);
      return;
    }
    if (amount <= 0) {
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
          <h2 className="text-xl font-bold" style={{ color: "#efefef" }}>
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
              className="text-lg font-semibold mb-4"
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
                        className="text-2xl font-bold mr-1"
                        style={{ color: "#efefef" }}
                      >
                        {option.coins}
                      </span>
                      <span className="text-sm" style={{ color: "#18ffc8" }}>
                        coins
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-400 my-4">OR</p>
          {/* Custom Coin Input */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#efefef" }}
            >
              Enter Custom Amount (Min 5)
            </h3>
            <div
              className={`p-4 rounded-xl border-2 transition-all ${
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
                className="w-full text-center text-white bg-transparent outline-none border-none text-xl placeholder-gray-500"
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
              <span style={{ color: "#efefef" }}>Coins Purchased:</span>
              <span className="font-bold" style={{ color: "#18ffc8" }}>
                {baseCoins}
              </span>
            </div>
            <div
              className="border-t my-2"
              style={{ borderColor: "#376553" }}
            ></div>
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: "#efefef" }}>Price:</span>
              <span className="font-bold" style={{ color: "#efefef" }}>
                {getCurrencySymbol("NGN")} {displayPrice} NGN
              </span>
            </div>
            <p className="text-xs mt-2 text-gray-400">
              Final amount includes 2% processing fee and ₦50 flat fee for base
              prices over ₦2500.
            </p>
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
            disabled={loading || baseCoins <= 0 || amount <= 0}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              loading || baseCoins <= 0 || amount <= 0
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
              `PAY ${getCurrencySymbol(
                transactionCurrency
              )} ${transactionPrice}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCoinModal;
