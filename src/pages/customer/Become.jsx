import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";

// Your Color Palette
const Colors = {
  black: "#09100d",
  gray: "#162821",
  orange: "#fea92a",
  purple: "#855391",
  lightGray: "#376553",
  white: "#efefef",
  pink: "#f57cff",
  blue: "#18ffc8",
};

// Category options
const PRIMARY_CATEGORIES = [
  { value: "sports", label: "Sports" },
  { value: "trading", label: "Trading" },
];

const SPORTS_SUBCATEGORIES = [
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "tennis", label: "Tennis" },
  { value: "cricket", label: "Cricket" },
  { value: "baseball", label: "Baseball" },
];

const TRADING_SUBCATEGORIES = [
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "stocks", label: "Stocks" },
  { value: "commodities", label: "Commodities" },
  { value: "indices", label: "Indices" },
];

const BecomePunter = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [pricePerWeek, setPricePerWeek] = useState(""); // New state for price

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.post(`${Api}/client/getUser`, { token });
        setUser(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update subcategories when primary category changes
  useEffect(() => {
    if (primaryCategory === "sports") {
      setSubcategories(SPORTS_SUBCATEGORIES);
    } else if (primaryCategory === "trading") {
      setSubcategories(TRADING_SUBCATEGORIES);
    } else {
      setSubcategories([]);
    }
    setSecondaryCategory(""); // Reset secondary category when primary changes
  }, [primaryCategory]);

  const checkUsernameAvailability = async () => {
    if (!username.trim()) {
      setUsernameStatus(null);
      setError("Username cannot be empty.");
      return;
    }
    setUsernameStatus("checking");
    setError(null);
    try {
      const response = await axios.post(`${Api}/client/checkUsername`, {
        username,
      });
      if (response.data.isAvailable) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("unavailable");
      }
    } catch (err) {
      console.error("Error checking username availability:", err);
      setError("Failed to check username. Please try again.");
      setUsernameStatus(null);
    }
  };

  const handleBecomePunter = async () => {
    if (!username.trim()) {
      setError("Please choose a username.");
      return;
    }
    if (usernameStatus !== "available") {
      setError("Please check and choose an available username.");
      return;
    }
    if (!primaryCategory) {
      setError("Please select your primary category.");
      return;
    }
    if (!secondaryCategory) {
      setError("Please select your secondary category.");
      return;
    }
    if (!pricePerWeek || isNaN(pricePerWeek) || parseFloat(pricePerWeek) <= 0) {
      setError("Please enter a valid price per week.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = {
        userId: user._id,
        username,
        primaryCategory,
        secondaryCategory,
        price: parseFloat(pricePerWeek), // Add the price
      };

      const response = await axios.post(`${Api}/client/becomePunter`, data);

      // Update toast to success and redirect after delay
      toast.success(
        "Registration successful! Redirecting, please login again with your details",
        {
          duration: 3000,
        }
      );

      setTimeout(() => {
        navigate("/punter/home");
      }, 3000);
    } catch (err) {
      toast.dismiss();
      console.error("Failed to become a punter:", err);
      setError("Failed to register as a punter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsernameStatusMessage = () => {
    if (usernameStatus === "checking") {
      return (
        <span className="text-sm" style={{ color: Colors.blue }}>
          Checking availability...
        </span>
      );
    }
    if (usernameStatus === "available") {
      return (
        <span className="text-sm" style={{ color: Colors.blue }}>
          Username available
        </span>
      );
    }
    if (usernameStatus === "unavailable") {
      return (
        <span className="text-sm" style={{ color: Colors.pink }}>
          Username taken
        </span>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: Colors.black,
        color: Colors.white,
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <Toaster position="top-center" />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Information */}
          <div
            className="lg:w-1/2 p-8 rounded-lg"
            style={{ backgroundColor: Colors.gray }}
          >
            <div className="mb-8">
              <h1
                className="text-3xl font-bold mb-4"
                style={{ color: Colors.orange }}
              >
                Become a Verified Punter
              </h1>
              <p className="text-lg mb-6" style={{ color: Colors.white }}>
                Share your expertise, build your reputation, and earn from your
                predictions.
              </p>

              <div
                className="border-t border-b py-6 my-6"
                style={{ borderColor: Colors.lightGray }}
              >
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: Colors.orange }}
                >
                  Punter Benefits
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-4">
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: Colors.orange,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: Colors.black, fontSize: "12px" }}>
                          ✓
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3
                        className="font-medium"
                        style={{ color: Colors.white }}
                      >
                        Competitive Commission
                      </h3>
                      <p className="text-sm" style={{ color: Colors.white }}>
                        Keep 95% of your earnings with only a 5% platform fee.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-4">
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: Colors.orange,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: Colors.black, fontSize: "12px" }}>
                          ✓
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3
                        className="font-medium"
                        style={{ color: Colors.white }}
                      >
                        Performance Analytics
                      </h3>
                      <p className="text-sm" style={{ color: Colors.white }}>
                        Detailed stats to track your success and build
                        credibility.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1 mr-4">
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: Colors.orange,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: Colors.black, fontSize: "12px" }}>
                          ✓
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3
                        className="font-medium"
                        style={{ color: Colors.white }}
                      >
                        Growing Audience
                      </h3>
                      <p className="text-sm" style={{ color: Colors.white }}>
                        Access to thousands of users looking for expert
                        insights.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: Colors.lightGray }}
              >
                <h3
                  className="font-medium mb-2"
                  style={{ color: Colors.orange }}
                >
                  Requirements
                </h3>
                <ul
                  className="list-disc pl-5 text-sm"
                  style={{ color: Colors.white }}
                >
                  <li className="mb-1">You must have a proven track record</li>
                  <li className="mb-1">
                    Provide accurate and timely predictions
                  </li>
                  <li className="mb-1">Maintain professional conduct</li>
                  <li>Comply with our terms of service</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:w-1/2">
            <div
              className="p-8 rounded-lg"
              style={{ backgroundColor: Colors.gray }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: Colors.orange }}
              >
                Complete Your Profile
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-2"
                  style={{ color: Colors.white }}
                >
                  Choose Your Username
                </label>
                <div className="flex rounded-md">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameStatus(null);
                    }}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:outline-none sm:text-sm"
                    style={{
                      backgroundColor: Colors.black,
                      border: `1px solid ${Colors.lightGray}`,
                      color: Colors.white,
                      transition: "all 0.2s ease",
                    }}
                    disabled={isSubmitting}
                    placeholder="e.g. expert_trader22"
                  />
                  <button
                    onClick={checkUsernameAvailability}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md focus:outline-none"
                    style={{
                      backgroundColor: Colors.purple,
                      color: Colors.white,
                      opacity:
                        isSubmitting || usernameStatus === "checking" ? 0.7 : 1,
                    }}
                    disabled={isSubmitting || usernameStatus === "checking"}
                  >
                    {usernameStatus === "checking" ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Checking
                      </>
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
                <div className="mt-2 h-5 flex items-center">
                  {getUsernameStatusMessage()}
                </div>
              </div>

              {/* Primary Category Dropdown */}
              <div className="mb-6">
                <label
                  htmlFor="primary-category"
                  className="block text-sm font-medium mb-2"
                  style={{ color: Colors.white }}
                >
                  Primary Category
                </label>
                <select
                  id="primary-category"
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="block w-full px-3 py-2 rounded-md focus:outline-none sm:text-sm"
                  style={{
                    backgroundColor: Colors.black,
                    border: `1px solid ${Colors.lightGray}`,
                    color: Colors.white,
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">Select your primary category</option>
                  {PRIMARY_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Category Dropdown */}
              {primaryCategory && (
                <div className="mb-6">
                  <label
                    htmlFor="secondary-category"
                    className="block text-sm font-medium mb-2"
                    style={{ color: Colors.white }}
                  >
                    {primaryCategory === "sports" ? "Sport" : "Market"} Focus
                  </label>
                  <select
                    id="secondary-category"
                    value={secondaryCategory}
                    onChange={(e) => setSecondaryCategory(e.target.value)}
                    className="block w-full px-3 py-2 rounded-md focus:outline-none sm:text-sm"
                    style={{
                      backgroundColor: Colors.black,
                      border: `1px solid ${Colors.lightGray}`,
                      color: Colors.white,
                    }}
                    disabled={isSubmitting || !primaryCategory}
                  >
                    <option value="">
                      Select your {primaryCategory === "sports" ? "sport" : "market"}
                    </option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price per Week Input */}
              <div className="mb-6">
                <label
                  htmlFor="price-per-week"
                  className="block text-sm font-medium mb-2"
                  style={{ color: Colors.white }}
                >
                  Price per Week (in Coin)
                </label>
                <input
                  type="number"
                  id="price-per-week"
                  value={pricePerWeek}
                  onChange={(e) => setPricePerWeek(e.target.value)}
                  className="block w-full px-3 py-2 rounded-md focus:outline-none sm:text-sm"
                  style={{
                    backgroundColor: Colors.black,
                    border: `1px solid ${Colors.lightGray}`,
                    color: Colors.white,
                  }}
                  disabled={isSubmitting}
                  placeholder="e.g. 100"
                  min="0"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-4 w-4 rounded focus:ring-0"
                      style={{
                        backgroundColor: Colors.black,
                        borderColor: Colors.lightGray,
                        color: Colors.orange,
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-medium"
                      style={{ color: Colors.white }}
                    >
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="underline"
                        style={{ color: Colors.orange }}
                      >
                        Terms & Conditions
                      </a>
                    </label>
                    <p className="text-xs" style={{ color: Colors.white }}>
                      By registering as a punter, you agree to our terms and
                      confirm you will provide accurate information.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  className="mb-6 p-3 rounded-md text-sm font-medium flex items-start"
                  style={{
                    backgroundColor: `${Colors.pink}20`,
                    color: Colors.pink,
                  }}
                >
                  <svg
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleBecomePunter}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none transition-colors duration-150"
                style={{
                  backgroundColor: Colors.blue,
                  color: Colors.black,
                  opacity:
                    !agreedToTerms ||
                    usernameStatus !== "available" ||
                    !primaryCategory ||
                    !secondaryCategory ||
                    !pricePerWeek || // Add price validation
                    isSubmitting
                      ? 0.5
                      : 1,
                }}
                disabled={
                  !agreedToTerms ||
                  usernameStatus !== "available" ||
                  !primaryCategory ||
                  !secondaryCategory ||
                  !pricePerWeek || // Add price validation
                  isSubmitting
                }
              >
                {isSubmitting ? (
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
                  "Complete Registration"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomePunter;