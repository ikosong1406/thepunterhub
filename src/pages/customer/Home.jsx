
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import localforage from "localforage";
import {
  FaFootballBall,
  FaBasketballBall,
  FaChartLine,
  FaCrown,
  FaArrowRight,
  FaLock,
  FaRegClock,
  FaRegCalendarAlt,
  FaSyncAlt,
  FaTrophy,
  FaCheckCircle,
  FaChevronRight,
} from "react-icons/fa";

import Api from "../../components/Api";
import Header from "./Header";

const FOOTBALL_API_URL =
  "https://v3.football.api-sports.io";

const FOOTBALL_API_KEY = "032a3c0e9a2048207e504142a1f28774";
const FIXTURES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const FIXTURES_CACHE_PREFIX = "footballFixtures";

const PANEL = "rounded-2xl border border-[#2a3a34] bg-[#0f1f1a]";
const MUTED = "text-gray-400";

const SPORTS_OPTIONS = [
  { id: "all", label: "All Sports", icon: FaTrophy },
  { id: "football", label: "Football", icon: FaFootballBall },
  { id: "nba", label: "NBA", icon: FaBasketballBall },
];

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  }).format(date);

// Get the visitor's local date as YYYY-MM-DD
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Format a fixture kickoff time in the visitor's local timezone
const formatKickoff = (fixture) => {
  const timestamp = Number(fixture.timestamp);

  if (!timestamp) return "Time unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));
};

const normalizeFixture = (item) => {
  const fixture = item.fixture || {};
  const league = item.league || {};
  const teams = item.teams || {};
  const goals = item.goals || {};
  const status = fixture.status || {};

  return {
    id: fixture.id,
    sport: "football",
    league: league.name || "Football",
    home: teams.home?.name || "Home team",
    away: teams.away?.name || "Away team",
    homeBadge: teams.home?.logo || "",
    awayBadge: teams.away?.logo || "",
    date: fixture.date
      ? formatDate(new Date(fixture.date))
      : "Date TBA",
    time: formatKickoff(fixture),
    timestamp: fixture.timestamp
      ? fixture.timestamp * 1000
      : "",
    status: status.long || status.short || "",
    statusShort: status.short || "",
    elapsed: status.elapsed ?? null,
    homeScore: goals.home,
    awayScore: goals.away,
    country: league.country || "",
    venue: fixture.venue?.name || "",
  };
};


const isPremiumMember = (user) => {
  const plan = String(
    user?.membership?.plan ??
      user?.subscription?.plan ??
      user?.membershipPlan ??
      user?.plan ??
      "free"
  )
    .trim()
    .toLowerCase();

  const active =
    user?.membership?.isActive ??
    user?.subscription?.isActive ??
    user?.membershipActive ??
    true;

  return plan === "premium" && active === true;
};

const getDisplayName = (user) =>
  user?.firstName ||
  user?.firstname ||
  user?.name ||
  user?.username ||
  user?.fullName ||
  "there";

const getPredictionId = (prediction, index) =>
  prediction?._id ||
  prediction?.id ||
  prediction?.predictionId ||
  `prediction-${index}`;

const getPredictionTitle = (prediction) =>
  prediction?.title ||
  prediction?.match ||
  prediction?.fixture ||
  prediction?.event ||
  "Match analysis";

const getPredictionDescription = (prediction) =>
  prediction?.description ||
  prediction?.analysis ||
  prediction?.tip ||
  prediction?.prediction ||
  "Open this prediction to view the full analysis.";

const getPredictionIsPremium = (prediction) =>
  prediction?.isPremium === true ||
  prediction?.premium === true ||
  String(
    prediction?.accessLevel || prediction?.plan || ""
  ).toLowerCase() === "premium";

const getPredictionDate = (prediction) => {
  const value =
    prediction?.publishedAt ||
    prediction?.createdAt ||
    prediction?.date;

  if (!value) return "Recently published";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Recently published"
    : formatDate(date);
};

function TeamBadge({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2a3a34] bg-[#162821] text-xs font-bold text-[#18ffc8]">
        {(name || "?").slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} badge`}
      className="h-9 w-9 shrink-0 object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function FixtureCard({ fixture }) {
  const hasScore =
    fixture.homeScore !== null &&
    fixture.homeScore !== undefined &&
    fixture.awayScore !== null &&
    fixture.awayScore !== undefined &&
    fixture.homeScore !== "" &&
    fixture.awayScore !== "";

  const isFinished =
    /finished|ft|full.?time|match.?over/i.test(fixture.status);

  return (
    <article className="w-[280px] shrink-0 rounded-2xl border border-[#2a3a34] bg-[#0f1f1a] p-4 transition duration-200 hover:border-[#18ffc8]/50 hover:bg-[#132820] sm:w-[310px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="max-w-[190px] truncate rounded-full bg-[#162821] px-3 py-1 text-xs text-gray-300">
          {fixture.league}
        </span>

        <span className="flex shrink-0 items-center gap-1 text-xs text-[#18ffc8]">
          {hasScore ? (
            <FaChartLine />
          ) : (
            <FaRegClock />
          )}
          {fixture.statusShort === "LIVE" ||
            fixture.statusShort === "1H" ||
            fixture.statusShort === "2H" ||
            fixture.statusShort === "HT"
          ? `${fixture.statusShort}${
              fixture.elapsed != null ? ` ${fixture.elapsed}'` : ""
            }`
          : hasScore
          ? isFinished
          ? "FT"
          : fixture.statusShort || "Score"
          : fixture.time}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <TeamBadge src={fixture.homeBadge} name={fixture.home} />
          <span className="line-clamp-2 min-h-8 text-sm font-semibold text-white">
            {fixture.home}
          </span>
        </div>

        <div className="flex min-w-[52px] flex-col items-center gap-1">
          {hasScore ? (
            <span className="text-lg font-extrabold text-white">
              {fixture.homeScore} - {fixture.awayScore}
            </span>
          ) : (
            <span className="text-xs font-bold text-gray-500">VS</span>
          )}

          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            {fixture.sport === "nba" ? "Basketball" : "Football"}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <TeamBadge src={fixture.awayBadge} name={fixture.away} />
          <span className="line-clamp-2 min-h-8 text-sm font-semibold text-white">
            {fixture.away}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-[#2a3a34] pt-3 text-center text-xs text-gray-400">
        <FaRegCalendarAlt className="mr-1 inline" />
        {fixture.date || "Date TBA"}
        {!hasScore && fixture.time !== "Time TBA" && (
          <span> · {fixture.time}</span>
        )}
      </div>
    </article>
  );
}

function FixtureMarquee({ fixtures, loading, onRefresh }) {
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Use the browser's Web Animations API so the marquee needs no CSS file
  // and no custom Tailwind keyframes.
  useEffect(() => {
    const track = trackRef.current;

    if (!track || fixtures.length === 0) return undefined;

    animationRef.current?.cancel();

    const halfWidth = track.scrollWidth / 2;

    if (halfWidth <= 0) return undefined;

    const animation = track.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${halfWidth}px)` },
      ],
      {
        duration: Math.max(30000, fixtures.length * 4500),
        iterations: Infinity,
        easing: "linear",
      }
    );

    animationRef.current = animation;
    animation.playbackRate = 1;

    if (paused) animation.pause();

    return () => {
      animation.cancel();
    };
  }, [fixtures, paused]);

  const handleMouseEnter = () => {
    setPaused(true);
    animationRef.current?.pause();
  };

  const handleMouseLeave = () => {
    setPaused(false);
    animationRef.current?.play();
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden py-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-44 w-[280px] shrink-0 animate-pulse rounded-2xl border border-[#2a3a34] bg-[#0f1f1a] sm:w-[310px]"
          />
        ))}
      </div>
    );
  }

  if (!fixtures.length) {
    return (
      <div className={`${PANEL} p-8 text-center`}>
        <FaRegCalendarAlt className="mx-auto mb-3 text-2xl text-gray-500" />
        <p className="font-semibold text-white">
          No fixtures found for today
        </p>
        <p className={`mt-1 text-sm ${MUTED}`}>
          The free sports feed may not list every league or match.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#2a3a34] px-4 py-2 text-sm text-[#18ffc8] transition hover:bg-[#162821]"
        >
          <FaSyncAlt /> Try again
        </button>
      </div>
    );
  }

  // Duplicate the list so the animation can loop without an empty gap.
  const loopFixtures = [...fixtures, ...fixtures];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleMouseEnter}
      onBlurCapture={handleMouseLeave}
    >
      <div
        ref={trackRef}
        className="flex w-max gap-4 py-2"
        style={{ willChange: "transform" }}
      >
        {loopFixtures.map((fixture, index) => (
          <FixtureCard
            key={`${fixture.id}-${index}`}
            fixture={fixture}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#18ffc8]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {title}
        </h2>
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-2 text-sm text-[#18ffc8] transition hover:text-white"
        >
          {action} <FaChevronRight className="text-xs" />
        </button>
      )}
    </div>
  );
}

