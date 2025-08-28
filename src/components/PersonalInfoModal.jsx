import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaUserTag, FaCheck } from 'react-icons/fa';
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

  const fieldConfig = [
    { name: 'firstname', label: 'First Name', icon: <FaUser />, editable: false },
    { name: 'lastname', label: 'Last Name', icon: <FaUser />, editable: false },
    { name: 'email', label: 'Email', icon: <FaEnvelope />, editable: false },
    { name: 'phone', label: 'Phone', icon: <FaPhone />, editable: true },
    { name: 'username', label: 'Username', icon: <FaUserTag />, editable: true },
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
            className="p-2 rounded-full"
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
                {isEditing && field.editable ? (
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

          {/* Action Buttons at Bottom */}
          <div className="flex justify-center space-x-4 mt-8">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="py-3 px-6 rounded-lg flex items-center text-lg font-semibold"
                  style={{ 
                    backgroundColor: "#18ffc8", 
                    color: "#09100d",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <FaSave className="mr-2" size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstname: user.firstname || '',
                      lastname: user.lastname || '',
                      email: user.email || '',
                      phone: user.phonenumber || '',
                      username: user.username || '',
                    });
                  }}
                  className="py-3 px-6 rounded-lg flex items-center text-lg font-semibold"
                  style={{ 
                    backgroundColor: "#f57cff", 
                    color: "#09100d" 
                  }}
                >
                  <FaTimes className="mr-2" size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="py-3 px-6 rounded-lg flex items-center text-lg font-semibold"
                style={{ 
                  backgroundColor: "#fea92a", 
                  color: "#09100d" 
                }}
              >
                <FaEdit className="mr-2" size={18} />
                Edit Information
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoModal;