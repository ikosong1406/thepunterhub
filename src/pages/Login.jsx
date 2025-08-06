import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/customer/home");
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-white px-6 py-8 flex flex-col justify-start">
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
      <div className="flex justify-center gap-6 mb-6 text-base mt-20">
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
          className="w-full py-3 mt-2 bg-[#18ffc8] text-black font-semibold rounded-xl hover:opacity-90 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
