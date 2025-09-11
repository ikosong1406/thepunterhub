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
import { IoMdAdd, IoIosStats } from "react-icons/io";
import { MdPriceChange, MdLeaderboard } from "react-icons/md";
import { HiIdentification } from "react-icons/hi2";
import { FaMoneyBillWave, FaUserPlus } from "react-icons/fa6"; // New icon for "Invite"

import WithdrawModal from "../../components/WithdrawModal";
import PersonalInfoModal from "../../components/PersonalInfoModal";
import TransactionHistoryModal from "../../components/TransactionHistoryModal";
import HelpCenterModal from "../../components/HelpCenterModal";
import ContactUsModal from "../../components/ContactUsModal";
import PricesModal from "../../components/PricesModal";
import LeaderboardModal from "../../components/LeaderboardModal";
import VerificationModal from "../../components/VerificationModal";
import BuyCoinModal from "../../components/BuyCoinModal";
import InviteModal from "../../components/InviteModal"; // New import for the InviteModal

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
        setLoading(false);
      }
    };

    fetchUserData();
    const intervalId = setInterval(fetchUserData, 60000);
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

  const initials = (
    user.firstname && user.lastname
      ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`
      : user.firstname
      ? user.firstname.charAt(0)
      : user.lastname
      ? user.lastname.charAt(0)
      : "U"
  ).toUpperCase();

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
                  className="text-lg font-bold"
                  style={{ color: "#efefef" }}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-bold" style={{ color: "#efefef" }}>
                {user.isPunter ? user.username : "User"}
              </h1>
              <p className="text-xs" style={{ color: "#18ffc8" }}>
                Punter Account
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

        {/* Redesigned Balance Card */}
        <div
          className="mb-6 p-4 rounded-lg flex flex-col items-start"
          style={{ backgroundColor: "#09100d" }}
        >
          <div className="flex justify-between items-center w-full mb-3">
            <div className="flex flex-col">
              <span
                className="text-sm font-semibold"
                style={{ color: "#f57cff" }}
              >
                Main Balance
              </span>
              <div className="flex items-center space-x-2">
                <FaWallet style={{ color: "#efefef", fontSize: "1.2rem" }} />
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#efefef" }}
                >
                  {user.balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                className="flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-transform transform hover:scale-105"
                style={{ backgroundColor: "#18ffc8", color: "#09100d" }}
                onClick={() => setActiveModal("deposit")}
              >
                <IoMdAdd className="text-sm" />
                <span>Deposit</span>
              </button>
              <button
                className="flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-transform transform hover:scale-105"
                style={{ backgroundColor: "#fea92a", color: "#09100d" }}
                onClick={() => setActiveModal("withdraw")}
              >
                <IoIosStats className="text-sm" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Promo Balance Row */}
          <div className="flex items-center space-x-2 mt-2 w-full">
            <FaMoneyBillWave style={{ color: "#f57cff", fontSize: "1rem" }} />
            <span className="text-sm font-medium" style={{ color: "#f57cff" }}>
              Promo Balance:
            </span>
            <span className="text-lg font-bold" style={{ color: "#efefef" }}>
              {user.promoBalance?.toFixed(2) || "0.00"}
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
              icon={<FaHistory />}
              title="Transaction History"
              onClick={() => setActiveModal("transaction-history")}
            />
            <MenuItem
              icon={<MdPriceChange />}
              title="Categories"
              onClick={() => setActiveModal("prices")}
            />
            <MenuItem
              icon={<MdLeaderboard />}
              title="Leaderboard"
              onClick={() => setActiveModal("leaderboard")}
            />
            {!user.isVerified && (
              <MenuItem
                icon={<HiIdentification />}
                title="Verification"
                onClick={() => setActiveModal("verification")}
              />
            )}
            {/* New Invite Menu Item */}
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
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-transform transform hover:scale-105"
            style={{ backgroundColor: "#376553", color: "#efefef" }}
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "deposit" && (
        <BuyCoinModal user={user} onClose={closeModal} />
      )}
      {activeModal === "withdraw" && (
        <WithdrawModal
          user={user}
          onClose={closeModal}
          onWithdrawSuccess={(newBalance) => {
            setUser({ ...user, balance: newBalance });
            closeModal();
          }}
        />
      )}
      {activeModal === "personal-info" && (
        <PersonalInfoModal user={user} onClose={closeModal} />
      )}
      {activeModal === "transaction-history" && (
        <TransactionHistoryModal user={user} onClose={closeModal} />
      )}
      {activeModal === "prices" && (
        <PricesModal user={user} onClose={closeModal} />
      )}
      {activeModal === "leaderboard" && (
        <LeaderboardModal user={user} onClose={closeModal} />
      )}
      {activeModal === "verification" && (
        <VerificationModal user={user} onClose={closeModal} />
      )}
      {activeModal === "help-center" && (
        <HelpCenterModal onClose={closeModal} />
      )}
      {activeModal === "contact-us" && <ContactUsModal onClose={closeModal} />}
      {/* New Invite Modal */}
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

// Reusable menu item component
const MenuItem = ({ icon, title, onClick }) => (
  <div
    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
    style={{ backgroundColor: "#162821" }}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div style={{ color: "#fea92a" }}>{icon}</div>
      <span style={{ color: "#efefef" }}>{title}</span>
    </div>
    <FaChevronRight style={{ color: "#18ffc8" }} />
  </div>
);

export default ProfilePage;
