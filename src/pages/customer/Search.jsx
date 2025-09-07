import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../customer/Header";
import Api from "../../components/Api";

const PunterSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allPunters, setAllPunters] = useState([]);
  const [filteredPunters, setFilteredPunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch all punters on component mount
  useEffect(() => {
    const fetchAllPunters = async () => {
      try {
        const response = await axios.get(`${Api}/client/getPunters`);
        // Ensure the response data is an array before setting state
        if (Array.isArray(response.data.data)) {
          setAllPunters(response.data.data);
          // Do NOT set filteredPunters here. It should start empty.
        } else {
          console.error("API response is not an array:", response.data);
          setError("Received invalid data from the server.");
          setAllPunters([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching all punters:", err);
        setError("Failed to fetch punters. Please try again later.");
        setLoading(false);
      }
    };
    fetchAllPunters();
  }, []);

  // Filter punters based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPunters([]); // Clear results when search term is empty
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const results = allPunters.filter(
        (punter) =>
          punter.username?.toLowerCase().includes(lowercasedSearchTerm) ||
          punter.primaryCategory
            ?.toLowerCase()
            .includes(lowercasedSearchTerm) ||
          punter.secondaryCategory?.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredPunters(results);
    }
  }, [searchTerm, allPunters]);

  const handlePunterClick = (punterId) => {
    navigate(`/customer/punters`, { state: { punterId: punterId } });
  };

  const getInitials = (username) => {
    const fInitial = username ? username.charAt(0) : "";
    return `${fInitial}`.toUpperCase();
  };

  const PunterCard = ({ punter }) => {
    return (
      <div
        onClick={() => handlePunterClick(punter._id)}
        className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-4 cursor-pointer hover:border-[#18ffc8] transition-all duration-200"
      >
        <div className="p-4 flex items-start">
          <div className="relative mr-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#18ffc8]/20 text-[#18ffc8] text-xl font-bold border-2 border-[#18ffc8]">
              {getInitials(punter.username)}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center">
                  {`${punter.username}`}
                  {punter.isVerified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 ml-2 text-blue-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.69a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  {punter.primaryCategory} - {punter.secondaryCategory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-10 text-gray-400">
          Loading punters...
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-10 text-red-400">{error}</div>;
    }

    // New logic: Check if a search has been performed
    const hasSearched = searchTerm.trim() !== "";
    const hasResults = filteredPunters.length > 0;

    if (hasSearched && !hasResults) {
      return (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-4">
            <FaSearch className="mx-auto text-4xl" />
          </div>
          <h3 className="text-lg font-medium text-white">No punters found</h3>
          <p className="text-gray-400 mt-1">No results for "{searchTerm}"</p>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-4">
            <FaSearch className="mx-auto text-4xl" />
          </div>
          <h3 className="text-lg font-medium text-white">
            Search for punters by name or specialty.
          </h3>
        </div>
      );
    }

    return filteredPunters.map((punter) => (
      <PunterCard key={punter._id} punter={punter} />
    ));
  };

  return (
    <div className="p-4 bg-[#09100d] min-h-screen text-white">
      <Header />
      <div className="mb-6 sticky top-0 bg-[#09100d] pt-4 pb-2 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search punters by name or specialty..."
            className="w-full pl-10 pr-4 py-3 bg-[#162821] border border-[#2a3a34] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#18ffc8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

export default PunterSearchPage;