function PredictionCard({ prediction, index, premiumMember, onOpen }) {
  const premium = getPredictionIsPremium(prediction);
  const locked = premium && !premiumMember;

  return (
    <article className={`${PANEL} flex h-full flex-col p-4 transition hover:border-[#18ffc8]/40`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
            premium
              ? "bg-fuchsia-500/10 text-[#f57cff]"
              : "bg-[#18ffc8]/10 text-[#18ffc8]"
          }`}
        >
          {premium ? "PREMIUM" : "FREE ANALYSIS"}
        </span>

        <span className="text-xs text-gray-500">
          {getPredictionDate(prediction)}
        </span>
      </div>

      <h3 className="mb-2 line-clamp-2 font-bold text-white">
        {getPredictionTitle(prediction)}
      </h3>

      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-gray-400">
        {getPredictionDescription(prediction)}
      </p>

      <button
        type="button"
        onClick={() => onOpen(prediction, locked)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
          locked
            ? "border border-[#f57cff]/30 bg-[#f57cff]/10 text-[#f57cff] hover:bg-[#f57cff]/20"
            : "bg-[#162821] text-[#18ffc8] hover:bg-[#20382e]"
        }`}
      >
        {locked ? <FaLock /> : <FaArrowRight />}
        {locked ? "Unlock Analysis" : "View Analysis"}
      </button>
    </article>
  );
}


export default function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [analysts, setAnalysts] = useState([]);

  const [selectedSport, setSelectedSport] = useState("all");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingAnalysts, setLoadingAnalysts] = useState(true);

  const premiumMember = useMemo(
    () => isPremiumMember(user),
    [user]
  );

  const fetchUser = useCallback(async () => {
    setLoadingUser(true);

    try {
      const token = await localforage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await Api.post("/client/getUser", { token });

      const result =
        response?.data?.user ||
        response?.data?.data ||
        response?.data;

      setUser(result || null);
    } catch (error) {
      console.error("Unable to load user:", error);
      toast.error("Could not load your account information.");
    } finally {
      setLoadingUser(false);
    }
  }, []);



