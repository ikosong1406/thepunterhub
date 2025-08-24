import React, { useState } from 'react';
import localforage from 'localforage';
import { IoMdClose } from 'react-icons/io';

// Exchange rates from USD to other currencies (example rates - a real app would use an API)
const exchangeRates = {
  NGN: 1540,  // Nigeria
  GHS: 10.6,  // Ghana
  ZAR: 18.5,  // South Africa
  KES: 130,   // Kenya
  EGP: 47.5,  // Egypt
  
  USD: 1,     // United States
  CAD: 1.37,  // Canada
  MXN: 17.5,  // Mexico
  BZD: 2.0,   // Belize
  CRC: 520,   // Costa Rica
  
  BRL: 5.4,   // Brazil
  ARS: 880,   // Argentina
  COP: 3950,  // Colombia
  PEN: 3.7,   // Peru
  CLP: 930,   // Chile

  GBP: 0.79,  // United Kingdom
  EUR: 0.92,  // France/Germany (Eurozone)
  AUD: 1.5,   // Australia
  NZD: 1.63,  // New Zealand
  FJD: 2.2,   // Fiji

  INR: 83.5,  // India
  CNY: 7.25,  // China
  JPY: 157,   // Japan
  SGD: 1.35,  // Singapore
  AED: 3.67,  // UAE
};

// Coin options with prices in USD
const coinOptions = [
  { coins: 100, priceUSD: 0.5, popular: false },
  { coins: 300, priceUSD: 1.5, popular: false },
  { coins: 500, priceUSD: 2.5, popular: true },
  { coins: 1000, priceUSD: 5, popular: false },
  { coins: 2000, priceUSD: 10, popular: false },
  { coins: 5000, priceUSD: 25, popular: true },
];

const BuyCoinModal = ({ user, onClose, onDepositSuccess }) => {
  const [selectedOption, setSelectedOption] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPriceAndCurrency = () => {
    const selectedCoin = coinOptions[selectedOption];
    let currencyCode = 'USD'; // Default to USD
    let price = selectedCoin.priceUSD;

    // Map country code to currency code
    const countryToCurrencyMap = {
      '+234': 'NGN', '+233': 'GHS', '+27': 'ZAR', '+254': 'KES', '+20': 'EGP',
      '+1': 'USD', '+52': 'MXN', '+501': 'BZD', '+506': 'CRC',
      '+55': 'BRL', '+54': 'ARS', '+57': 'COP', '+51': 'PEN', '+56': 'CLP',
      '+44': 'GBP', '+33': 'EUR', '+49': 'EUR', '+39': 'EUR', '+34': 'EUR',
      '+91': 'INR', '+86': 'CNY', '+81': 'JPY', '+65': 'SGD', '+971': 'AED',
      '+61': 'AUD', '+64': 'NZD', '+679': 'FJD'
    };

    const userCurrencyCode = countryToCurrencyMap[user.countryCode];
    if (userCurrencyCode && exchangeRates[userCurrencyCode]) {
      currencyCode = userCurrencyCode;
      price = selectedCoin.priceUSD * exchangeRates[userCurrencyCode];
    }

    return { price: price.toFixed(2), currency: currencyCode };
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await localforage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const selectedCoin = coinOptions[selectedOption];
      const { price, currency } = getPriceAndCurrency();

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // In a real app, you would call your deposit endpoint here
          // const depositResponse = await axios.post(`${Api}/client/deposit`, {
          //   token,
          //   amount: selectedCoin.coins,
          //   reference: `simulated-ref-${Date.now()}`,
          //   price,
          //   currency
          // });

          // Simulate successful deposit
          const newBalance = (user.balance || 0) + selectedCoin.coins;
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

  const { price, currency } = getPriceAndCurrency();

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case 'NGN': return '₦';
      case 'GHS': return 'GH₵';
      case 'ZAR': return 'R';
      case 'KES': return 'KSh';
      case 'EGP': return 'E£';
      case 'USD': return '$';
      case 'CAD': return 'C$';
      case 'MXN': return 'Mex$';
      case 'BZD': return 'BZ$';
      case 'CRC': return '₡';
      case 'BRL': return 'R$';
      case 'ARS': return 'ARS$';
      case 'COP': return 'Col$';
      case 'PEN': return 'S/';
      case 'CLP': return 'CLP$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'AUD': return 'A$';
      case 'NZD': return 'NZ$';
      case 'FJD': return 'FJ$';
      case 'INR': return '₹';
      case 'CNY': return '¥';
      case 'JPY': return '¥';
      case 'SGD': return 'S$';
      case 'AED': return 'د.إ';
      default: return '$';
    }
  };

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
          <h2
            className="text-xl font-bold"
            style={{ color: "#efefef" }}
          >
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
          {/* Current Balance */}
          <div
            className="mb-8 p-4 rounded-lg text-center"
            style={{ backgroundColor: "#162821" }}
          >
            <p
              className="text-sm mb-1"
              style={{ color: "#f57cff" }}
            >
              Your Current Balance
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: "#efefef" }}
            >
              {user.balance?.toFixed(0) || "0"} coins
            </p>
          </div>

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
                const { price, currency } = getPriceAndCurrency(index);
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOption === index
                        ? 'border-orange scale-105'
                        : 'border-lightGray hover:border-blue'
                    }`}
                    style={{
                      backgroundColor: selectedOption === index ? "#162821" : "#09100d"
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
                        <span
                          className="text-sm"
                          style={{ color: "#18ffc8" }}
                        >
                          coins
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              Selected Package
            </h4>

            <div className="flex justify-between items-center mb-2">
              <span style={{ color: "#efefef" }}>Coins:</span>
              <span
                className="font-bold"
                style={{ color: "#18ffc8" }}
              >
                {coinOptions[selectedOption].coins}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span style={{ color: "#efefef" }}>Price:</span>
              <span
                className="font-bold"
                style={{ color: "#18ffc8" }}
              >
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
              style={{ backgroundColor: "rgba(245, 124, 255, 0.1)", color: "#f57cff" }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              loading ? 'opacity-70' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: "#fea92a", color: "#09100d" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'BUY NOW'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCoinModal;