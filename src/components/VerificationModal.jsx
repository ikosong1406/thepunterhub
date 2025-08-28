import React, { useState } from 'react';
import { FaTimes, FaUpload, FaCheck, FaInfoCircle, FaIdCard, FaGlobe } from 'react-icons/fa';

const VerificationModal = ({ user, onClose }) => {
  const [selectedIdType, setSelectedIdType] = useState('');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Function to get country from country code
  const getCountryFromCode = (countryCode) => {
    const countryMap = {
      '+234': 'Nigeria',
      '+1': 'United States',
      '+44': 'United Kingdom',
      '+91': 'India',
      '+61': 'Australia',
      '+1': 'Canada',
      '+27': 'South Africa',
      '+233': 'Ghana',
      '+254': 'Kenya',
      // Add more country codes as needed
    };
    
    return countryMap[countryCode] || 'your country';
  };

  // ID options based on country
  const getIdOptions = (countryCode) => {
    const country = getCountryFromCode(countryCode);
    
    const commonOptions = [
      { value: 'passport', label: 'International Passport', requiresBack: false },
      { value: 'driver_license', label: "Driver's License", requiresBack: true },
    ];
    
    const countrySpecific = {
      'Nigeria': [
        { value: 'nin', label: 'National Identity Number (NIN)', requiresBack: false },
        { value: 'voters', label: "Voter's Card", requiresBack: true },
      ],
      'United States': [
        { value: 'state_id', label: 'State ID Card', requiresBack: true },
        { value: 'us_passport_card', label: 'US Passport Card', requiresBack: true },
      ],
      'India': [
        { value: 'aadhaar', label: 'Aadhaar Card', requiresBack: true },
        { value: 'pan', label: 'PAN Card', requiresBack: false },
      ],
      'Ghana': [
        { value: 'ghanacard', label: 'Ghana Card', requiresBack: true },
      ],
      'Kenya': [
        { value: 'hudumanamba', label: 'Huduma Namba', requiresBack: false },
      ],
      'South Africa': [
        { value: 'greenbook', label: 'Green ID Book', requiresBack: true },
      ],
    };

    return [
      ...commonOptions,
      ...(countrySpecific[country] || [])
    ];
  };

  const idOptions = getIdOptions(user.countryCode);
  const selectedOption = idOptions.find(opt => opt.value === selectedIdType);
  const userCountry = getCountryFromCode(user.countryCode);

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (side === 'front') {
        setIdFront(file);
      } else {
        setIdBack(file);
      }
    }
  };

  const removeFile = (side) => {
    if (side === 'front') {
      setIdFront(null);
    } else {
      setIdBack(null);
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    simulateUpload();
    // In a real app, you would upload to your backend here
  };

  const isFormComplete = () => {
    if (!selectedIdType) return false;
    if (!idFront) return false;
    if (selectedOption.requiresBack && !idBack) return false;
    return true;
  };

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
            className="text-xl font-bold flex items-center"
            style={{ color: "#efefef" }}
          >
            <FaIdCard className="mr-2" style={{ color: "#fea92a" }} />
            Identity Verification
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
          {/* Country Information */}
          <div 
            className="mb-6 p-4 rounded-lg flex items-start"
            style={{ backgroundColor: "rgba(24, 255, 200, 0.1)", border: "1px solid #18ffc8" }}
          >
            <FaGlobe className="mt-1 mr-3" style={{ color: "#18ffc8" }} />
            <div>
              <h3 className="font-bold mb-1" style={{ color: "#18ffc8" }}>Verification for {userCountry}</h3>
              <p className="text-sm" style={{ color: "#efefef" }}>
                Based on your country code {user.countryCode}, we've provided ID options commonly used in {userCountry}.
              </p>
            </div>
          </div>

          {/* Information Alert */}
          <div 
            className="mb-6 p-4 rounded-lg flex items-start"
            style={{ backgroundColor: "rgba(254, 169, 42, 0.1)", border: "1px solid #fea92a" }}
          >
            <FaInfoCircle className="mt-1 mr-3" style={{ color: "#fea92a" }} />
            <div>
              <h3 className="font-bold mb-1" style={{ color: "#fea92a" }}>Important Information</h3>
              <p className="text-sm" style={{ color: "#efefef" }}>
                The name on your ID document must exactly match the name on your account 
                (<span style={{ color: "#f57cff" }}>{user.firstname} {user.lastname}</span>) 
                to avoid rejection. Ensure your document is valid and clearly visible.
              </p>
            </div>
          </div>

          {uploadComplete ? (
            <div className="text-center py-8">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(24, 255, 200, 0.1)" }}
              >
                <FaCheck size={24} style={{ color: "#18ffc8" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#18ffc8" }}>Verification Submitted!</h3>
              <p className="mb-6" style={{ color: "#efefef" }}>
                Your ID documents have been uploaded successfully. Our team will review them and update your verification status within 24-48 hours.
              </p>
              <button
                onClick={onClose}
                className="py-2 px-6 rounded-lg"
                style={{ backgroundColor: "#376553", color: "#efefef" }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* ID Type Selection */}
              <div className="mb-6">
                <label className="block text-sm mb-2 flex items-center" style={{ color: "#f57cff" }}>
                  <FaIdCard className="mr-2" />
                  Select ID Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {idOptions.map(option => (
                    <div
                      key={option.value}
                      className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                        selectedIdType === option.value ? 'border-feay92a' : 'border-gray-600'
                      }`}
                      style={{ 
                        backgroundColor: selectedIdType === option.value ? "#376553" : "#162821",
                        borderColor: selectedIdType === option.value ? "#fea92a" : "#376553"
                      }}
                      onClick={() => setSelectedIdType(option.value)}
                    >
                      <div className="flex items-center">
                        <div 
                          className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                            selectedIdType === option.value ? 'bg-feay92a' : 'border border-gray-500'
                          }`}
                          style={{ 
                            backgroundColor: selectedIdType === option.value ? "#fea92a" : "transparent",
                            borderColor: selectedIdType === option.value ? "#fea92a" : "#376553"
                          }}
                        >
                          {selectedIdType === option.value && <FaCheck size={10} style={{ color: "#09100d" }} />}
                        </div>
                        <span style={{ color: "#efefef" }}>{option.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedIdType && (
                <>
                  {/* ID Front Upload */}
                  <div className="mb-6">
                    <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
                      Upload Front of {selectedOption.label}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="idFront"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'front')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                        className="p-6 rounded-lg border-2 border-dashed text-center"
                        style={{ 
                          backgroundColor: "#162821",
                          borderColor: idFront ? "#18ffc8" : "#376553"
                        }}
                      >
                        {idFront ? (
                          <div>
                            <FaCheck className="mx-auto mb-2" style={{ color: "#18ffc8" }} />
                            <p style={{ color: "#efefef" }}>{idFront.name}</p>
                            <button
                              type="button"
                              onClick={() => removeFile('front')}
                              className="mt-2 text-sm"
                              style={{ color: "#f57cff" }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FaUpload className="mx-auto mb-2" style={{ color: "#fea92a" }} />
                            <p style={{ color: "#efefef" }}>Click to upload front side</p>
                            <p className="text-xs mt-1" style={{ color: "#376553" }}>JPG, PNG or PDF (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ID Back Upload (if required) */}
                  {selectedOption.requiresBack && (
                    <div className="mb-6">
                      <label className="block text-sm mb-2" style={{ color: "#f57cff" }}>
                        Upload Back of {selectedOption.label}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          id="idBack"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'back')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div 
                          className="p-6 rounded-lg border-2 border-dashed text-center"
                          style={{ 
                            backgroundColor: "#162821",
                            borderColor: idBack ? "#18ffc8" : "#376553"
                          }}
                        >
                          {idBack ? (
                            <div>
                              <FaCheck className="mx-auto mb-2" style={{ color: "#18ffc8" }} />
                              <p style={{ color: "#efefef" }}>{idBack.name}</p>
                              <button
                                type="button"
                                onClick={() => removeFile('back')}
                                className="mt-2 text-sm"
                                style={{ color: "#f57cff" }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div>
                              <FaUpload className="mx-auto mb-2" style={{ color: "#fea92a" }} />
                              <p style={{ color: "#efefef" }}>Click to upload back side</p>
                              <p className="text-xs mt-1" style={{ color: "#376553" }}>JPG, PNG or PDF (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: "#efefef" }}>Uploading...</span>
                        <span style={{ color: "#efefef" }}>{uploadProgress}%</span>
                      </div>
                      <div 
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "#162821" }}
                      >
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${uploadProgress}%`,
                            backgroundColor: "#18ffc8"
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#376553" }}>
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2 px-6 rounded-lg"
                      style={{ backgroundColor: "#162821", color: "#efefef", border: "1px solid #376553" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormComplete() || isUploading}
                      className="py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#fea92a", color: "#09100d" }}
                    >
                      <FaUpload size={14} />
                      Submit Verification
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;