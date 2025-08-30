// src/components/WelcomeScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // for navigation
import tipsterImage from "../assets/field.jpg";
import "../styles/Splash.css";
import logoImage from "../assets/logo2.png";

const RegisterOptionScreen = ({ platformName = "PunterHub" }) => {
  const navigate = useNavigate();

  const handleUser = () => {
    navigate("/userRegister"); // redirect to login screen
  };

  const handlePunter = () => {
    navigate("/punterRegister"); // redirect to signup screen
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center px-4 bg-[#09100d]"
    >
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
            <img
              src={logoImage}
              alt="Platform Logo"
              className="max-w-full max-h-full"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-white max-w-md text-center px-4">
          <h1 className="text-2xl font-bold text-[#efefef] mb-2">
            Choose your role to get started on {platformName}
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-6 w-full max-w-sm px-4">
          <button
            onClick={handleUser}
            className="w-full py-3 rounded-xl text-black font-semibold bg-[#18ffc8] hover:opacity-90 transition"
          >
            Join Signal Plan
          </button>
          <button
            onClick={handlePunter}
            className="w-full py-3 rounded-xl border-2 border-[#18ffc8] text-[#18ffc8] font-semibold hover:bg-[#18ffc8]/10 transition"
          >
            I'm a Strategist
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterOptionScreen;
