import React, { useState, useEffect, useRef, memo } from "react";
import {
  FaFootballBall,
  FaBasketballBall,
  FaChartLine,
  FaBitcoin,
  FaDollarSign,
  FaBaseballBall,
  FaRegNewspaper,
  FaChartBar,
  FaChessKnight,
} from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import {
  GiTennisBall,
  GiCricketBat,
  GiMetalDisc,
} from "react-icons/gi";
// import { TbStock } from "react-icons/tb";
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
      className="relative w-full min-h-[700px] overflow-hidden"
    ></div>
  );
});

// TradingView Widget component
const TradingViewWidget = memo(({ activeCategory }) => {
  const container = useRef(null);
  const tradingViewScriptRef = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    const script = createScript(
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
      "tradingview-market-overview-script"
    );

    let pairs;
    let title;

    switch (activeCategory) {
      case "forex":
        pairs = [
          { s: "FX:EURUSD", d: "EUR/USD" },
          { s: "FX:GBPUSD", d: "GBP/USD" },
          { s: "FX:USDJPY", d: "USD/JPY" },
          { s: "FX:USDCAD", d: "USD/CAD" },
          { s: "FX:AUDUSD", d: "AUD/USD" },
          { s: "OANDA:NZDUSD", d: "NZD/USD" },
          { s: "FX:USDCHF", d: "USD/CHF" },
          { s: "FX:EURJPY", d: "EUR/JPY" },
          { s: "FX:EURGBP", d: "EUR/GBP" },
          { s: "FX:GBPJPY", d: "GBP/JPY" },
        ];
        title = "Forex";
        break;
      case "crypto":
        pairs = [
          { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
          { s: "BINANCE:ETHUSDT", d: "Ethereum" },
          { s: "BINANCE:BNBUSDT", d: "Binance Coin" },
          { s: "BINANCE:SOLUSDT", d: "Solana" },
          { s: "BINANCE:XRPUSDT", d: "XRP" },
          { s: "BINANCE:ADAUSDT", d: "Cardano" },
          { s: "BINANCE:DOGEUSDT", d: "Dogecoin" },
          { s: "BINANCE:AVAXUSDT", d: "Avalanche" },
          { s: "BINANCE:DOTUSDT", d: "Polkadot" },
          { s: "BINANCE:LTCUSDT", d: "Litecoin" },
        ];
        title = "Crypto";
        break;
      case "commodities":
        pairs = [
          { s: "NYMEX:CL1!", d: "Crude Oil" },
          { s: "TVC:GOLD", d: "Gold" },
          { s: "TVC:SILVER", d: "Silver" },
          { s: "NYMEX:NG1!", d: "Natural Gas" },
          { s: "COMEX:GC1!", d: "Gold Futures" },
          { s: "CBOT:ZC1!", d: "Corn Futures" },
        ];
        title = "Commodities";
        break;
      case "indices":
        pairs = [
          { s: "NASDAQ:NDAQ", d: "Nasdaq" },
          { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
          { s: "FOREXCOM:UKXGBP", d: "UK 100" },
          { s: "INDEX:DEU40", d: "DAX" },
          { s: "NSE:NIFTY", d: "Nifty 50" },
          { s: "FOREXCOM:DJI", d: "Dow 30" },
        ];
        title = "Indices";
        break;
      case "stocks":
        // For stocks, we can't use the simple "Market Overview" widget.
        // It's better to use a dedicated stock screener or a message.
        container.current.innerHTML = `<div class="text-center py-8 text-gray-400">
          Stock data will be displayed here using a dedicated widget in a future update.
        </div>`;
        return;
      default:
        container.current.innerHTML = `<div class="text-center py-8 text-gray-400">
          Select a trading category above to view live market data.
        </div>`;
        return;
    }

    container.current.innerHTML = "";
    script.innerHTML = `
      {
        "colorTheme": "dark",
        "dateRange": "12M",
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showFloatingTooltip": false,
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(240, 243, 250, 0)",
        "scaleFontColor": "#DBDBDB",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
          {
            "title": "${title}",
            "symbols": ${JSON.stringify(pairs)},
            "originalTitle": "${title}"
          }
        ],
        "support_host": "https://www.tradingview.com",
        "backgroundColor": "#0f0f0f",
        "width": "100%",
        "height": "550",
        "showSymbolLogo": true,
        "showChart": true
      }`;

    container.current.appendChild(script);

    return () => {
      if (container.current && container.current.contains(script)) {
        container.current.removeChild(script);
      }
    };
  }, [activeCategory]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "550px", width: "100%" }}
    >
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Market data by TradingView</span>
        </a>
      </div>
    </div>
  );
});

// Primary Categories, Sport Subcategories, Trading Subcategories
const primaryCategories = [
  { name: "Sports", key: "sports", icon: <FaFootballBall /> },
  { name: "Trading", key: "trading", icon: <FaChartLine /> },
];

const sportCategories = [
  { name: "Football", icon: <IoMdFootball size={20} />, key: "football" },
  // {
  //   name: "Basketball",
  //   icon: <FaBasketballBall size={18} />,
  //   key: "basketball",
  // },
  // { name: "Tennis", icon: <GiTennisBall size={18} />, key: "tennis" },
  // { name: "Baseball", icon: <FaBaseballBall size={18} />, key: "baseball" },
];

const tradingCategories = [
  { name: "Forex", icon: <FaDollarSign size={18} />, key: "forex" },
  { name: "Crypto", icon: <FaBitcoin size={18} />, key: "crypto" },
  { name: "Commodities", icon: <GiMetalDisc size={18} />, key: "commodities" },
  { name: "Indices", icon: <FaChartBar size={18} />, key: "indices" },
  // { name: "Stocks", icon: <TbStock size={18} />, key: "stocks" },
];

const LivePage = () => {
  const [activePrimary, setActivePrimary] = useState("sports");
  const [activeSport, setActiveSport] = useState("football");
  const [activeTrading, setActiveTrading] = useState("forex");

  return (
    <div className="bg-[#0a120e] text-white px-4 py-6 pb-20 min-h-screen">
      <Header />
      {/* Primary Category Selection */}
      <div className="flex border-b border-[#2a3a34] mb-4">
        {primaryCategories.map((category) => (
          <button
            key={category.key}
            onClick={() => {
              setActivePrimary(category.key);
            }}
            className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 text-sm ${
              activePrimary === category.key
                ? "text-[#18ffc8] border-b-2 border-[#18ffc8]"
                : "text-gray-400"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>
      {/* Secondary Category Selection */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
        {activePrimary === "sports"
          ? sportCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveSport(category.key)}
                className={`flex flex-col items-center min-w-[70px] px-3 py-2 rounded-xl text-sm ${
                  activeSport === category.key
                    ? "bg-[#855391] text-white shadow-lg"
                    : "bg-[#162821] text-white"
                }`}
              >
                {category.icon}
                <span className="text-xs mt-1">{category.name}</span>
              </button>
            ))
          : tradingCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveTrading(category.key)}
                className={`flex flex-col items-center min-w-[70px] px-3 py-2 rounded-xl ${
                  activeTrading === category.key
                    ? "bg-[#855391] text-white shadow-lg"
                    : "bg-[#162821] text-white"
                }`}
              >
                {category.icon}
                <span className="text-xs mt-1">{category.name}</span>
              </button>
            ))}
      </div>
      {/* Live Content */}
      <div className="space-y-4">
        {activePrimary === "sports" ? (
          <LiveSportsWidget key={activeSport} activeSport={activeSport} />
        ) : (
          <TradingViewWidget
            key={activeTrading}
            activeCategory={activeTrading}
          />
        )}
      </div>
    </div>
  );
};

export default LivePage;