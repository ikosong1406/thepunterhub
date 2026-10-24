import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import toast, { Toaster } from "react-hot-toast";

const CreateTipPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token"); // or wherever you store your auth token
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await axios.post(`${Api}/client/getUser`, { token });

        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Sports betting form state
  const [sportsForm, setSportsForm] = useState({
    site: "",
    code: "",
    startTime: "",
    totalOdd: "",
    confidence: 50,
    matches: [],
    sport: "football",
  });

  // Add new match to sports tip
  const addMatch = () => {
    setSportsForm({
      ...sportsForm,
      matches: [...sportsForm.matches, { teams: "", prediction: "", odd: "" }],
    });
  };

  // Remove match from sports tip
  const removeMatch = (index) => {
    const newMatches = [...sportsForm.matches];
    newMatches.splice(index, 1);
    setSportsForm({ ...sportsForm, matches: newMatches });
  };

  // Handle sports match input change
  const handleMatchChange = (index, field, value) => {
    const newMatches = [...sportsForm.matches];
    newMatches[index][field] = value;
    setSportsForm({ ...sportsForm, matches: newMatches });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user.isVerified) {
        toast.error("You must be verified to publish a tip.");
        setIsSubmitting(false);
        return; // Stop the function execution
      }

      let tipData = {};

      // Ensure matches is an array of objects
      const formattedMatches = sportsForm.matches.map((match) => ({
        teams: match.teams,
        prediction: match.prediction,
      }));

      tipData = {
        primaryCategory: sportsForm.sport,
        bettingSite: sportsForm.site,
        bettingCode: sportsForm.code,
        startTime: sportsForm.startTime ? new Date(sportsForm.startTime) : null, // Convert to a Date object
        totalOdd: parseFloat(sportsForm.totalOdd), // Ensure totalOdd is a number
        confidenceLevel: parseInt(sportsForm.confidence, 10), // Ensure confidenceLevel is an integer
        matches: formattedMatches, // Matches field should be an array of objects
      };

      // Submit to backend
      const response = await axios.post(
        `${Api}/client/createTip`,
        tipData,
      );

      setSportsForm({
        site: "",
        code: "",
        startTime: "",
        totalOdd: "",
        confidence: 50,
        matches: [],
        sport: "football",
      });

      // Show success message
      toast.success("Tip published successfully!");
    } catch (error) {
      console.error("Error publishing tip:", error);
      toast.error("Failed to publish tip. Please try again.");
    } finally {
      setIsSubmitting(false); // End the loading state
    }
  };

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#fea92a]">Create New Tip</h1>
        <p className="text-[#efefef]/70 text-sm">
          Share your prediction with subscribers
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Betting Site
              </label>
              <input
                type="text"
                value={sportsForm.site}
                onChange={(e) =>
                  setSportsForm({ ...sportsForm, site: e.target.value })
                }
                className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none text-sm"
                placeholder="Bet9ja, Sportybet, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Booking Code
              </label>
              <input
                type="text"
                value={sportsForm.code}
                onChange={(e) =>
                  setSportsForm({ ...sportsForm, code: e.target.value })
                }
                className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none text-sm"
                placeholder="3HG7D"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={sportsForm.startTime}
                  onChange={(e) =>
                    setSportsForm({
                      ...sportsForm,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none text-sm"
                  required
                />
                <FiClock className="absolute left-3 top-3 text-[#efefef]/50 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Total Odd
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={sportsForm.totalOdd}
                  onChange={(e) =>
                    setSportsForm({ ...sportsForm, totalOdd: e.target.value })
                  }
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none text-sm"
                  placeholder="5.60"
                  required
                />
                <FiTrendingUp className="absolute left-3 top-3 text-[#efefef]/50 text-sm" />
              </div>
            </div>
          </div>

          {/* Sport Selection */}
          <div>
            <label className="block text-sm mb-1 text-[#efefef]/70">
              Sport
            </label>
            <select
              value={sportsForm.sport}
              onChange={(e) =>
                setSportsForm({ ...sportsForm, sport: e.target.value })
              }
              className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none text-sm"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="cricket">Cricket</option>
              <option value="baseball">Baseball</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Confidence Slider */}
          <div>
            <label className="block text-sm mb-1 text-[#efefef]/70">
              Confidence: {sportsForm.confidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={sportsForm.confidence}
              onChange={(e) =>
                setSportsForm({ ...sportsForm, confidence: e.target.value })
              }
              className="w-full h-2 bg-[#376553] rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, #f57cff 0%, #fea92a ${sportsForm.confidence}%, #376553 ${sportsForm.confidence}%, #376553 100%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          {/* Matches */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-[#efefef]/70">
                Matches (Optional)
              </label>
              <button
                type="button"
                onClick={addMatch}
                className="text-sm flex items-center text-[#18ffc8]"
              >
                <FiPlus size={14} className="mr-1" /> Add Match
              </button>
            </div>

            {sportsForm.matches.length > 0 ? (
              <div className="space-y-3">
                {sportsForm.matches.map((match, index) => (
                  <div
                    key={index}
                    className="bg-[#162821]/50 p-3 rounded-lg border border-[#376553]/30"
                  >
                    {/* Match fields remain the same */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeMatch(index)}
                        className="text-[#f57cff] hover:text-[#f57cff]/70"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1 text-[#efefef]/70">
                          Teams/Event
                        </label>
                        <input
                          type="text"
                          value={match.teams}
                          onChange={(e) =>
                            handleMatchChange(index, "teams", e.target.value)
                          }
                          className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none text-sm"
                          placeholder="Chelsea vs Arsenal"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-[#efefef]/70">
                          Prediction
                        </label>
                        <input
                          type="text"
                          value={match.prediction}
                          onChange={(e) =>
                            handleMatchChange(
                              index,
                              "prediction",
                              e.target.value,
                            )
                          }
                          className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none text-sm"
                          placeholder="Over 2.5 Goals"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#efefef]/50 italic">
                No matches added. You can add matches if you want to specify
                individual bets.
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-[#fea92a] to-[#855391] text-[#09100d] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
          disabled={isSubmitting} // Disable the button while submitting
        >
          {isSubmitting
            ? `Publishing Tip...`
            : `Publish Tip`}
        </button>
      </form>
    </div>
  );
};

export default CreateTipPage;
