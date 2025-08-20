import React from 'react';
import { FaWhatsapp, FaEnvelope, FaPhone, FaArrowLeft, FaTimes } from 'react-icons/fa';

const ContactUsModal = ({ onClose }) => {
  const contactMethods = [
    {
      type: "WhatsApp",
      icon: <FaWhatsapp size={24} />,
      details: "+234 123 456 7890",
      action: "https://wa.me/2341234567890",
      description: "Chat with our support team in real-time",
      color: "#25D366",
      buttonText: "Open WhatsApp"
    },
    {
      type: "Email",
      icon: <FaEnvelope size={24} />,
      details: "support@bettingapp.com",
      action: "mailto:support@bettingapp.com",
      description: "Send us an email and we'll respond within 24 hours",
      color: "#f57cff",
      buttonText: "Compose Email"
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <h2 
            className="text-xl font-bold"
            style={{ color: "#efefef" }}
          >
            Contact Us
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: "#efefef" }}
            >
              Need Help?
            </h3>
            <p 
              className="text-sm"
              style={{ color: "#376553" }}
            >
              Our support team is available to assist you with any questions or issues you may have.
            </p>
          </div>

          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#162821" }}
              >
                <div className="flex items-start mb-3">
                  <div 
                    className="p-3 rounded-full mr-4"
                    style={{ backgroundColor: "rgba(24, 255, 200, 0.1)", color: method.color }}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <h4 
                      className="font-semibold"
                      style={{ color: "#efefef" }}
                    >
                      {method.type}
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: "#18ffc8" }}
                    >
                      {method.details}
                    </p>
                  </div>
                </div>
                <p 
                  className="text-sm mb-4"
                  style={{ color: "#376553" }}
                >
                  {method.description}
                </p>
                <a
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-lg font-bold text-center"
                  style={{ backgroundColor: method.color, color: "#09100d" }}
                >
                  {method.buttonText}
                </a>
              </div>
            ))}
          </div>

          <div 
            className="mt-8 p-4 rounded-lg"
            style={{ backgroundColor: "#162821" }}
          >
            <h4 
              className="font-semibold mb-2"
              style={{ color: "#efefef" }}
            >
              Support Hours
            </h4>
            <p 
              className="text-sm mb-1"
              style={{ color: "#376553" }}
            >
              Monday - Friday: 9:00 AM - 5:00 PM (WAT)
            </p>
            <p 
              className="text-sm"
              style={{ color: "#376553" }}
            >
              Saturday: 10:00 AM - 2:00 PM (WAT)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t text-center"
          style={{ borderColor: "#376553" }}
        >
          <p 
            className="text-sm"
            style={{ color: "#376553" }}
          >
            For urgent issues outside business hours, please use WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUsModal;