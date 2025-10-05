import { Outlet, NavLink } from "react-router-dom";
import { FaUser, FaSearch, FaFire } from "react-icons/fa";
import { MdTipsAndUpdates } from "react-icons/md";
import { PiBroadcastFill } from "react-icons/pi";
import { IoChatbubblesSharp } from "react-icons/io5";
import { IoAlarm } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function CustomerLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabs = [
    { path: "/customer/home", name: "Top", icon: <FaFire size={20} /> },
    {
      path: "/customer/feed",
      name: "Tips",
      icon: <MdTipsAndUpdates size={20} />,
    },
    // {
    //   path: "/customer/daily",
    //   name: "Daily",
    //   icon: <IoAlarm size={20} />,
    // },
    {
      path: "/customer/chat",
      name: "Chat",
      icon: <IoChatbubblesSharp size={20} />,
    },
    {
      path: "/customer/live",
      name: "Live",
      icon: <PiBroadcastFill size={20} />,
    },
    {
      path: "/customer/profile",
      name: "Profile",
      icon: <FaUser size={20} />,
    },
  ];

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <div className="w-64 bg-[#09100d] shadow-lg flex-shrink-0">
          <div className="p-4 h-full flex flex-col">
            {/* <div className="flex items-center justify-center mb-6 mt-10">
              <img src={logo} alt="Logo" className="w-20 h-20" />
            </div> */}

            <nav className="flex-1 space-y-1 mt-8">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-2 px-4 w-full ${
                      isActive ? "text-[#18ffc8]" : "text-[#efefef]"
                    }`
                  }
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </div>
      </div>
    );
  }

  // Mobile Bottom Navigation
  return (
    <div className="flex flex-col h-screen w-full ">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full pb-13">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#09100d] shadow-lg border-t border-gray-200">
        <nav className="flex justify-around items-center">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-4 w-full ${
                  isActive ? "text-[#18ffc8]" : "text-[#efefef]"
                }`
              }
            >
              <span className="mb-1">{tab.icon}</span>
              <span className="text-xs">{tab.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
