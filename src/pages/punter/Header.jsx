import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";
import logoImage from "../../assets/logo1.png";

const Header = () => {
  const navigate = useNavigate();

  // State to manage user data, loading, and errors
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSwitchClick = async () => {
    if (!user) return;

    try {
      const data = { userId: user._id, role: "user" }; // Always set role to customer
      await axios.post(`${Api}/client/changeRole`, data);

      // Show success toast with delay before redirecting
      toast.success("Redirecting, please login again with your details", {
        duration: 3000,
        position: "top-center",
      });

      // Navigate after 3 seconds
      setTimeout(() => {
        navigate("/customer/home");
      }, 3000);
    } catch (err) {
      toast.error("Failed to switch role. Please try again.");
      console.error("Failed to update user role:", err);
    }
  };

  return (
    <header className="w-full bg-[#09100d] py-3 flex items-center justify-between shadow-md">
      {/* Toast container */}
      <Toaster />

      {/* Logo / Platform Name */}
      <img src={logoImage} alt="Platform Logo" className="max-w-45" />
      {/* Switch Button */}
      <button
        onClick={handleSwitchClick}
        className="bg-[#18ffc8] text-black font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
      >
        Switch
      </button>
    </header>
  );
};

export default Header;
