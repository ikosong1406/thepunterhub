import React, { useState, useEffect } from "react";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import {
  FaUser,
  FaWallet,
  FaChevronRight,
  FaHistory,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token"); // or wherever you store your auth token
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.post(`${Api}/client/getUser`, { token });

        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#09100d" }}
      >
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#09100d" }}
      >
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#09100d" }}
      >
        <p className="text-white">No user data found.</p>
      </div>
    );
  }

  const handleSignOut = () => {
    localStorage.removeItem("token");
    // Redirect to login page or home page
    window.location.href = "/login";
  };

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#09100d" }}>
      {/* Header */}
      <div className="pt-6 px-4" style={{ backgroundColor: "#162821" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#376553" }}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-lg" style={{ color: "#efefef" }} />
              )}
            </div>
            <div>
              <h1 className="font-bold" style={{ color: "#efefef" }}>
                {fullName || user.username || "User"}
              </h1>
              <p className="text-xs" style={{ color: "#18ffc8" }}>
                User Account
              </p>
            </div>
          </div>
          {user.isVerified && (
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: "#376553", color: "#18ffc8" }}
            >
              VERIFIED
            </span>
          )}
        </div>

        {/* Balance Card */}
        <div
          className="mb-6 p-4 rounded-lg"
          style={{ backgroundColor: "#09100d" }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: "#f57cff" }}>
              Main Balance
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold" style={{ color: "#efefef" }}>
              {user.balance?.toFixed(2) || "0.00"}
            </span>
            <button
              className="flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
            >
              <IoMdAdd className="text-sm" />
              <span>Buy Coin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Menu */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-3 uppercase"
            style={{ color: "#f57cff" }}
          >
            Account
          </h3>
          <div className="space-y-2">
            <MenuItem icon={<FaUser />} title="Personal Information" />
            <MenuItem icon={<FaHistory />} title="Transaction History" />
          </div>
        </div>

        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-3 uppercase"
            style={{ color: "#f57cff" }}
          >
            Support
          </h3>
          <div className="space-y-2">
            <MenuItem icon={<FaQuestionCircle />} title="Help Center" />
            <MenuItem icon={<FaQuestionCircle />} title="Contact Us" />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "#376553", color: "#efefef" }}
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable menu item component
const MenuItem = ({ icon, title }) => (
  <div
    className="flex items-center justify-between p-3 rounded-lg"
    style={{ backgroundColor: "#162821" }}
  >
    <div className="flex items-center space-x-3">
      <div style={{ color: "#fea92a" }}>{icon}</div>
      <span style={{ color: "#efefef" }}>{title}</span>
    </div>
    <FaChevronRight style={{ color: "#18ffc8" }} />
  </div>
);

export default ProfilePage;
