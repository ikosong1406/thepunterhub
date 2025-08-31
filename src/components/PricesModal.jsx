import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaPlus, FaCheck, FaDollarSign } from 'react-icons/fa';
import Api from "./Api";

const PricingPlansModal = ({ onClose, user }) => {
  const [selectedPlan, setSelectedPlan] = useState("silver");
  const [plans, setPlans] = useState({
    silver: { price: '', offers: [''] },
    gold: { price: '', offers: [''] },
    diamond: { price: '', offers: [''] }
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Use useEffect to populate the state with user's existing pricing data
  useEffect(() => {
    // Check if the user object and its pricingPlans property exist
    if (user && user.pricingPlans) {
      const userPricingPlans = user.pricingPlans;
      
      // If the pricingPlans object is not empty, use it to set the state
      if (Object.keys(userPricingPlans).length > 0) {
        setPlans(userPricingPlans);
      }
    }
  }, [user]); // The effect re-runs if the 'user' prop changes

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    setPlans(prev => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        price: value
      }
    }));
  };

  const handleOfferChange = (index, value) => {
    setPlans(prev => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        offers: prev[selectedPlan].offers.map((offer, i) => 
          i === index ? value : offer
        )
      }
    }));
  };

  const addOfferField = () => {
    setPlans(prev => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        offers: [...prev[selectedPlan].offers, '']
      }
    }));
  };

  const removeOfferField = (index) => {
    if (plans[selectedPlan].offers.length <= 1) return;
    
    setPlans(prev => ({
      ...prev,
      [selectedPlan]: {
        ...prev[selectedPlan],
        offers: prev[selectedPlan].offers.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedPlan || !plans[selectedPlan].price) {
      setError("Please set a price for the selected plan.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = {
        userId: user._id,
        plans
      };
      
      const response = await axios.post(`${Api}/client/pricing`, data);
      
      console.log('Plans saved:', response.data);
      setSuccess('Pricing plans saved successfully!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving plans:', err.response?.data || err.message);
      setError("Failed to save pricing plans. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const planColors = {
    silver: { bg: "#c0c0c0", text: "#09100d" },
    gold: { bg: "#ffd700", text: "#09100d" },
    diamond: { bg: "#b9f2ff", text: "#09100d" }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <div className="min-h-screen flex flex-col">
        <div 
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <h2 
            className="text-xl font-bold"
            style={{ color: "#efefef" }}
          >
            Set Categories Plans
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <FaTimes size={20} />
          </button>
        </div>

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

          <div className="grid grid-cols-3 gap-4 mb-8">
            {['silver', 'gold', 'diamond'].map((plan) => (
              <button
                key={plan}
                onClick={() => handlePlanSelect(plan)}
                className={`py-4 rounded-lg font-bold text-center transition-all border-2 ${
                  selectedPlan === plan ? 'scale-105' : 'opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: selectedPlan === plan ? planColors[plan].bg : "#162821",
                  color: selectedPlan === plan ? planColors[plan].text : "#efefef",
                  borderColor: selectedPlan === plan ? planColors[plan].bg : "#376553"
                }}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>

          {selectedPlan && (
            <div className="mb-6">
              <div className="mb-6">
                <label 
                  className="block text-sm mb-2 flex items-center"
                  style={{ color: "#f57cff" }}
                >
                  <span className="mr-2"><FaDollarSign /></span>
                  Price for {selectedPlan} plan / week
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={plans[selectedPlan].price}
                    onChange={handlePriceChange}
                    className="w-full pl-10 p-3 rounded-lg"
                    style={{ backgroundColor: "#162821", color: "#efefef", border: "1px solid #376553" }}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span 
                    className="absolute left-3 top-3"
                    style={{ color: "#efefef" }}
                  >
                    $
                  </span>
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm mb-2 flex items-center"
                  style={{ color: "#f57cff" }}
                >
                  <span className="mr-2"><FaCheck /></span>
                  Offers included ({plans[selectedPlan].offers.length})
                </label>
                <div className="space-y-3 mb-4">
                  {plans[selectedPlan].offers.map((offer, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div 
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-3 cursor-pointer"
                        style={{ backgroundColor: "#376553", color: "#efefef" }}
                        onClick={() => removeOfferField(index)}
                      >
                        {index + 1}
                      </div>
                      <textarea
                        value={offer}
                        onChange={(e) => handleOfferChange(index, e.target.value)}
                        className="w-full p-3 rounded-lg resize-none"
                        style={{ backgroundColor: "#162821", color: "#efefef", border: "1px solid #376553" }}
                        placeholder={`Describe offer ${index + 1}`}
                        rows="2"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addOfferField}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg w-full mb-6"
                  style={{ backgroundColor: "#376553", color: "#efefef" }}
                >
                  <FaPlus size={14} />
                  Add Another Offer
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#376553" }}>
            <button
              onClick={onClose}
              className="py-2 px-6 rounded-lg"
              style={{ backgroundColor: "#162821", color: "#efefef", border: "1px solid #376553" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPlan || saving}
              className="py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FaCheck size={14} />
                  Save Plans
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlansModal;