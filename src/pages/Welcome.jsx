// src/components/WelcomeScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // for navigation
import tipsterImage from "../assets/field.jpg";
import "../styles/Splash.css";

const WelcomeScreen = ({ platformName = "PH" }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login"); // redirect to login screen
  };

  const handleSignup = () => {
    navigate("/register"); // redirect to signup screen
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center px-4"
      style={{ backgroundImage: `url(${tipsterImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-80"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* Logo with Arcs */}
        <div className="relative w-[18rem] h-[18rem] flex items-center justify-center">
          {/* Outer Orange Arc */}
          <svg
            className="absolute w-full h-full spin-slow"
            viewBox="0 0 100 100"
          >
            <path
              d="M50,0 A50,50 0 1,1 0,50"
              fill="none"
              stroke="#fea92a"
              strokeWidth="4"
              strokeLinecap="round"
              className="glow-stroke"
            />
          </svg>

          {/* Middle Purple Arc */}
          <svg
            className="absolute w-[16rem] h-[16rem] spin-medium"
            viewBox="0 0 100 100"
          >
            <path
              d="M50,0 A50,50 0 1,1 0,50"
              fill="none"
              stroke="#855391"
              strokeWidth="4"
              strokeLinecap="round"
              className="glow-stroke"
            />
          </svg>

          {/* Center Logo */}
          <div className="relative flex items-center justify-center w-[13rem] h-[13rem] p-6 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
            <span className="text-white text-5xl font-bold tracking-widest uppercase">
              {platformName}
            </span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-white max-w-md text-center px-4">
          <h1 className="text-3xl font-bold text-[#efefef] mb-2">
            Welcome to {platformName}
          </h1>
          <p className="text-base">
            Unlock the power of expert predictions and tips, live updates, and more.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-6 w-full max-w-sm px-4">
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl text-black font-semibold bg-[#18ffc8] hover:opacity-90 transition"
          >
            Login into your account
          </button>
          <button
            onClick={handleSignup}
            className="w-full py-3 rounded-xl border-2 border-[#18ffc8] text-[#18ffc8] font-semibold hover:bg-[#18ffc8]/10 transition"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
