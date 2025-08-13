// src/components/SignupScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Api from "../components/Api";

const SignupScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneCode: "+234",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    promoCode: "",
    acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const { firstname, lastname, email, phoneNumber, password, confirmPassword, acceptTerms } = formData;
    if (!firstname || !lastname || !email || !phoneNumber || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (!acceptTerms) {
      toast.error("You must accept the terms to continue.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    const data = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      phoneCode: formData.phoneCode, // Keep the phone code separate
      phoneNumber: formData.phoneNumber, // Correctly combine phone code and number
      password: formData.password,
      promoCode: formData.promoCode,
    };

    try {
      const response = await axios.post(`${Api}/client/register`, data);
      
      if (response.status === 201) {
        toast.success("Account created successfully! Redirecting to login...", { duration: 3000 });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response) {
        // This handles errors from the backend with a response body.
        const { status, data } = error.response;
        
        if (status === 409) {
          // 409 Conflict: user already exists
          toast.error(data.message || "An account with this email or phone number already exists.");
        } else if (status === 400) {
          // 400 Bad Request: validation errors from the backend
          toast.error(data.message || "Invalid data provided. Please check your form.");
        } else {
          // Generic error for other 4xx or 5xx status codes
          toast.error(data.message || `Server error: ${status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received.
        toast.error("No response from the server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error.
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-white px-8 py-10">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <FaArrowLeft
            onClick={() => navigate(-1)}
            className="text-white cursor-pointer"
          />
          <h1 className="text-xl font-semibold">Signup</h1>
        </div>
        <button
          className="text-[#fea92a] font-medium"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          className="w-full p-5 bg-[#162821] rounded-md"
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          className="w-full p-5 bg-[#162821] rounded-md mt-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-5 bg-[#162821] rounded-md mt-2"
          required
        />
        {/* Phone number with country code */}
        <div className="flex gap-4 mt-2">
          <select
            name="phoneCode"
            value={formData.phoneCode}
            onChange={handleChange}
            className="w-1/3 p-5 bg-[#162821] rounded-md"
          >
            <option value="+234">🇳🇬 +234</option>
            <option value="+233">🇬🇭 +233</option>
          </select>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-2/3 p-5 bg-[#162821] rounded-md"
            required
          />
        </div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-5 bg-[#162821] rounded-md mt-2"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-5 bg-[#162821] rounded-md mt-2"
          required
        />
        <input
          type="text"
          name="promoCode"
          placeholder="Promo Code (optional)"
          value={formData.promoCode}
          onChange={handleChange}
          className="w-full p-3 bg-[#162821] rounded-md mt-2"
        />
        {/* Terms Checkbox */}
        <label className="flex items-start gap-2 text-sm mt-2">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="mt-1"
          />
          <span>
            I confirm I am over 21 years old and accept the{" "}
            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="text-[#855391] underline"
            >
              Terms & Conditions
            </button>
          </span>
        </label>
        {/* Submit button with loading state */}
        <button
          type="submit"
          className={`w-full py-3 mt-4 text-black font-semibold rounded-xl hover:opacity-90 transition mt-10 ${loading ? 'bg-[#98ffec] cursor-not-allowed' : 'bg-[#18ffc8]'}`}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignupScreen;