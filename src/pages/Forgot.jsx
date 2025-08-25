import React, { useState } from "react";
import axios from "axios";
import "../styles/Splash.css";
import logoImage from "../assets/logo2.png";

const ForgetScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Replace with your actual API endpoint
      await axios.post("/api/forgot-password", { email });
      setStep(2);
      setSuccess("Verification code sent to your email");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setStep(3);
    setError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual API endpoint
      await axios.post("/api/reset-password", {
        email,
        code: code.join(""),
        password,
      });
      setSuccess("Password reset successfully");
      // Optionally redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
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
                We sent a 6-digit code to {email}
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
