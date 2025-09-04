import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import axios from "axios";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";
import Api from "../components/Api";
import "../styles/Splash.css";
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

const PHONE_CODES = [
  // Africa
  { value: "+234", label: "🇳🇬 +234" },
  { value: "+233", label: "🇬🇭 +233" },
  { value: "+27", label: "🇿🇦 +27" },
  { value: "+254", label: "🇰🇪 +254" },
  { value: "+20", label: "🇪🇬 +20" },
  // North America
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+1", label: "🇨🇦 +1" },
  { value: "+52", label: "🇲🇽 +52" },
  { value: "+501", label: "🇧🇿 +501" },
  { value: "+506", label: "🇨🇷 +506" },
  // South America
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+54", label: "🇦🇷 +54" },
  { value: "+57", label: "🇨🇴 +57" },
  { value: "+51", label: "🇵🇪 +51" },
  { value: "+56", label: "🇨🇱 +56" },
  // Europe
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+33", label: "🇫🇷 +33" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+39", label: "🇮🇹 +39" },
  { value: "+34", label: "🇪🇸 +34" },
  // Asia
  { value: "+86", label: "🇨🇳 +86" },
  { value: "+91", label: "🇮🇳 +91" },
  { value: "+81", label: "🇯🇵 +81" },
  { value: "+65", label: "🇸🇬 +65" },
  { value: "+971", label: "🇦🇪 +971" },
  // Australia/Oceania
  { value: "+61", label: "🇦🇺 +61" },
  { value: "+64", label: "🇳🇿 +64" },
  { value: "+679", label: "🇫🇯 +679" },
  { value: "+675", label: "🇵🇬 +675" },
  { value: "+685", label: "🇼🇸 +685" },
];

const LoginScreen = ({ platformName = "PH" }) => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    phoneCode: "+234",
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePhoneCodeChange = (code) => {
    setFormData((prev) => ({ ...prev, phoneCode: code }));
    setSearchTerm(""); // Clear search term after selection
    setIsDropdownOpen(false); // Close dropdown
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (loginType === "email" && !formData.email) {
      toast.error("Email is required.");
      return false;
    }
    if (loginType === "phone" && !formData.phoneNumber) {
      toast.error("Phone number is required.");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required.");
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

    let loginData = {};
    if (loginType === "email") {
      loginData = {
        email: formData.email,
        password: formData.password,
      };
    } else {
      loginData = {
        countryCode: formData.phoneCode,
        phonenumber: formData.phoneNumber,
        password: formData.password,
      };
    }

    try {
      const response = await axios.post(`${Api}/client/login`, loginData);

      if (response.status === 200) {
        const { token, role } = response.data;

        // Store token and role in localforage
        await localforage.setItem("token", token);
        await localforage.setItem("role", role);

        setTimeout(() => {
          if (role === "user") {
            navigate("/customer/home");
          } else if (role === "punter") {
            navigate("/punter/home");
          } else {
            // Fallback for unknown role
            navigate("/welcome");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response) {
        const errorMessage =
          error.response.data.error ||
          "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred. Please check your network.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPhoneCodes = PHONE_CODES.filter((code) =>
    code.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09100d] text-white flex">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left side - decorative for desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#09100d] to-[#162821] items-center justify-center p-12">
        <div className="max-w-md w-full">
          <div className="relative w-full h-96 flex items-center justify-center">
            {/* Outer Arc */}
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
            {/* Inner Arc */}
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
            {/* Center Circle */}
            <div className="relative flex items-center justify-center w-64 h-64 p-4 border-6 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
              <img
                src={logoImage}
                alt="Platform Logo"
                className="max-w-full max-h-full"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold mt-8 text-center">Welcome Back</h2>
          <p className="text-gray-400 mt-4 text-center">
            Login to access your account and continue your journey with us.
          </p>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 px-6 py-8 flex flex-col lg:justify-center">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaArrowLeft
                onClick={() => navigate(-1)}
                className="text-white text-lg cursor-pointer hover:text-[#18ffc8] transition"
              />
              <h1 className="text-xl font-semibold">Login</h1>
            </div>
            <button
              className="text-[#fea92a] font-medium hover:text-[#18ffc8] transition"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>

          {/* Logo for mobile only */}
          <div className="lg:hidden flex justify-center mb-10 mt-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
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
              <div className="relative flex items-center justify-center w-28 h-28 p-4 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
                <img
                  src={logoImage}
                  alt="Platform Logo"
                  className="max-w-full max-h-full"
                />
              </div>
            </div>
          </div>

          {/* Login Type Switch */}
          <div className="flex justify-center gap-6 mb-8 text-base mt-20">
            <button
              onClick={() => setLoginType("email")}
              className={`pb-1 transition ${
                loginType === "email"
                  ? "border-b-2 border-[#18ffc8] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginType("phone")}
              className={`pb-1 transition ${
                loginType === "phone"
                  ? "border-b-2 border-[#18ffc8] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Phone Number
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {loginType === "email" ? (
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-3 relative">
                  <div className="relative w-1/3">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8] text-left flex items-center justify-between"
                    >
                      <span>
                        {PHONE_CODES.find(
                          (code) => code.value === formData.phoneCode
                        )?.label || "Select Code"}
                      </span>
                      <svg
                        className={`h-5 w-5 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div
                        className="absolute z-10 w-full mt-1 rounded-md shadow-lg"
                        style={{ backgroundColor: Colors.gray }}
                      >
                        <div className="p-2 border-b border-gray-600">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-[#09100d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                            />
                          </div>
                        </div>
                        <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredPhoneCodes.map((code) => (
                            <li
                              key={code.value + code.label}
                              className="p-2 hover:bg-[#162821] cursor-pointer"
                              onClick={() => handlePhoneCodeChange(code.value)}
                            >
                              {code.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
            )}

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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
                required
              />
            </div>

            <div className="pt-2">
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
                    Logging In...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-gray-400 hover:text-[#18ffc8] text-sm transition"
                onClick={() => navigate("/forgot")}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
