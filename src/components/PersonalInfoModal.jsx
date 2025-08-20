import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaUserTag, FaCheck } from 'react-icons/fa';
// import axios from 'axios';
// import Api from '../../components/Api';
import localforage from 'localforage';

const PersonalInfoModal = ({ user, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
    phone: user.phonenumber || '',
    username: user.username || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Sample subscribed punters data
  const [subscribedPunters, setSubscribedPunters] = useState([
    { id: 1, name: "Goal Prophet", since: "2023-05-15", avatar: "G", active: true },
    { id: 2, name: "Bet Master", since: "2023-06-22", avatar: "B", active: true },
    { id: 3, name: "Win Guru", since: "2023-07-10", avatar: "W", active: false },
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await localforage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call:
      // const response = await axios.post(`${Api}/client/updateProfile`, { token, ...formData });
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = (punterId) => {
    setSubscribedPunters(subscribedPunters.map(p => 
      p.id === punterId ? { ...p, active: false } : p
    ));
  };

  const handleResubscribe = (punterId) => {
    setSubscribedPunters(subscribedPunters.map(p => 
      p.id === punterId ? { ...p, active: true } : p
    ));
  };

  const fieldConfig = [
    { name: 'firstname', label: 'First Name', icon: <FaUser /> },
    { name: 'lastname', label: 'Last Name', icon: <FaUser /> },
    { name: 'email', label: 'Email', icon: <FaEnvelope />, disabled: true },
    { name: 'phone', label: 'Phone', icon: <FaPhone /> },
    { name: 'username', label: 'Username', icon: <FaUserTag />, disabled: true },
  ];

  // Get first name and last name initials
  const initials = ((user.firstname && user.lastname) ? 
    `${user.firstname.charAt(0)}${user.lastname.charAt(0)}` : 
    (user.firstname ? user.firstname.charAt(0) : 
    (user.lastname ? user.lastname.charAt(0) : "U"))
  ).toUpperCase();

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
            Personal Information
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
          {error && (
            <div 
              className="mb-4 p-3 rounded-lg text-center text-sm"
              style={{ backgroundColor: "rgba(245, 124, 255, 0.1)", color: "#f57cff" }}
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              className="mb-4 p-3 rounded-lg text-center text-sm"
              style={{ backgroundColor: "rgba(24, 255, 200, 0.1)", color: "#18ffc8" }}
            >
              {success}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex justify-center mb-8">
            <div 
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#376553" }}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold" style={{ color: "#efefef" }}>
                  {initials}
                </span>
              )}
              {isEditing && (
                <button
                  className="absolute bottom-0 right-0 p-2 rounded-full"
                  style={{ backgroundColor: "#fea92a", color: "#09100d" }}
                >
                  <FaEdit size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4 mb-8">
            {fieldConfig.map((field) => (
              <div key={field.name}>
                <label 
                  className="block text-sm mb-1 flex items-center"
                  style={{ color: "#f57cff" }}
                >
                  <span className="mr-2">{field.icon}</span>
                  {field.label}
                </label>
                {isEditing && !field.disabled ? (
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg"
                    style={{ backgroundColor: "#162821", color: "#efefef", borderColor: "#376553" }}
                  />
                ) : (
                  <div 
                    className="w-full p-3 rounded-lg"
                    style={{ backgroundColor: "#162821", color: "#efefef", borderColor: "#376553" }}
                  >
                    {formData[field.name] || 'Not provided'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subscribed Punters Section */}
          <div className="mb-6">
            <h3 
              className="text-lg font-semibold mb-4 flex items-center"
              style={{ color: "#efefef" }}
            >
              <FaUserTag className="mr-2" style={{ color: "#f57cff" }} />
              Your Subscriptions
            </h3>
            
            {subscribedPunters.length > 0 ? (
              <div className="space-y-3">
                {subscribedPunters.map(punter => (
                  <div 
                    key={punter.id} 
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: "#162821" }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: "#376553", color: "#efefef" }}
                      >
                        {punter.avatar}
                      </div>
                      <div>
                        <p style={{ color: "#efefef" }}>{punter.name}</p>
                        <p 
                          className="text-xs"
                          style={{ color: "#18ffc8" }}
                        >
                          Since {new Date(punter.since).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {punter.active ? (
                      <button
                        onClick={() => handleUnsubscribe(punter.id)}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: "rgba(245, 124, 255, 0.2)", color: "#f57cff" }}
                      >
                        Unsubscribe
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResubscribe(punter.id)}
                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center"
                        style={{ backgroundColor: "rgba(24, 255, 200, 0.2)", color: "#18ffc8" }}
                      >
                        <FaCheck className="mr-1" size={10} />
                        Resubscribe
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "#162821", color: "#efefef" }}
              >
                You don't have any active subscriptions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoModal;