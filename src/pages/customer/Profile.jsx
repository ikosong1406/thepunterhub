import React, { useState, useEffect } from "react";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import {
  FaUser,
  FaChevronRight,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { FaMoneyBillWave, FaUserPlus } from "react-icons/fa6";
import logoImage from "../../assets/logo3.png";

// Import modal components
import SubscribeModal from "../../components/SubscribeModal";
import PersonalInfoModal from "../../components/PersonalInfoModal";
import HelpCenterModal from "../../components/HelpCenterModal";
import ContactUsModal from "../../components/ContactUsModal";
import InviteModal from "../../components/InviteModal";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
        // Setting loading to false only after the first fetch
        setLoading(false);
      }
    }; // Initial fetch when the component mounts

    fetchUserData(); // Set up the interval to fetch data every 60 seconds (1 minute)

    const intervalId = setInterval(fetchUserData, 60000); // Cleanup function to clear the interval when the component unmounts

    return () => clearInterval(intervalId);
  }, []);

  const handleSignOut = async () => {
    await localforage.removeItem("token");
    window.location.href = "/login";
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  if (loading) {
    return (
      <div className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center">
        {/* Arcs + Logo */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-[15rem] h-[15rem] flex items-center justify-center">
            {/* ... (Your SVG and logo JSX here) */}
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
            <svg
              className="absolute w-[13rem] h-[13rem] spin-medium"
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
            <div className="relative flex items-center justify-center w-[10rem] h-[10rem] p-6 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
              <img
                src={logoImage}
                alt="Platform Logo"
                className="max-w-full max-h-full"
              />
            </div>
          </div>
        </div>
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

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();

  // Get first name and last name initials
  const initials = (
    user.firstname && user.lastname
      ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`
      : user.firstname
        ? user.firstname.charAt(0)
        : user.lastname
          ? user.lastname.charAt(0)
          : "U"
  ).toUpperCase();

  const currentPlan = user.subscription?.plan || "free";
  const expiresAt = user.subscription?.expiresAt;

  const isPremium = currentPlan.toLowerCase() === "premium";

  const isSubscriptionActive =
    isPremium &&
    !!expiresAt &&
    !Number.isNaN(new Date(expiresAt).getTime()) &&
    new Date(expiresAt).getTime() > Date.now();

  const planLabel = isSubscriptionActive ? "Premium" : "Free";

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
                <span
                  className="text-sm font-bold"
                  style={{ color: "#efefef" }}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-base" style={{ color: "#efefef" }}>
                {fullName || user.username || "User"}
              </h1>
            </div>
          </div>
          {user.isEmailVerified && (
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: "#376553", color: "#18ffc8" }}
            >
              VERIFIED
            </span>
          )}
        </div>

        {/* Subscription Plan Card */}
        <div
          className="mb-6 p-4 rounded-lg flex flex-col items-start"
          style={{ backgroundColor: "#09100d" }}
        >
          <div className="flex justify-between items-center w-full mb-3 gap-3">
            <div className="flex flex-col">
              <span
                className="text-xs font-semibold"
                style={{ color: "#f57cff" }}
              >
                Current Plan
              </span>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xl font-bold"
                  style={{ color: isPremium ? "#fea92a" : "#efefef" }}
                >
                  {isPremium ? "Premium Plan" : "Free Plan"}
                </span>
              </div>

              {isPremium && expiresAt && (
                <span className="text-xs mt-2" style={{ color: "#efefef99" }}>
                  Expires:{" "}
                  {new Date(expiresAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {!isSubscriptionActive && (
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm
      font-medium transition-transform hover:scale-105 shrink-0"
                style={{
                  backgroundColor: "#fea92a",
                  color: "#09100d",
                }}
                onClick={() => setActiveModal("subscribe")}
              >
                <IoMdAdd className="text-sm" />
                <span> Subscribe</span>
              </button>
            )}
          </div>

          {/* Referral Balance */}
          <div className="flex items-center gap-2 mt-2 w-full">
            <FaMoneyBillWave style={{ color: "#f57cff", fontSize: "1rem" }} />

            <span className="text-xs font-medium" style={{ color: "#f57cff" }}>
              Referral Balance:
            </span>

            <span className="text-sm font-bold" style={{ color: "#efefef" }}>
              {Number(user.balance || 0).toFixed(2)}
            </span>
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
            <MenuItem
              icon={<FaUser />}
              title="Personal Information"
              onClick={() => setActiveModal("personal-info")}
            />
            <MenuItem
              icon={<FaUserPlus />}
              title="Invite Friends"
              onClick={() => setActiveModal("invite")}
            />
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
            <MenuItem
              icon={<FaQuestionCircle />}
              title="Help Center"
              onClick={() => setActiveModal("help-center")}
            />
            <MenuItem
              icon={<FaQuestionCircle />}
              title="Contact Us"
              onClick={() => setActiveModal("contact-us")}
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium"
            style={{ backgroundColor: "#376553", color: "#efefef" }}
          >
            <FaSignOutAlt />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "subscribe" && (
        <SubscribeModal
          user={user}
          onClose={closeModal}
          onDepositSuccess={(newBalance) => {
            setUser({ ...user, balance: newBalance });
            closeModal();
          }}
        />
      )}
      {activeModal === "personal-info" && (
        <PersonalInfoModal user={user} onClose={closeModal} />
      )}
      {activeModal === "help-center" && (
        <HelpCenterModal onClose={closeModal} />
      )}
      {activeModal === "contact-us" && <ContactUsModal onClose={closeModal} />}
      {activeModal === "invite" && (
        <InviteModal user={user} onClose={closeModal} />
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(9, 16, 13, 0.8)" }}
        >
          <div
            className="bg-gray rounded-lg p-6 max-w-sm w-full"
            style={{ backgroundColor: "#162821" }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "#efefef" }}>
              Confirm Logout
            </h3>
            <p style={{ color: "#efefef", marginBottom: "1.5rem" }}>
              Are you sure you want to sign out?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: "#376553", color: "#efefef" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-2 rounded-lg font-medium"
                style={{ backgroundColor: "#fea92a", color: "#09100d" }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, title, onClick }) => (
  <div
    className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
    style={{ backgroundColor: "#162821" }}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div style={{ color: "#fea92a" }}>{icon}</div>
      <span style={{ color: "#efefef" }} className="text-sm">
        {title}
      </span>
    </div>
    <FaChevronRight style={{ color: "#18ffc8" }} />
  </div>
);

export default ProfilePage;
