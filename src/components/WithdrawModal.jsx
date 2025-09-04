import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Api from "../components/Api";

// Define the bank options for each country
const bankOptions = {
  // Africa
  "+234": [
    // Nigeria 🇳🇬
    { code: "044", name: "Access Bank" },
    { code: "063", name: "Ecobank Nigeria" },
    { code: "070", name: "Fidelity Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank" },
    { code: "058", name: "Guaranty Trust Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "033", name: "United Bank for Africa (UBA)" },
    { code: "057", name: "Zenith Bank" },
    { code: "MTN", name: "MTN MoMo (Mobile Money)" },
    { code: "AIRTEL", name: "Airtel Money (Mobile Money)" },
    { code: "OPAY", name: "OPay" },
  ],
  "+233": [
    // Ghana 🇬🇭
    { code: "101", name: "Absa Bank" },
    { code: "102", name: "Ecobank Ghana" },
    { code: "103", name: "Fidelity Bank Ghana" },
    { code: "105", name: "Ghana Commercial Bank (GCB)" },
    { code: "106", name: "Stanbic Bank Ghana" },
    { code: "107", name: "United Bank for Africa (UBA) Ghana" },
    { code: "MTN", name: "MTN MoMo (Mobile Money)" },
    { code: "VODAFONE", name: "Vodafone Cash (Mobile Money)" },
    { code: "AIRTELTIGO", name: "AirtelTigo Money (Mobile Money)" },
  ],
  "+27": [
    // South Africa 🇿🇦
    { code: "S_BANK", name: "Standard Bank Group" },
    { code: "F_RAND", name: "FirstRand Bank" },
    { code: "ABSA", name: "Absa Bank" },
    { code: "CAPITEC", name: "Capitec Bank" },
    { code: "NEDBANK", name: "Nedbank" },
    { code: "MTN", name: "MTN MoMo (Mobile Money)" },
    { code: "VODACOM", name: "Vodacom (VodaPay)" },
  ],
  "+254": [
    // Kenya 🇰🇪
    { code: "EQUITY", name: "Equity Bank" },
    { code: "KCB", name: "KCB Bank Kenya" },
    { code: "COOP", name: "Co-operative Bank of Kenya" },
    { code: "MPESA", name: "M-Pesa (Mobile Money)" },
    { code: "AIRTEL", name: "Airtel Money (Mobile Money)" },
  ],

  // North America
  "+1": [
    // United States 🇺🇸 & Canada 🇨🇦
    { code: "CHASE", name: "JPMorgan Chase (Chase Bank)" },
    { code: "BOA", name: "Bank of America" },
    { code: "WELLS_FARGO", name: "Wells Fargo" },
    { code: "CITI", name: "Citibank" },
    { code: "USBANK", name: "U.S. Bank" },
    { code: "RBC", name: "Royal Bank of Canada" },
    { code: "TD", name: "TD Bank Group" },
    { code: "VENMO", name: "Venmo" },
    { code: "CASHAPP", name: "Cash App" },
    { code: "PAYPAL", name: "PayPal" },
  ],
  "+52": [
    // Mexico 🇲🇽
    { code: "BANORTE", name: "Banorte" },
    { code: "BBVA", name: "BBVA México" },
    { code: "SANTANDER", name: "Santander México" },
    { code: "BANAMEX", name: "Citibanamex" },
    { code: "HSBC", name: "HSBC México" },
  ],

  // South America
  "+55": [
    // Brazil 🇧🇷
    { code: "ITAÚ", name: "Itaú Unibanco" },
    { code: "BDOB", name: "Banco do Brasil" },
    { code: "BRADESCO", name: "Banco Bradesco" },
    { code: "BTG", name: "BTG Pactual" },
    { code: "CAIXA", name: "Caixa Econômica Federal" },
  ],
  "+54": [
    // Argentina 🇦🇷
    { code: "GALICIA", name: "Grupo Financiero Galicia" },
    { code: "NACION", name: "Banco de la Nación Argentina" },
    { code: "PROVINCIA", name: "Banco Provincia" },
    { code: "SANTANDER", name: "Banco Santander Río" },
  ],
  "+57": [
    // Colombia 🇨🇴
    { code: "BANCOLOMBIA", name: "Bancolombia" },
    { code: "DAVIVIENDA", name: "Davivienda" },
    { code: "BBVA", name: "BBVA Colombia" },
    { code: "CORPBANCA", name: "CorpBanca" },
    { code: "AVAL", name: "Grupo Aval" },
  ],

  // Europe
  "+44": [
    // United Kingdom 🇬🇧
    { code: "BARCLAYS", name: "Barclays" },
    { code: "LLOYDS", name: "Lloyds Bank" },
    { code: "NATWEST", name: "NatWest" },
    { code: "SANTANDER", name: "Santander UK" },
    { code: "HSBC", name: "HSBC" },
    { code: "REVOLUT", name: "Revolut" },
    { code: "MONZO", name: "Monzo" },
  ],
  "+33": [
    // France 🇫🇷
    { code: "BNP", name: "BNP Paribas" },
    { code: "CA", name: "Crédit Agricole" },
    { code: "SG", name: "Société Générale" },
    { code: "BPCE", name: "Groupe BPCE" },
    { code: "CREDIT_MUTUEL", name: "Crédit Mutuel" },
  ],
  "+49": [
    // Germany 🇩🇪
    { code: "DB", name: "Deutsche Bank" },
    { code: "COM", name: "Commerzbank" },
    { code: "N26", name: "N26 (Digital Bank)" },
  ],

  // Asia
  "+91": [
    // India 🇮🇳
    { code: "SBI", name: "State Bank of India" },
    { code: "HDFC", name: "HDFC Bank" },
    { code: "ICICI", name: "ICICI Bank" },
    { code: "PAYTM", name: "Paytm Payments Bank" },
    { code: "PHONEPE", name: "PhonePe" },
    { code: "GPAY", name: "Google Pay" },
  ],
  "+86": [
    // China 🇨🇳
    { code: "ICBC", name: "Industrial and Commercial Bank of China (ICBC)" },
    { code: "ABC", name: "Agricultural Bank of China" },
    { code: "CCB", name: "China Construction Bank" },
    { code: "BOC", name: "Bank of China" },
    { code: "ALIPAY", name: "Alipay" },
    { code: "WECHAT", name: "WeChat Pay" },
  ],
  "+81": [
    // Japan 🇯🇵
    { code: "MUFG", name: "Mitsubishi UFJ Financial Group (MUFG)" },
    { code: "SMBC", name: "Sumitomo Mitsui Banking Corporation" },
    { code: "MIZUHO", name: "Mizuho Financial Group" },
    { code: "JAPANPOST", name: "Japan Post Bank" },
  ],

  // Australia & Oceania
  "+61": [
    // Australia 🇦🇺
    { code: "CBA", name: "Commonwealth Bank of Australia (CBA)" },
    { code: "NAB", name: "National Australia Bank (NAB)" },
    { code: "WESTPAC", name: "Westpac" },
    { code: "ANZ", name: "Australia and New Zealand Banking Group (ANZ)" },
    { code: "MACQUARIE", name: "Macquarie Bank" },
  ],
  "+64": [
    // New Zealand 🇳🇿
    { code: "ANZ", name: "ANZ New Zealand" },
    { code: "ASB", name: "ASB Bank" },
    { code: "BNZ", name: "Bank of New Zealand (BNZ)" },
    { code: "KIWIBANK", name: "Kiwibank" },
  ],
};

const currencyCodeMapping = {
  // Africa
  "+234": "NGN", // Nigeria
  "+233": "GHS", // Ghana
  "+27": "ZAR", // South Africa
  "+254": "KES", // Kenya

  // North America
  "+1": "USD", // United States & Canada (assuming USD for simplicity)
  "+52": "MXN", // Mexico

  // South America
  "+55": "BRL", // Brazil
  "+54": "ARS", // Argentina
  "+57": "COP", // Colombia

  // Europe
  "+44": "GBP", // United Kingdom
  "+33": "EUR", // France
  "+49": "EUR", // Germany

  // Asia
  "+91": "INR", // India
  "+86": "CNY", // China
  "+81": "JPY", // Japan

  // Australia & Oceania
  "+61": "AUD", // Australia
  "+64": "NZD", // New Zealand
};

const currencySymbolMapping = {
  "NGN": "₦",
  "GHS": "GH₵",
  "ZAR": "R",
  "KES": "KSh",
  "USD": "$",
  "MXN": "Mex$",
  "BRL": "R$",
  "ARS": "ARS$",
  "COP": "Col$",
  "GBP": "£",
  "EUR": "€",
  "INR": "₹",
  "CNY": "¥",
  "JPY": "¥",
  "AUD": "A$",
  "NZD": "NZ$",
};

const WithdrawModal = ({ user, onClose, onWithdrawSuccess }) => {
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversionRates, setConversionRates] = useState(null);
  const [isFetchingRates, setIsFetchingRates] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(
          "https://v6.exchangerate-api.com/v6/5a103662f87d0a5ac0043c95/latest/USD"
        );
        setConversionRates(response.data.conversion_rates);
      } catch (err) {
        console.error("Failed to fetch conversion rates:", err);
        setError("Could not fetch conversion rates.");
      } finally {
        setIsFetchingRates(false);
      }
    };

    fetchRates();
  }, []);

  const calculateEquivalent = () => {
    if (!amount || !conversionRates || isNaN(parseFloat(amount))) {
      return "0.00";
    }

    const numericAmount = parseFloat(amount);
    const targetCurrencyCode = currencyCodeMapping[user.countryCode] || "USD";
    const rate = conversionRates[targetCurrencyCode];
    const currencySymbol = currencySymbolMapping[targetCurrencyCode];

    if (!rate) {
      return "N/A";
    }

    // You need to define a base rate for "coins" to USD.
    // Let's assume 1 coin = $0.007 as a placeholder from your old logic.
    const coinToUsdRate = 1;

    const usdAmount = numericAmount * coinToUsdRate;
    const equivalent = usdAmount * rate;

    return `${currencySymbol}${equivalent.toFixed(2)}`;
  };

  const handleWithdraw = async () => {
    if (!amount || !bankCode || !accountNumber || !accountName) {
      setError("Please fill all fields.");
      return;
    }

    if (parseFloat(amount) > user.balance) {
      setError("Insufficient balance.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const selectedBank = bankOptions[user.countryCode]?.find(
      (option) => option.code === bankCode
    );
    const bankName = selectedBank ? selectedBank.name : "";

    const userName = `${user.firstname} ${user.lastname}`;

    const data = {
      userId: user._id,
      amount: parseFloat(amount),
      userName,
      bankCode,
      bankName,
      accountNumber,
      accountName,
    };

    try {
      const response = await axios.post(`${Api}/client/withdrawal`, data);

      setIsSuccess(true);
      onWithdrawSuccess(response.data.newBalance);

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Withdrawal failed. Please try again."
      );
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
          {/* Amount Input */}
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
              {isFetchingRates ? (
                <p className="text-xs" style={{ color: "#376553" }}>
                  Fetching rates...
                </p>
              ) : (
                <p className="text-xs" style={{ color: "#376553" }}>
                  ≈ {calculateEquivalent()}
                </p>
              )}
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
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full py-3 px-4 pr-10 focus:outline-none appearance-none"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              >
                <option value="">Select your option</option>
                {bankOptions[user.countryCode]?.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Number/Mobile Number */}
          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
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
            <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
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

          {/* Warning and Notification Messages */}
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
                ⚠️ Please ensure the account name matches the name on your bank
                account to avoid withdrawal delays or failures.
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

        {/* Footer */}
        <div className="px-6 py-4 border-t" style={{ borderColor: "#376553" }}>
          <button
            onClick={handleWithdraw}
            disabled={isLoading || isSuccess}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center ${
              isLoading || isSuccess ? "opacity-70" : "hover:opacity-90"
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
                Processing Withdrawal...
              </>
            ) : isSuccess ? (
              "Success!"
            ) : (
              "Confirm Withdrawal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;