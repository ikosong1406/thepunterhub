import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";

const Header = ({ platformName = "Punter Hub" }) => {
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
    // Show loading toast immediately
    const toastId = toast.loading("Processing your request...");
    
    try {
      // Check if user data is loaded and is a punter
      if (user && user.isPunter) {
        // If user is a punter, update their role
        const data = { userId: user._id, role: "punter" };
        await axios.post(`${Api}/client/changeRole`, data);
        
        // Update toast to success and redirect after delay
        toast.success("Redirecting, please login again with your details", { id: toastId });
        setTimeout(() => navigate("/punter/home"), 2000);
      } else {
        // If not a punter, show message and redirect to become page
        setTimeout(() => navigate("/customer/become"), 2000);
      }
    } catch (err) {
      // Show error toast if something fails
      toast.error("Failed to process your request", { id: toastId });
      console.error("Failed to update user role:", err);
    }
  };

  return (
    <header className="w-full bg-[#09100d] py-3 flex items-center justify-between shadow-md">
      {/* Toast container */}
      <Toaster />
      
      {/* Logo / Platform Name */}
      <h1 className="text-[#fea92a] text-xl font-bold tracking-widest uppercase">
        {platformName}
      </h1>

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