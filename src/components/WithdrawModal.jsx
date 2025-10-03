import { useState, useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Api from "../components/Api";
import { banks } from "./banks.json";

// --- NIGERIAN BANK LIST (Comprehensive list based on NIBSS/Paystack codes) ---
const NIGERIAN_BANKS = banks;

// --- CONSTANTS ---
const COIN_TO_NAIRA_RATE = 100;
const CURRENCY_CODE = "NGN";
const CURRENCY_SYMBOL = "₦";

const WithdrawModal = ({ user, onClose, onWithdrawSuccess }) => {
  const isNigerianUser = user.countryCode === "+234";

  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState(""); // Stores the name from Paystack
  const [isLoading, setIsLoading] = useState(false); // For withdrawal
  const [isVerifying, setIsVerifying] = useState(false); // For account resolution
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Disable the component if the user is not Nigerian
  useEffect(() => {
    if (!isNigerianUser) {
      toast.error("Withdrawal is currently limited to the Nigerian market.");
      onClose();
    }
  }, [isNigerianUser, onClose]);

  // --- Coin to Naira Conversion Logic ---
  const calculateEquivalent = useCallback(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const numericAmount = parseFloat(amount);
    const equivalent = numericAmount * COIN_TO_NAIRA_RATE;
    return `${CURRENCY_SYMBOL}${equivalent.toFixed(2)}`;
  }, [amount]);

  // --- Paystack Account Verification (via Secure Backend Endpoint) ---
  const verifyAccountName = async () => {
    setError(null);
    setResolvedAccountName(""); // Clear before verification attempt

    if (!bankCode || !accountNumber || accountNumber.length !== 10) {
      toast.error(
        "Please select a bank and enter a valid 10-digit account number."
      );
      return;
    }

    setIsVerifying(true);

    try {
      // **CALL YOUR BACKEND ENDPOINT HERE**
      const response = await axios.post(`${Api}/client/resolve`, {
        bankCode,
        accountNumber,
      });

      const resolvedName = response.data?.data?.account_name;

      if (resolvedName) {
        setResolvedAccountName(resolvedName);
      } else {
        throw new Error(
          "Could not resolve account name. Check details or try another bank."
        );
      }
    } catch (err) {
      console.error("Account verification failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Verification failed. Check account number and bank.";
      setError(errorMessage);
      toast.error(errorMessage);
      setResolvedAccountName(""); // Ensure it's cleared on failure
    } finally {
      setIsVerifying(false);
    }
  };

  // --- Handle Withdrawal ---
  const handleWithdraw = async () => {
    // 1. Validation (omitted for brevity, as this section was correct)
    if (!user.isVerified) {
      toast.error("Please verify your account to be able to withdraw.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || !bankCode || !accountNumber || !resolvedAccountName) {
      toast.error(
        "Please enter an amount, fill all fields, and verify the account number."
      );
      setError("Please verify the account number.");
      return;
    }

    if (numericAmount < 10) {
      toast.error("Minimum withdrawal amount is 10 coins.");
      return;
    }

    if (numericAmount > user.balance) {
      toast.error("Insufficient balance.");
      setError("Insufficient balance.");
      return;
    }
    // ... (rest of validation) ...

    // 2. Withdrawal Request
    setIsLoading(true);
    setError(null);

    const selectedBank = NIGERIAN_BANKS.find(
      (option) => option.code === bankCode
    );

    // Prepare data for the backend
    const data = {
      userId: user._id,
      amount: numericAmount, // Sending the coin amount
      bankCode,
      bankName: selectedBank ? selectedBank.name : "Unknown Bank",
      accountNumber,
      accountName: resolvedAccountName, // Use the verified name
      currency: CURRENCY_CODE,
      conversionRate: COIN_TO_NAIRA_RATE,
    };

    try {
      // Assuming your backend handles the coin-to-Naira conversion and Paystack Transfer
      const response = await axios.post(`${Api}/client/withdrawal`, data);

      setIsSuccess(true);
      onWithdrawSuccess(response.data.newBalance);
      toast.success("Withdrawal successful! The modal will close shortly.");

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Withdrawal failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const showVerificationButton =
    bankCode && accountNumber.length === 10 && !resolvedAccountName;
  const isAccountDetailsValid = bankCode && accountNumber.length === 10;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <Toaster />
      <div className="min-h-screen flex flex-col">
        {/* Header (omitted for brevity) */}
        {/* ... */}
        <div
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "#efefef" }}>
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
          {/* Amount Input (omitted for brevity) */}
          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
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
                ≈ {calculateEquivalent()} {CURRENCY_CODE}
              </p>
            </div>
          </div>

          {/* Bank/Mobile Money Selection */}
          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
              Select Bank or Mobile Money
            </label>
            <div
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <select
                value={bankCode}
                // <--- FIX APPLIED HERE --->
                onChange={(e) => {
                  setBankCode(e.target.value);
                  setResolvedAccountName(""); // Clear resolved name on bank change
                }}
                // <--- END FIX --->
                className="w-full py-3 px-4 pr-10 focus:outline-none appearance-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              >
                <option value="">Select Bank</option>
                {NIGERIAN_BANKS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Number */}
          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
              Account Number
            </label>
            <div
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="tel" // Use tel for better mobile input experience for numbers
                value={accountNumber}
                // <--- FIX APPLIED HERE --->
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  if (resolvedAccountName) {
                    setResolvedAccountName(""); // Clear resolved name on account number change
                  }
                }}
                // <--- END FIX --->
                placeholder="Enter 10-digit NUBAN account number"
                maxLength={10}
                className="w-full py-3 px-4 pr-10 focus:outline-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              />
            </div>
          </div>

          {/* Account Verification Button/Status (Code here is fine) */}
          <div className="mb-6">
            {showVerificationButton ? (
              <button
                onClick={verifyAccountName}
                disabled={isVerifying}
                className={`w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center ${
                  isVerifying
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:opacity-90"
                }`}
                style={{ backgroundColor: "#18ffc8", color: "#09100d" }}
              >
                {isVerifying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                    Verifying...
                  </>
                ) : (
                  "Verify Account Name"
                )}
              </button>
            ) : (
              <div
                className="p-3 rounded-lg text-xs"
                style={{
                  backgroundColor: "rgba(255, 178, 102, 0.1)",
                  color: "#FFB266",
                }}
              >
                Enter Bank and a 10-digit Account Number, then click **Verify**
                to confirm the account name.
              </div>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
              Account Name
            </label>
            <div
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="text"
                value={
                  resolvedAccountName ||
                  (isAccountDetailsValid && isVerifying ? "Verifying..." : "")
                }
                readOnly
                placeholder="Verified name will appear here"
                className="w-full py-3 px-4 pr-10 focus:outline-none opacity-80 cursor-default"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              />
            </div>
          </div>

          {/* Warning and Notification Messages (omitted for brevity) */}
          {isSuccess ? (
            <div
              className="mb-4 p-3 rounded-lg text-center text-sm"
              style={{
                backgroundColor: "rgba(24, 255, 200, 0.1)",
                color: "#18ffc8",
              }}
            >
              ✅ Withdrawal successful! The modal will close shortly.
            </div>
          ) : (
            <>
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "rgba(255, 178, 102, 0.1)",
                  color: "#FFB266",
                }}
              >
                ⚠️ Withdrawal is only possible to a **verified Nigerian bank
                account or mobile money wallet** matching your details. Ensure
                you verify the account number.
              </div>
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
            </>
          )}
        </div>

        {/* Footer (omitted for brevity) */}
        {/* ... */}
        <div className="px-6 py-4 border-t" style={{ borderColor: "#376553" }}>
          <button
            onClick={handleWithdraw}
            disabled={
              isLoading ||
              isSuccess ||
              !resolvedAccountName ||
              parseFloat(amount) <= 0
            }
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center ${
              isLoading ||
              isSuccess ||
              !resolvedAccountName ||
              parseFloat(amount) <= 0
                ? "opacity-70"
                : "hover:opacity-90"
            }`}
            style={{ backgroundColor: "#fea92a", color: "#09100d" }}
          >
            {isLoading ? (
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
                Processing Transfer...
              </>
            ) : isSuccess ? (
              "Success!"
            ) : (
              `Withdraw ${calculateEquivalent()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
