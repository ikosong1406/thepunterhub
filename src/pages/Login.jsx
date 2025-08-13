import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";
import Api from "../components/Api";
import "../styles/Splash.css";

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

        toast.success("Login successful! Redirecting...", { duration: 2000 });

        setTimeout(() => {
          if (role === "user") {
            navigate("/customer/home");
          } else if (role === "punter") {
            navigate("/punter/home");
          } else {
            // Fallback for unknown role
            navigate("/welcome");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response) {
        const errorMessage = error.response.data.error || "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred. Please check your network.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-white px-6 py-8 flex flex-col justify-start">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaArrowLeft
            onClick={() => navigate(-1)}
            className="text-white text-lg cursor-pointer"
          />
          <h1 className="text-xl font-semibold">Login</h1>
        </div>
        <button
          className="text-[#fea92a] font-medium"
          onClick={() => navigate("/register")}
        >
          Sign Up
        </button>
      </div>

      {/* Logo + Arcs */}
      <div className="flex justify-center mb-10 mt-20">
        <div className="relative w-58 h-58 flex items-center justify-center">
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
          <svg className="absolute w-50 h-50 spin-medium" viewBox="0 0 100 100">
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
          <div className="relative flex items-center justify-center w-40 h-40 p-4 border-6 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
            <span className="text-white text-3xl font-bold tracking-widest uppercase">
              {platformName}
            </span>
          </div>
        </div>
      </div>

      {/* Login Type Switch */}
      <div className="flex justify-center gap-6 mb-6 text-base mt-15">
        <button
          onClick={() => setLoginType("email")}
          className={`pb-1 transition ${
            loginType === "email"
              ? "border-b-2 border-[#18ffc8] text-white"
              : "text-gray-400"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setLoginType("phone")}
          className={`pb-1 transition ${
            loginType === "phone"
              ? "border-b-2 border-[#18ffc8] text-white"
              : "text-gray-400"
          }`}
        >
          Phone Number
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {loginType === "email" ? (
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 bg-[#162821] rounded-md focus:outline-none"
            required
          />
        ) : (
          <div className="flex gap-3">
            <select
              name="phoneCode"
              value={formData.phoneCode}
              onChange={handleChange}
              className="w-1/3 p-4 bg-[#162821] rounded-md focus:outline-none"
            >
              <option value="+234">🇳🇬 +234</option>
              <option value="+233">🇬🇭 +233</option>
            </select>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-2/3 p-4 bg-[#162821] rounded-md focus:outline-none"
              required
            />
          </div>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-4 bg-[#162821] rounded-md focus:outline-none"
          required
        />

        <button
          type="submit"
          className={`w-full py-3 mt-2 font-semibold rounded-xl transition ${
            loading ? "bg-[#98ffec] cursor-not-allowed" : "bg-[#18ffc8] text-black"
          }`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;