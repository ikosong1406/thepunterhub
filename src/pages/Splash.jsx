// src/components/SplashScreen.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router
import tipsterImage from "../assets/field.jpg";
import "../styles/Splash.css";

const SplashScreen = ({ platformName = "PH" }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome"); // route to Welcome screen
    }, 3000);

    return () => clearTimeout(timer); // cleanup
  }, [navigate]);

  return (
    <div
      className="relative flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center"
      style={{ backgroundImage: `url(${tipsterImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-80"></div>

      {/* Arcs + Logo */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="relative w-[18rem] h-[18rem] flex items-center justify-center">
          {/* Orange Arc */}
          <svg className="absolute w-full h-full spin-slow" viewBox="0 0 100 100">
            <path
              d="M50,0 A50,50 0 1,1 0,50"
              fill="none"
              stroke="#fea92a"
              strokeWidth="4"
              strokeLinecap="round"
              className="glow-stroke"
            />
          </svg>

          {/* Purple Arc */}
          <svg className="absolute w-[16rem] h-[16rem] spin-medium" viewBox="0 0 100 100">
            <path
              d="M50,0 A50,50 0 1,1 0,50"
              fill="none"
              stroke="#855391"
              strokeWidth="4"
              strokeLinecap="round"
              className="glow-stroke"
            />
          </svg>

          {/* Logo */}
          <div className="relative flex items-center justify-center w-[13rem] h-[13rem] p-6 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
            <span className="text-white text-5xl font-bold tracking-widest uppercase">
              {platformName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