const fetchFixtures = useCallback(async () => {
  setLoadingFixtures(true);

  const date = getLocalDate();
  const cacheKey = `${FIXTURES_CACHE_PREFIX}:${date}`;

  let cachedFixtures = null;

  try {
    // 1. Check localforage before making an API request
    cachedFixtures = await localforage.getItem(cacheKey);

    const cacheIsValid =
      cachedFixtures?.savedAt &&
      Date.now() - cachedFixtures.savedAt <
        FIXTURES_CACHE_DURATION &&
      Array.isArray(cachedFixtures.fixtures);

    if (cacheIsValid) {
      console.log("Loading fixtures from local cache:", date);
      setFixtures(cachedFixtures.fixtures);
      return;
    }

    // 2. If the cache is expired or missing, call API-Football
    if (!FOOTBALL_API_KEY) {
      throw new Error(
        "Missing VITE_API_FOOTBALL_KEY in your .env file."
      );
    }

    console.log("Fetching fixtures from API-Football:", date);

    const response = await axios.get(
      `${FOOTBALL_API_URL}/fixtures`,
      {
        params: {
          date,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        headers: {
          "x-apisports-key": FOOTBALL_API_KEY,
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    // API-Football can return API errors in the response body
    if (
      data.errors &&
      Object.keys(data.errors).length > 0
    ) {
      console.error("API-Football errors:", data.errors);
      throw new Error(
        "API-Football rejected the fixtures request."
      );
    }

    const events = Array.isArray(data.response)
      ? data.response
      : [];

    // 3. Normalize and sort fixtures before saving them
    const normalized = events
      .map(normalizeFixture)
      .sort((a, b) => {
        const timeA = Number(a.timestamp) || 0;
        const timeB = Number(b.timestamp) || 0;

        return timeA - timeB;
      });

    // 4. Save fixtures locally with their cache timestamp
    await localforage.setItem(cacheKey, {
      savedAt: Date.now(),
      fixtures: normalized,
    });

    setFixtures(normalized);

    console.log(
      `Saved ${normalized.length} fixtures to localforage.`
    );
  } catch (error) {
    console.error(
      "Unable to load fixtures:",
      error.response?.data || error.message || error
    );

    // 5. If the request fails, use expired cached data if available
    if (Array.isArray(cachedFixtures?.fixtures)) {
      setFixtures(cachedFixtures.fixtures);

      toast.error(
        "Could not refresh fixtures. Showing saved fixtures instead."
      );
    } else {
      setFixtures([]);

      toast.error(
        error.response?.status === 401 ||
          error.response?.status === 403
          ? "API key invalid or access denied. Check your API-Football account."
          : "Could not load fixtures. Check your connection and API key."
      );
    }
  } finally {
    setLoadingFixtures(false);
  }
}, []);



  const fetchPredictions = useCallback(async () => {
    setLoadingPredictions(true);

    try {
      // Change this endpoint if your backend uses a different route.
      const response = await Api.get("/client/recentPredictions");

      const result =
        response?.data?.predictions ||
        response?.data?.data ||
        response?.data;

      setPredictions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load predictions:", error);
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  const fetchAnalysts = useCallback(async () => {
    setLoadingAnalysts(true);

    try {
      const response = await Api.get("/client/getPunters");

      const result =
        response?.data?.punters ||
        response?.data?.analysts ||
        response?.data?.data ||
        response?.data;

      setAnalysts(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load analysts:", error);
      setAnalysts([]);
    } finally {
      setLoadingAnalysts(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchFixtures();
    fetchPredictions();
    fetchAnalysts();
  }, [
    fetchUser,
    fetchFixtures,
    fetchPredictions,
    fetchAnalysts,
  ]);

  const filteredFixtures = useMemo(() => {
    if (selectedSport === "all") return fixtures;

    return fixtures.filter(
      (fixture) => fixture.sport === selectedSport
    );
  }, [fixtures, selectedSport]);

  const recentPredictions = useMemo(() => {
    return [...predictions]
      .sort((a, b) => {
        const dateA = new Date(
          a?.publishedAt || a?.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b?.publishedAt || b?.createdAt || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [predictions]);

  const handleOpenPrediction = (prediction, locked) => {
    if (locked) {
      navigate("/customer/profile");
      return;
    }

    const id = getPredictionId(prediction, 0);
    navigate(`/predictions/${id}`);
  };

  const handleUpgrade = () => {
    navigate("/customer/profile");
  };

  const handleViewAllPredictions = () => {
    navigate("/customer/feed");
  };

  const handleRefresh = () => {
    fetchFixtures();
  };

  const firstName = getDisplayName(user);

  return (
    <div className="min-h-screen bg-[#0a120e] text-white">
      <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <Header />
      </div>

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome and membership */}
        <section className="relative overflow-hidden rounded-3xl border border-[#2a3a34] bg-gradient-to-br from-[#162821] via-[#0f1f1a] to-[#0a120e] p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#18ffc8]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-[#f57cff]/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
                Welcome back,{" "}
                <span className="text-[#18ffc8]">
                  {loadingUser ? "..." : firstName}
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                Follow today's fixtures, discover the latest predictions,
                and stay on top of your sports analysis.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {premiumMember && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#18ffc8]">
                    <FaCheckCircle />
                    Premium access active
                  </span>
                )}
              </div>
            </div>

            {!premiumMember && (
              <div className="w-full rounded-2xl border border-[#f57cff]/25 bg-[#f57cff]/5 p-5 lg:max-w-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f57cff]/10 text-xl text-[#f57cff]">
                    <FaCrown />
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      Unlock Premium
                    </p>
                    <p className="text-xs text-gray-400">
                      Get access to premium analysis
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f57cff] px-4 py-3 text-sm font-bold text-[#180d1b] transition hover:brightness-110"
                >
                  Upgrade Membership <FaArrowRight />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Fixtures */}
        <section>
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Today's Fixtures
              </h2>
              <p className={`mt-1 text-sm ${MUTED}`}>
                {formatDate(new Date())} · Follow the games
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {SPORTS_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setSelectedSport(id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  selectedSport === id
                    ? "border-[#18ffc8] bg-[#18ffc8]/10 text-[#18ffc8]"
                    : "border-[#2a3a34] bg-[#0f1f1a] text-gray-400 hover:text-white"
                }`}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>

          <FixtureMarquee
            fixtures={filteredFixtures}
            loading={loadingFixtures}
            onRefresh={handleRefresh}
          />
        </section>

        {/* Predictions */}
        <section>
          <SectionHeading
            title="Recently Published Predictions"
            action="View all"
            onAction={handleViewAllPredictions}
          />

          {loadingPredictions ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl border border-[#2a3a34] bg-[#0f1f1a]"
                />
              ))}
            </div>
          ) : recentPredictions.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recentPredictions.map((prediction, index) => (
                <PredictionCard
                  key={getPredictionId(prediction, index)}
                  prediction={prediction}
                  index={index}
                  premiumMember={premiumMember}
                  onOpen={handleOpenPrediction}
                />
              ))}
            </div>
          ) : (
            <div className={`${PANEL} p-8 text-center`}>
              <FaChartLine className="mx-auto mb-3 text-2xl text-gray-500" />
              <p className="font-semibold text-white">
                No recent predictions available
              </p>
              <p className={`mt-1 text-sm ${MUTED}`}>
                Published predictions will appear here when available.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
