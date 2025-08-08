import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ platformName = "Punter Hub", switchTo = "/Customer/home" }) => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#09100d] py-3 flex items-center justify-between shadow-md">
      {/* Logo / Platform Name */}
      <h1 className="text-[#fea92a] text-xl font-bold tracking-widest uppercase">
        {platformName}
      </h1>

      {/* Switch Button */}
      <button
        onClick={() => navigate(switchTo)}
        className="bg-[#18ffc8] text-black font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
      >
        Switch
      </button>
    </header>
  );
};

export default Header;
