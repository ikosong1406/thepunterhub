import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Api from "../components/Api";
import logoImage from "../assets/logo2.png";

// Define a Colors object to manage styling
const Colors = {
  gray: "#162821",
  orange: "#fea92a",
  white: "#ffffff",
  black: "#09100d",
  lightGray: "#333",
  purple: "#855391",
};

const PRIMARY_CATEGORIES = [
  { value: "sports", label: "Sports" },
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
];

const SECONDARY_CATEGORIES = {
  sports: [
    { value: "football", label: "Football" },
    { value: "basketball", label: "Basketball" },
    { value: "tennis", label: "Tennis" },
    { value: "baseball", label: "Baseball" },
  ],
  forex: [
    { value: "major-pairs", label: "Major Pairs" },
    { value: "minor-pairs", label: "Minor Pairs" },
    { value: "exotic-pairs", label: "Exotic Pairs" },
  ],
  crypto: [
    { value: "btc", label: "Bitcoin" },
    { value: "eth", label: "Ethereum" },
    { value: "sol", label: "Solana" },
    { value: "shib", label: "Shiba Inu" },
  ],
};

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneCode: "+234",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    promoCode: "",
    acceptTerms: false,
    username: "",
    primaryCategory: "",
    secondaryCategory: "",
    pricePerWeek: "",
  });
  const [usernameStatus, setUsernameStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "username") {
      setUsernameStatus(null);
    }
  };

  const checkUsernameAvailability = async () => {
    if (!formData.username.trim()) {
      toast.error("Please enter a username.");
      return;
    }
    setUsernameStatus("checking");

    const data =  {
       username: formData.username,
      }
    try {
     const response = await axios.post(`${Api}/client/checkUsername`,data);
      if (response.data.isAvailable) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("unavailable");
      }
    } catch (error) {
      setUsernameStatus("error");
      toast.error("Error checking username. Please try again.");
    }
  };

  const getUsernameStatusMessage = () => {
    switch (usernameStatus) {
      case "available":
        return <p className="text-green-500 text-xs">Username is available.</p>;
      case "unavailable":
        return (
          <p className="text-red-500 text-xs">Username is already taken.</p>
        );
      case "error":
        return (
          <p className="text-yellow-500 text-xs">
            Could not check username. Try again.
          </p>
        );
      default:
        return null;
    }
  };

  const validateForm = () => {
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      password,
      confirmPassword,
      acceptTerms,
      username,
      primaryCategory,
      secondaryCategory,
      pricePerWeek,
    } = formData;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword ||
      !username ||
      !primaryCategory ||
      !secondaryCategory ||
      !pricePerWeek
    ) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (!acceptTerms) {
      toast.error("You must accept the terms to continue.");
      return false;
    }
    if (usernameStatus !== "available") {
      toast.error("Please check and confirm username availability.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    const data = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      phoneCode: formData.phoneCode,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      promoCode: formData.promoCode,
      username: formData.username,
      primaryCategory: formData.primaryCategory,
      secondaryCategory: formData.secondaryCategory,
      pricePerWeek: parseFloat(formData.pricePerWeek),
    };

    try {
      const response = await axios.post(`${Api}/client/punterRegister`, data);

      if (response.status === 201) {
       toast.success("Account created successfully! Redirecting to login...", { duration: 3000 });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 409) {
          toast.error(
            data.message ||
              "An account with this email or phone number already exists."
          );
        } else if (status === 400) {
          toast.error(
            data.message || "Invalid data provided. Please check your form."
          );
        } else {
          toast.error(data.message || `Server error: ${status}`);
        }
      } else if (error.request) {
        toast.error(
          "No response from the server. Please check your internet connection."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const subcategories = PRIMARY_CATEGORIES.some(
    (cat) => cat.value === formData.primaryCategory
  )
    ? SECONDARY_CATEGORIES[formData.primaryCategory] || []
    : [];

  return (
    <div className="min-h-screen bg-[#09100d] text-white flex">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left side - decorative for desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#09100d] to-[#162821] items-center justify-center p-12">
        <div className="max-w-md w-full">
          <div className="relative w-full h-96 flex items-center justify-center">
            <svg
              className="absolute w-full h-full spin-slow"
              viewBox="0 0 100 100"
            >
              <path
                d="M50,0 A50,50 0 1,1 0,50"
                fill="none"
                stroke="#fea92a"
                strokeWidth="6"
                strokeLinecap="round"
                className="glow-stroke"
              />
            </svg>
            <svg
              className="absolute w-3/4 h-3/4 spin-medium"
              viewBox="0 0 100 100"
            >
              <path
                d="M50,0 A50,50 0 1,1 0,50"
                fill="none"
                stroke="#855391"
                strokeWidth="6"
                strokeLinecap="round"
                className="glow-stroke"
              />
            </svg>
            <div className="relative flex items-center justify-center w-64 h-64 p-4 border-6 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
              <img
                src={logoImage}
                alt="Platform Logo"
                className="max-w-full max-h-full"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-8 text-center">
            Create Your Account
          </h2>
          <p className="text-gray-400 mt-4 text-center">
            Join our platform and start your journey with us today.
          </p>
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#fea92a] hover:text-[#18ffc8] transition"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - signup form */}
      <div className="w-full lg:w-1/2 px-6 py-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaArrowLeft
                onClick={() => navigate(-1)}
                className="text-white text-lg cursor-pointer hover:text-[#18ffc8] transition"
              />
              <h1 className="text-xl font-semibold">Sign Up</h1>
            </div>
            <button
              className="text-[#fea92a] font-medium hover:text-[#18ffc8] transition lg:hidden"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

          {/* Combined Form with uniform UI */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Details Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    placeholder="Enter your first name"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    placeholder="Enter your last name"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="w-1/3 p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                  >
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+233">US +1</option>
                    <option value="+233">Uk +44</option>
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-2/3 p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="promoCode"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Promo Code (optional)
                </label>
                <input
                  type="text"
                  id="promoCode"
                  name="promoCode"
                  placeholder="Enter promo code if any"
                  value={formData.promoCode}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                />
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Choose Your Username
                </label>
                <div className="flex rounded-md overflow-hidden">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="flex-1 min-w-0 p-4 bg-[#162821] focus:outline-none focus:ring-2 focus:ring-[#18ffc8] rounded-l-md"
                    disabled={loading}
                    placeholder="e.g. expert_trader22"
                    required
                  />
                  <button
                    type="button"
                    onClick={checkUsernameAvailability}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium focus:outline-none bg-[#855391] hover:bg-[#6e447b] text-white transition-colors duration-200 rounded-r-md"
                    disabled={loading || usernameStatus === "checking"}
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
              <div>
                <label
                  htmlFor="primaryCategory"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Primary Category
                </label>
                <select
                  id="primaryCategory"
                  name="primaryCategory"
                  value={formData.primaryCategory}
                  onChange={handleChange}
                  className="block w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                  disabled={loading}
                  required
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
              {formData.primaryCategory && (
                <div>
                  <label
                    htmlFor="secondaryCategory"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    {formData.primaryCategory === "sports" ? "Sport" : "Market"}{" "}
                    Focus
                  </label>
                  <select
                    id="secondaryCategory"
                    name="secondaryCategory"
                    value={formData.secondaryCategory}
                    onChange={handleChange}
                    className="block w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                    disabled={loading || !formData.primaryCategory}
                    required
                  >
                    <option value="">
                      Select your{" "}
                      {formData.primaryCategory === "sports"
                        ? "sport"
                        : "market"}
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
              <div>
                <label
                  htmlFor="pricePerWeek"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Price per Week (in Coin)
                </label>
                <input
                  type="number"
                  id="pricePerWeek"
                  name="pricePerWeek"
                  value={formData.pricePerWeek}
                  onChange={handleChange}
                  className="block w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                  disabled={loading}
                  placeholder="e.g. 100"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Terms and Submit Button */}
            <div className="pt-4 space-y-4">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span>
                  I confirm I am over 21 years old and accept the{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/terms")}
                    className="text-[#855391] hover:text-[#fea92a] underline transition"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>

              <button
                type="submit"
                className={`w-full py-4 font-semibold rounded-xl transition ${
                  loading
                    ? "bg-[#98ffec] text-black cursor-not-allowed"
                    : "bg-[#18ffc8] text-black hover:bg-[#0fe5b5]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
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
                    Signing Up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>

            <div className="text-center mt-4 lg:hidden">
              <p className="text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#fea92a] hover:text-[#18ffc8] transition"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
