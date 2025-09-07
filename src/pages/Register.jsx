import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Api from "../components/Api";
import logoImage from "../assets/logo2.png";

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

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneCodeChange = (code) => {
    setFormData((prev) => ({ ...prev, phoneCode: code }));
    setSearchTerm(""); // Clear search term after selection
    setIsDropdownOpen(false); // Close dropdown
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
    } = formData;
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
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
    };

    try {
      const response = await axios.post(`${Api}/client/register`, data);

      if (response.status === 201) {
        toast.success("Account created successfully! Redirecting to login...", {
          duration: 3000,
        });
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8] pr-10"
                  required
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#18ffc8]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-400"
                >
                  Confirm Password
                </label>
                <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#162821] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18ffc8] pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
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

            <div className="pt-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1"
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
            </div>

            <div className="pt-4">
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
                    Creating Account...
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
