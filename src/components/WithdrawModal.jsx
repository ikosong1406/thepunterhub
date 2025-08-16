import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const WithdrawModal = ({ user, onClose, onWithdrawSuccess }) => {
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [accountVerified, setAccountVerified] = useState(false);

  // Sample bank data (in a real app, you'd fetch this from your API)
  const sampleBanks = [
    { code: '044', name: 'Access Bank' },
    { code: '063', name: 'Diamond Bank' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
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
  ];

  useEffect(() => {
    // Simulate bank data loading
    setBanks(sampleBanks);
  }, []);

  const calculateEquivalent = () => {
    if (!amount) return '0.00';
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '0.00';
    
    // Conversion rates (would come from your API in real app)
    const rate = user.countryCode === '+234' ? 5 : 0.1; // NGN or GHS
    const equivalent = numericAmount * rate;
    
    return equivalent.toFixed(2);
  };

  const verifyAccount = async () => {
    if (!bankCode || !accountNumber) {
      setError('Please select bank and enter account number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to verify account
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, you would call your verification endpoint:
      // const response = await axios.post(`${Api}/verify-account`, {
      //   bankCode,
      //   accountNumber
      // });
      
      // For demo, we'll use a mock account name
      setAccountName('John Doe'); // Would come from API response
      setAccountVerified(true);
    } catch (err) {
      setError('Account verification failed. Please check details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !bankCode || !accountNumber || !accountName) {
      setError('Please fill all fields');
      return;
    }
    
    if (!accountVerified) {
      setError('Please verify your account first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app:
      // const response = await axios.post(`${Api}/withdraw`, {
      //   token: await localforage.getItem("token"),
      //   amount,
      //   bankCode,
      //   accountNumber,
      //   accountName
      // });
      
      onWithdrawSuccess(parseFloat(amount));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed. Please try again.');
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
                ≈ {user.countryCode === '+234' ? '₦' : 'GH₵'}{calculateEquivalent()}
              </p>
            </div>
          </div>

          {/* Bank Selection */}
          <div className="mb-6">
            <label 
              className="block text-sm mb-2"
              style={{ color: "#f57cff" }}
            >
              Select Bank
            </label>
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <select
                value={bankCode}
                onChange={(e) => {
                  setBankCode(e.target.value);
                  setAccountVerified(false);
                }}
                className="w-full py-3 px-4 pr-10 focus:outline-none appearance-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              >
                <option value="">Select your bank</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <div 
                className="absolute right-3 top-3"
                style={{ color: "#18ffc8" }}
              >
                {/* <RiBankFill size={18} /> */}
              </div>
            </div>
          </div>

          {/* Account Number */}
          <div className="mb-6">
            <label 
              className="block text-sm mb-2"
              style={{ color: "#f57cff" }}
            >
              Account Number
            </label>
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setAccountVerified(false);
                }}
                placeholder="Enter account number"
                className="w-full py-3 px-4 pr-10 focus:outline-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              />
              <div 
                className="absolute right-3 top-3"
                style={{ color: "#18ffc8" }}
              >
                {/* <FaBank size={16} /> */}
              </div>
            </div>
          </div>

          {/* Account Verification */}
          {accountNumber && bankCode && (
            <div className="mb-4">
              <button
                onClick={verifyAccount}
                disabled={isLoading || accountVerified}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center ${
                  isLoading ? 'opacity-70' : 'hover:opacity-90'
                } ${accountVerified ? 'bg-green-500' : 'bg-blue'}`}
                style={{ color: "#09100d" }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : accountVerified ? (
                  'Account Verified'
                ) : (
                  'Verify Account'
                )}
              </button>
            </div>
          )}

          {/* Account Name (display only after verification) */}
          {accountVerified && (
            <div className="mb-6">
              <label 
                className="block text-sm mb-2"
                style={{ color: "#f57cff" }}
              >
                Account Name
              </label>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              >
                {accountName}
              </div>
              <div 
                className="mt-2 p-2 rounded-lg flex items-start"
                style={{ backgroundColor: "rgba(254, 169, 42, 0.1)" }}
              >
                {/* <FaExclamationTriangle 
                  className="mt-1 mr-2 flex-shrink-0" 
                  style={{ color: "#fea92a" }} 
                /> */}
                <p className="text-xs" style={{ color: "#fea92a" }}>
                  The account name must match your registered name ({user.firstname} {user.lastname}) 
                  or your withdrawal may fail. Please double-check before proceeding.
                </p>
              </div>
            </div>
          )}

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
            disabled={isLoading || !accountVerified}
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