import React, { useState } from 'react';
// import axios from 'axios';
// import Api from '../../components/Api';
import localforage from 'localforage';
import { IoMdClose } from 'react-icons/io';

const coinOptions = [
  { coins: 100, priceNGN: 500, priceGHS: 10, popular: false },
  { coins: 300, priceNGN: 1500, priceGHS: 30, popular: false },
  { coins: 500, priceNGN: 2500, priceGHS: 50, popular: true },
  { coins: 1000, priceNGN: 5000, priceGHS: 100, popular: false },
  { coins: 2000, priceNGN: 10000, priceGHS: 200, popular: false },
  { coins: 5000, priceNGN: 25000, priceGHS: 500, popular: true },
];

const BuyCoinModal = ({ user, onClose, onDepositSuccess }) => {
  const [selectedOption, setSelectedOption] = useState(2); // Default to popular option
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await localforage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const selectedCoin = coinOptions[selectedOption];
      const amount = user.countryCode === '+234' ? selectedCoin.priceNGN : selectedCoin.priceGHS;
      const currency = user.countryCode === '+234' ? 'NGN' : 'GHS';

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // In a real app, you would call your deposit endpoint here
          // const depositResponse = await axios.post(`${Api}/client/deposit`, {
          //   token,
          //   amount: selectedCoin.coins,
          //   reference: `simulated-ref-${Date.now()}`
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
              {coinOptions.map((option, index) => (
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
                    
                    <div 
                      className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: selectedOption === index ? "#376553" : "#162821",
                        color: "#efefef"
                      }}
                    >
                      {user.countryCode === '+234' ? '₦' : 'GH₵'}
                      {user.countryCode === '+234' ? option.priceNGN : option.priceGHS}
                    </div>
                  </div>
                </div>
              ))}
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
                {user.countryCode === '+234' ? '₦' : 'GH₵'}
                {user.countryCode === '+234' 
                  ? coinOptions[selectedOption].priceNGN 
                  : coinOptions[selectedOption].priceGHS}
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