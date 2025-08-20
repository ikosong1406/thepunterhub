import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import localforage from 'localforage';
import Api from "../components/Api"

// Define the bank options for each country
const bankOptions = {
  '+234': [ // Nigeria 🇳🇬
    { code: '044', name: 'Access Bank' },
    { code: '063', name: 'Ecobank Nigeria' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank (Microfinance)' },
    { code: '082', name: 'Keystone Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
    { code: 'MTN', name: 'MTN MoMo (Mobile Money)' },
    { code: 'AIRTEL', name: 'Airtel Money (Mobile Money)' },
  ],
  '+233': [ // Ghana 🇬🇭
    { code: '101', name: 'Absa Bank' },
    { code: '102', name: 'Ecobank Ghana' },
    { code: '103', name: 'Fidelity Bank Ghana' },
    { code: '104', name: 'First Atlantic Bank' },
    { code: '105', name: 'Ghana Commercial Bank' },
    { code: '106', name: 'Stanbic Bank Ghana' },
    { code: '107', name: 'United Bank for Africa (UBA) Ghana' },
    { code: 'MTN', name: 'MTN MoMo (Mobile Money)' },
    { code: 'VODAFONE', name: 'Vodafone Cash (Mobile Money)' },
    { code: 'AIRTELTIGO', name: 'AirtelTigo Money (Mobile Money)' },
  ],
  '+44': [ // United Kingdom 🇬🇧
    { code: 'BARCLAYS', name: 'Barclays' },
    { code: 'HSBC', name: 'HSBC' },
    { code: 'LLOYDS', name: 'Lloyds Bank' },
    { code: 'NATWEST', name: 'NatWest' },
    { code: 'SANTANDER', name: 'Santander UK' },
    { code: 'TSB', name: 'TSB Bank' },
    { code: 'REVOLUT', name: 'Revolut' },
    { code: 'MONZO', name: 'Monzo' },
  ],
  '+1': [ // United States 🇺🇸
    { code: 'CHASE', name: 'Chase Bank' },
    { code: 'BOA', name: 'Bank of America' },
    { code: 'WELLS_FARGO', name: 'Wells Fargo' },
    { code: 'CITI', name: 'Citibank' },
    { code: 'USBANK', name: 'U.S. Bank' },
    { code: 'VENMO', name: 'Venmo' },
    { code: 'CASHAPP', name: 'Cash App' },
    { code: 'PAYPAL', name: 'PayPal' },
  ],
};

const WithdrawModal = ({ user, onClose, onWithdrawSuccess }) => {
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateEquivalent = () => {
    if (!amount) return '0.00';
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '0.00';
    
    // Conversion rates (would come from your API in a real app)
    let rate;
    let currencySymbol;

    switch (user.countryCode) {
        case '+234':
            rate = 5; // Example: 1 coin = 5 NGN
            currencySymbol = '₦';
            break;
        case '+233':
            rate = 0.1; // Example: 1 coin = 0.1 GHS
            currencySymbol = 'GH₵';
            break;
        case '+44':
            rate = 0.005; // Example: 1 coin = 0.005 GBP
            currencySymbol = '£';
            break;
        case '+1':
        default:
            rate = 0.007; // Example: 1 coin = 0.007 USD
            currencySymbol = '$';
            break;
    }
    
    const equivalent = numericAmount * rate;
    
    return `${currencySymbol}${equivalent.toFixed(2)}`;
  };

  const handleWithdraw = async () => {
    if (!amount || !bankCode || !accountNumber || !accountName) {
      setError('Please fill all fields.');
      return;
    }

    if (parseFloat(amount) > user.balance) {
      setError('Insufficient balance.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const data =  {
        userId: user._id, // Send the user's ID
        amount: parseFloat(amount),
        bankCode,
        accountNumber,
        accountName,
      }
    
    try {
      const response = await axios.post(`${Api}/client/withdrawal`, data);
      
      onWithdrawSuccess(response.data.newBalance);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            Withdraw Funds
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {/* Balance Info */}
          <div 
            className="mb-6 p-4 rounded-lg text-center"
            style={{ backgroundColor: "#162821" }}
          >
            <p 
              className="text-sm mb-1"
              style={{ color: "#f57cff" }}
            >
              Available Balance
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ color: "#efefef" }}
            >
              {user.balance?.toFixed(0) || "0"} coins
            </p>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label 
              className="block text-sm mb-2"
              style={{ color: "#f57cff" }}
            >
              Amount to Withdraw (coins)
            </label>
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full py-3 px-4 pr-20 focus:outline-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              />
              <div 
                className="absolute right-3 top-3 text-sm"
                style={{ color: "#18ffc8" }}
              >
                coins
              </div>
            </div>
            <div className="mt-2 text-right">
              <p className="text-xs" style={{ color: "#376553" }}>
                ≈ {calculateEquivalent()}
              </p>
            </div>
          </div>

          {/* Bank/Mobile Money Selection */}
          <div className="mb-6">
            <label 
              className="block text-sm mb-2"
              style={{ color: "#f57cff" }}
            >
              Select Bank or Mobile Money
            </label>
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full py-3 px-4 pr-10 focus:outline-none appearance-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              >
                <option value="">Select your option</option>
                {bankOptions[user.countryCode]?.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Number/Mobile Number */}
          <div className="mb-6">
            <label 
              className="block text-sm mb-2"
              style={{ color: "#f57cff" }}
            >
              Account Number / Mobile Number
            </label>
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter number"
                className="w-full py-3 px-4 pr-10 focus:outline-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              />
            </div>
          </div>
          
          {/* Account Name */}
          <div className="mb-6">
            <label 
              className="block text-sm mb-2"
              style={{ color: "#f57cff" }}
            >
              Account Name
            </label>
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account name"
                className="w-full py-3 px-4 pr-10 focus:outline-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              />
            </div>
          </div>

          {/* New Warning Message */}
          <div 
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: "rgba(255, 178, 102, 0.1)", color: "#FFB266" }}
          >
            ⚠️ Please ensure the account name matches the name on your bank account to avoid withdrawal delays or failures.
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-4 p-3 rounded-lg text-center text-sm"
              style={{ backgroundColor: "rgba(245, 124, 255, 0.1)", color: "#f57cff" }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t"
          style={{ borderColor: "#376553" }}
        >
          <button
            onClick={handleWithdraw}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center ${
              isLoading ? 'opacity-70' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: "#fea92a", color: "#09100d" }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Withdrawal...
              </>
            ) : (
              'Confirm Withdrawal'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;