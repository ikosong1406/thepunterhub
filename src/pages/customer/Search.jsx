import { useState } from "react";
import { FaStar, FaSearch, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../customer/Header";

// Dummy data
const dummyPunters = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    specialty: "Premier League Predictions",
    rating: 4.8,
    wins: 142,
    losses: 28,
    lastSignal: "2 hours ago",
    subscription: "$29.99/month",
    isOnline: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    specialty: "NBA Expert",
    rating: 4.5,
    wins: 98,
    losses: 32,
    lastSignal: "5 hours ago",
    subscription: "$24.99/month",
    isOnline: false,
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    specialty: "Tennis Analyst",
    rating: 4.7,
    wins: 115,
    losses: 25,
    lastSignal: "1 day ago",
    subscription: "$34.99/month",
    isOnline: true,
  },
  {
    id: "4",
    name: "Sarah Williams",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    specialty: "La Liga Specialist",
    rating: 4.3,
    wins: 87,
    losses: 43,
    lastSignal: "3 hours ago",
    subscription: "$19.99/month",
    isOnline: true,
  },
];

const PunterSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredPunters = dummyPunters.filter(
    (punter) =>
      punter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      punter.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePunterClick = (punter) => {
    navigate(`/customer/punters`, { state: { punter } });
  };

  const PunterCard = ({ punter }) => {
    const winRate = (punter.wins / (punter.wins + punter.losses)) * 100;

    return (
      <div
        onClick={() => handlePunterClick(punter)}
        className="bg-gradient-to-br from-[#162821] to-[#0f1f1a] rounded-xl shadow-xl overflow-hidden border border-[#2a3a34] mb-4 cursor-pointer hover:border-[#18ffc8] transition-all duration-200"
      >
        <div className="p-4 flex items-start">
          <div className="relative">
            <img
              src={punter.avatar}
              alt={punter.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#18ffc8]"
            />
            {punter.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1f1a]"></div>
            )}
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-white">{punter.name}</h3>
                <p className="text-sm text-gray-400">{punter.specialty}</p>
              </div>
              <div className="flex items-center bg-[#1e332b] px-2 py-1 rounded-full">
                <FaStar className="text-[#fea92a] mr-1" />
                <span className="text-white">{punter.rating}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-green-400 font-bold">{punter.wins}W</div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-red-400 font-bold">{punter.losses}L</div>
                <div className="text-xs text-gray-400">Losses</div>
              </div>
              <div className="bg-[#0a120e] p-2 rounded">
                <div className="text-[#18ffc8] font-bold">
                  {winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2a3a34] p-3 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-400">Last signal: </span>
            <span className="font-medium text-white">{punter.lastSignal}</span>
          </div>
          <button
            className="bg-[#f57cff] text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-[#e56cef] transition"
            onClick={(e) => {
              e.stopPropagation();
              // Handle subscribe logic here
            }}
          >
            Subscribe {punter.subscription}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-[#09100d] min-h-screen">
        <Header/>
      {/* Search Header */}
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
              ×
            </button>
          )}
        </div>
      </div>
      {/* Search Results */}
      // In your PunterSearchPage component, modify the results section:
      <div>
        {searchTerm ? (
          filteredPunters.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-white mb-4">
                Search Results
              </h2>
              {filteredPunters.map((punter) => (
                <PunterCard key={punter.id} punter={punter} />
              ))}
            </>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-4">
                <FaSearch className="mx-auto text-4xl" />
              </div>
              <h3 className="text-lg font-medium text-white">
                No punters found
              </h3>
              <p className="text-gray-400 mt-1">
                No results for "{searchTerm}"
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-4">
              <FaSearch className="mx-auto text-4xl" />
            </div>
            <h3 className="text-lg font-medium text-white">
              Search for punters
            </h3>
            <p className="text-gray-400 mt-1">
              Type a name or specialty to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PunterSearchPage;
