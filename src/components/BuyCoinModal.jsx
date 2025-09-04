import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

// Coin options with prices in USD
const coinOptions = [
  { coins: 100, priceUSD: 100, popular: false },
  { coins: 300, priceUSD: 300, popular: false },
  { coins: 500, priceUSD: 500, popular: true },
  { coins: 1000, priceUSD: 1000, popular: false },
  { coins: 2000, priceUSD: 2000, popular: false },
  { coins: 5000, priceUSD: 5000, popular: true },
];

const BuyCoinModal = ({ user, onClose, onDepositSuccess }) => {
  const [selectedOption, setSelectedOption] = useState(2);
  const [customCoins, setCustomCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setRatesLoading(true);
        const response = await axios.get("https://v6.exchangerate-api.com/v6/5a103662f87d0a5ac0043c95/latest/USD");
        if (response.status !== 200) {
          throw new Error("Failed to fetch exchange rates");
        }
        setExchangeRates(response.data.conversion_rates);
        setRatesLoading(false);
      } catch (err) {
        setError("Error fetching exchange rates. Please try again later.");
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, []);

  const getPriceAndCurrency = () => {
    let coins = 0;
    if (selectedOption === -1) {
      // Custom input is selected
      coins = parseInt(customCoins, 10) || 0;
    } else {
      coins = coinOptions[selectedOption].coins;
    }

    const priceUSD = coins * 1; // 1 coin = $0.005 USD, based on the priceUSD of the first package
    let currencyCode = "USD"; // Default to USD
    let price = priceUSD;

    const countryToCurrencyMap = {
      "+234": "NGN",
      "+233": "GHS",
      "+27": "ZAR",
      "+254": "KES",
      "+20": "EGP",
      "+1": "USD",
      "+52": "MXN",
      "+501": "BZD",
      "+506": "CRC",
      "+55": "BRL",
      "+54": "ARS",
      "+57": "COP",
      "+51": "PEN",
      "+56": "CLP",
      "+44": "GBP",
      "+33": "EUR",
      "+49": "EUR",
      "+39": "EUR",
      "+34": "EUR",
      "+91": "INR",
      "+86": "CNY",
      "+81": "JPY",
      "+65": "SGD",
      "+971": "AED",
      "+61": "AUD",
      "+64": "NZD",
      "+679": "FJD",
    };

    const userCurrencyCode = countryToCurrencyMap[user.countryCode];
    if (
      userCurrencyCode &&
      exchangeRates &&
      exchangeRates[userCurrencyCode]
    ) {
      currencyCode = userCurrencyCode;
      price = priceUSD * exchangeRates[userCurrencyCode];
    }

    return { price: price.toFixed(2), currency: currencyCode, coins };
  };

  const handlePayment = async () => {
    if (loading || ratesLoading) return;

    try {
      setLoading(true);
      setError(null);

      const token = await localforage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const { coins, price, currency } = getPriceAndCurrency();
      if (coins <= 0) {
        throw new Error("Please select or enter a valid number of coins.");
      }

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // In a real app, you would call your deposit endpoint here
          // const depositResponse = await axios.post(`${Api}/client/deposit`, {
          //   token,
          //   amount: coins,
          //   reference: `simulated-ref-${Date.now()}`,
          //   price,
          //   currency
          // });

          // Simulate successful deposit
          const newBalance = (user.balance || 0) + coins;
          onDepositSuccess(newBalance);
          onClose();
        } catch (err) {
          setError(err.response?.data?.message || "Deposit processing failed");
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const { price, currency, coins } = getPriceAndCurrency();

  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case "NGN":
        return "₦";
      case "GHS":
        return "GH₵";
      case "ZAR":
        return "R";
      case "KES":
        return "KSh";
      case "EGP":
        return "E£";
      case "USD":
        return "$";
      case "CAD":
        return "C$";
      case "MXN":
        return "Mex$";
      case "BZD":
        return "BZ$";
      case "CRC":
        return "₡";
      case "BRL":
        return "R$";
      case "ARS":
        return "ARS$";
      case "COP":
        return "Col$";
      case "PEN":
        return "S/";
      case "CLP":
        return "CLP$";
      case "GBP":
        return "£";
      case "EUR":
        return "€";
      case "AUD":
        return "A$";
      case "NZD":
        return "NZ$";
      case "FJD":
        return "FJ$";
      case "INR":
        return "₹";
      case "CNY":
        return "¥";
      case "JPY":
        return "¥";
      case "SGD":
        return "S$";
      case "AED":
        return "د.إ";
      default:
        return "$";
    }
  };

  if (ratesLoading) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
        style={{ backgroundColor: "#09100d" }}
      >
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-white"
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
          <span className="mt-4 text-white">Loading rates...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
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
              Select Package
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {coinOptions.map((option, index) => {
                return (
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
                        POPULAR
                      </div>
                    )}

                    <div className="flex flex-col items-center">
                      <div className="flex items-end mb-2">
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
                      <span className="text-xs" style={{ color: "#999" }}>
                        ({getCurrencySymbol("USD")}
                        {option.priceUSD})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-center text-gray-400 my-4">OR</p>
          {/* Custom Coin Input */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#efefef" }}
            >
              Enter Custom Amount
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
              />
            </div>
          </div>

          {/* Selected Package Details */}
          <div
            className="mb-8 p-4 rounded-lg"
            style={{ backgroundColor: "#162821" }}
          >
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "#f57cff" }}
            >
              Summary
            </h4>

            <div className="flex justify-between items-center mb-2">
              <span style={{ color: "#efefef" }}>Coins:</span>
              <span className="font-bold" style={{ color: "#18ffc8" }}>
                {coins}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span style={{ color: "#efefef" }}>Price:</span>
              <span className="font-bold" style={{ color: "#18ffc8" }}>
                {getCurrencySymbol(currency)}
                {price}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            disabled={loading || ratesLoading || coins <= 0}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              loading || ratesLoading || coins <= 0
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
              "BUY NOW"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCoinModal;