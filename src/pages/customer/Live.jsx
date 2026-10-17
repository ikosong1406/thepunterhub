import React, { useState, useEffect, useRef, memo } from "react";
import {
  FaFootballBall,
  FaBasketballBall,
  FaChartLine,
  FaBitcoin,
  FaDollarSign,
  FaBaseballBall,
  FaChartBar,
} from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import {
  GiTennisBall,
  GiMetalDisc,
} from "react-icons/gi";
import Header from "./Header";

// Helper function to create a script element
const createScript = (src, id) => {
  const script = document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  script.async = true;
  script.id = id;
  return script;
};

// LiveSportsWidget component (now only for football as per API limitations)
const LiveSportsWidget = memo(({ activeSport }) => {
  const container = useRef(null);
  const scriptRef = useRef(null);
  const widgetLoaded = useRef(false);

  useEffect(() => {
    // Only load the script once when the component mounts
    if (scriptRef.current) return;

    const script = createScript(
      "https://ls.soccersapi.com/widget/res/wo_w9751_689c608d09691/widget.js",
      "soccersapi-widget-script"
    );

    const handleScriptLoad = () => {
      widgetLoaded.current = true;
    };

    script.addEventListener("load", handleScriptLoad);
    document.body.appendChild(script);
    scriptRef.current = script;

    // Cleanup function
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
        script.removeEventListener("load", handleScriptLoad);
        scriptRef.current = null;
        widgetLoaded.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    // The soccersapi widget is hardcoded for football
    if (activeSport !== "football") {
      container.current.innerHTML = `<div class="text-center py-8 text-gray-400">
        Live scores for this sport aren't available at the moment.
      </div>`;
      return;
    }

    const widgetDiv = document.createElement("div");
    widgetDiv.id = "ls-widget";
    widgetDiv.className = "livescore-widget";
    widgetDiv.setAttribute("data-w", "wo_w9751_689c608d09691");
    widgetDiv.setAttribute("data-height", "1200");
    container.current.appendChild(widgetDiv);
  }, [activeSport]);

  return (
    <div
      ref={container}
      className="relative w-full overflow-hidden"
    ></div>
  );
});


const LivePage = () => {
  const [activeSport, setActiveSport] = useState("football");

  return (
    <div className="bg-[#0a120e] text-white px-4 py-4 pb-20 min-h-screen">
      <Header />
      {/* Live Content */}
      <div className="space-y-4 mt-5">
          <LiveSportsWidget key={activeSport} activeSport={activeSport} />
      </div>
    </div>
  );
};

export default LivePage;