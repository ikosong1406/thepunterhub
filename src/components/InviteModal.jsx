import React, { useState } from 'react';
import { FaTimes, FaShareAlt, FaCopy } from 'react-icons/fa';

const InviteModal = ({ onClose, user }) => {
  const [copied, setCopied] = useState(false);

  // Fallback for promo code if not available
  const promoCode = user?.promoCode || "CODE_NOT_AVAILABLE";

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset "Copied" message after 2 seconds
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(9, 16, 13, 0.9)" }} // Darker overlay for focus
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative"
          style={{ backgroundColor: "#162821", border: "1px solid #376553" }}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-gray-700"
            style={{ color: "#efefef", backgroundColor: "#09100d" }}
          >
            <FaTimes size={16} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 
              className="text-2xl font-bold"
              style={{ color: "#efefef" }}
            >
              Invite Friends
            </h2>
            <p className="text-sm mt-2" style={{ color: "#18ffc8" }}>
              Share your unique code and get rewarded!
            </p>
          </div>

          {/* Promo Code Section */}
          <div className="p-4 rounded-lg text-center mb-6" style={{ backgroundColor: "#09100d", border: "1px dashed #376553" }}>
            <p className="text-xs uppercase font-medium" style={{ color: "#f57cff" }}>
              Your Promo Code
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="text-4xl font-extrabold tracking-widest" style={{ color: "#fea92a" }}>
                {promoCode}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: copied ? "#18ffc8" : "#376553", color: copied ? "#09100d" : "#efefef" }}
            >
              {copied ? (
                <>
                  <FaCheck size={16} />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy size={16} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                // Example of a sharing action, can be customized
                if (navigator.share) {
                  navigator.share({
                    title: 'Join me on [App Name]',
                    text: `Hey! Use my promo code "${promoCode}" to get started and earn rewards!`,
                    url: window.location.href,
                  });
                } else {
                  // Fallback for browsers that don't support Web Share API
                  alert("Web Share API is not supported in this browser. Please use the 'Copy Code' button.");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
            >
              <FaShareAlt size={16} />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;