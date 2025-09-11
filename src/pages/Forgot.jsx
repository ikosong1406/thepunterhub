import React, { useState } from "react";
import axios from "axios";
import "../styles/Splash.css";
import logoImage from "../assets/logo2.png";
import Api from "../components/Api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgetScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Removed local error/success state to use toast
    toast.dismiss(); // Clear any existing toasts

    try {
      await axios.post(`${Api}/client/reset`, { email });
      setStep(2);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const verificationCode = code.join("");
    toast.dismiss();

    if (verificationCode.length !== 4) {
      toast.error("Please enter the 4-digit code.");
      setLoading(false);
      return;
    }

    try {
      // Send email and code to the backend for verification
      await axios.post(`${Api}/client/verifyCode`, {
        email,
        code: verificationCode,
      });
      setStep(3);
      toast.success("Code verified successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify code.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const data = {
      email,
      password,
    };

    try {
      // Send email and new password to the backend to finalize the reset
      await axios.post(`${Api}/client/newpassword`, data);

      toast.success("Password reset successfully! Redirecting to login...");

      // Wait for 3 seconds before navigating
      setTimeout(() => {
        navigate("/login"); // Redirect to the login page
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus to next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  return (
    <div
      className="min-h-screen flex-1 items-center justify-center p-4"
      style={{ backgroundColor: "#09100d" }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      {/* Logo for mobile only */}
      <div className="lg:hidden flex justify-center mb-10 mt-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
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
          <svg
            className="absolute w-3/4 h-3/4 spin-medium"
            viewBox="0 0 100 100"
          >
            <path
              d="M50,0 A50,50 0 1,1 0,50"
              fill="none"
              stroke="#855391"
              strokeWidth="6"
              strokeLinecap="round"
              className="glow-stroke"
            />
          </svg>
          <div className="relative flex items-center justify-center w-28 h-28 p-4 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
            <img
              src={logoImage}
              alt="Platform Logo"
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "#18ffc8" }}>
            Reset Your Password
          </h2>
          <div className="flex justify-center mt-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= i ? "bg-blue-500" : "bg-lightGray"
                  }`}
                  style={{
                    backgroundColor: step >= i ? "#18ffc8" : "#376553",
                    color: step >= i ? "#09100d" : "#efefef",
                  }}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className="w-8 h-1 mx-1"
                    style={{
                      backgroundColor: step > i ? "#18ffc8" : "#376553",
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded text-sm"
            style={{ backgroundColor: "#376553", color: "#f57cff" }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mb-4 p-3 rounded text-sm"
            style={{ backgroundColor: "#376553", color: "#18ffc8" }}
          >
            {success}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block mb-2"
                style={{ color: "#efefef" }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded"
                style={{ backgroundColor: "#376553", color: "#efefef" }}
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded font-semibold"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit}>
            <div className="mb-4">
              <label className="block mb-2" style={{ color: "#efefef" }}>
                Enter Verification Code
              </label>
              <div className="flex justify-between space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl rounded"
                    style={{ backgroundColor: "#376553", color: "#efefef" }}
                    required
                  />
                ))}
              </div>
              <p className="text-sm mt-2" style={{ color: "#efefef" }}>
                We sent a 4-digit code to {email}
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded font-semibold"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
            >
              Verify Code
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block mb-2"
                style={{ color: "#efefef" }}
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded"
                style={{ backgroundColor: "#376553", color: "#efefef" }}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block mb-2"
                style={{ color: "#efefef" }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded"
                style={{ backgroundColor: "#376553", color: "#efefef" }}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded font-semibold"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetScreen;
