import React, { useState, useEffect } from "react";
import logoImage from "../../assets/logo3.png";

const Header = () => {
  return (
    <header className="w-full py-3 flex items-center shadow-md">
      <img src={logoImage} alt="Platform Logo" className="max-w-8" />
      <h2 className="text-lg font-bold text-white ml-1">TodayPrediction365</h2>
    </header>
  );
};

export default Header;
