// src/pages/Splash.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage"; // Import localforage
import axios from "axios";
import tipsterImage from "../assets/field.jpg";
import "../styles/Splash.css";
import Api from "../components/Api"

const SplashScreen = ({ platformName = "PH" }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Step 1: Check backend status
        const backendResponse = await axios.get(`${Api}`);
        if (backendResponse.status !== 200) {
          console.error("Backend server is not reachable.");
          // You might want to handle this error state, e.g., show an error message
          return;
        }

        console.log("Backend server is running. Checking user auth...");

        // Step 2: Check for user token and role from localforage
        const [token, role] = await Promise.all([
          localforage.getItem("token"),
          localforage.getItem("role"),
        ]);

        // Step 3: Determine navigation path
        if (token && role) {
          // User is authenticated and has a role
          if (role === "customer") {
            navigate("/customer/home");
          } else if (role === "punter") {
            navigate("/punter/home");
          } else {
            // Fallback for an unknown role
            navigate("/welcome");
          }
        } else {
          // No token or role found, user is not authenticated
          navigate("/welcome");
        }
      } catch (error) {
        console.error("Splash screen error:", error);
        // Navigate to welcome screen on any error
        navigate("/welcome");
      }
    };
    
    // Add a short delay to ensure the splash screen is visible for a moment
    const timer = setTimeout(() => {
      checkAuthAndNavigate();
    }, 2000); // 2-second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
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
          {/* ... (Your SVG and logo JSX here) */}
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