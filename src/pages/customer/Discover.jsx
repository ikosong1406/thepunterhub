import React from "react";
import { FaStar, FaCrown } from "react-icons/fa";

const punters = [
  {
    id: 1,
    name: "BetKing Master",
    image: "/assets/punters/1.jpg",
    stats: "W: 150 | L: 30 | D: 10",
    rating: 4.8,
    price: "$15/mo",
  },
  {
    id: 2,
    name: "Odds Oracle",
    image: "/assets/punters/2.jpg",
    stats: "W: 120 | L: 50 | D: 5",
    rating: 4.4,
    price: "$10/mo",
  },
  {
    id: 3,
    name: "Goal Prophet",
    image: "/assets/punters/3.jpg",
    stats: "W: 98 | L: 20 | D: 15",
    rating: 4.6,
    price: "$12/mo",
  },
];

const DiscoverScreen = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Top Punters</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {punters.map((punter) => (
          <div
            key={punter.id}
            className="bg-[#131b17] rounded-2xl p-4 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={punter.image}
                alt={punter.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#18ffc8]"
              />
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {punter.name} <FaCrown className="text-yellow-400" />
                </h3>
                <p className="text-sm text-gray-400">{punter.stats}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-yellow-400">
                <FaStar />
                <span className="text-sm font-medium">{punter.rating}</span>
              </div>
              <span className="bg-[#18ffc8] text-black text-sm font-semibold px-4 py-1 rounded-full">
                {punter.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverScreen;
