// src/components/SignupScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const SignupScreen = () => {
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      alert("You must accept the terms to continue.");
      return;
    }
    // Handle form submit logic
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-white px-8 py-10">
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 mt-4 bg-[#18ffc8] text-black font-semibold rounded-xl hover:opacity-90 transition mt-10"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupScreen;
