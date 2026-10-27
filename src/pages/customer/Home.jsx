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
  FaChartLine,
  FaCrown,
  FaArrowRight,
  FaLock,
  FaRegClock,
  FaRegCalendarAlt,
  FaSyncAlt,
  FaCheckCircle,
  FaChevronRight,
} from "react-icons/fa";

import Api from "../../components/Api";
import Header from "./Header";

const FOOTBALL_API_URL = "https://v3.football.api-sports.io";

const API_KEY = "032a3c0e9a2048207e504142a1f28774";
const FIXTURES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const FIXTURES_CACHE_PREFIX = "footballFixtures";

const PANEL = "rounded-2xl border border-[#2a3a34] bg-[#0f1f1a]";
const MUTED = "text-gray-400";

// Format a date in the visitor's device timezone.
const formatDate = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return "Date TBA";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
};

// Get today's date in the visitor's timezone.
const getLocalDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Store timestamps independently of timezone, then format on display.
const formatKickoff = (timestamp) => {
  if (timestamp === null || timestamp === undefined || timestamp === "") {
    return "Time TBA";
  }

  const date = new Date(Number(timestamp));

  if (Number.isNaN(date.getTime())) {
    return "Time TBA";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeFixture = (item) => {
  const fixture = item.fixture || {};
  const league = item.league || {};
  const teams = item.teams || {};
  const goals = item.goals || {};
  const status = fixture.status || {};

  const timestamp = fixture.timestamp
    ? Number(fixture.timestamp) * 1000
    : fixture.date
      ? Date.parse(fixture.date)
      : null;

  return {
    id: fixture.id,
    sport: "football",
    league: league.name || "Football",
    home: teams.home?.name || "Home team",
    away: teams.away?.name || "Away team",
    homeBadge: teams.home?.logo || "",
    awayBadge: teams.away?.logo || "",
    timestamp: Number.isFinite(timestamp) ? timestamp : null,
    date: "",
    time: "",
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
    user?.subscription?.plan ??
      user?.membership?.plan ??
      user?.membershipPlan ??
      user?.plan ??
      "free",
  )
    .trim()
    .toLowerCase();

  const expiresAt =
    user?.subscription?.expiresAt ?? user?.membership?.expiresAt;

  const activeFlag =
    user?.subscription?.isActive ??
    user?.membership?.isActive ??
    user?.membershipActive ??
    true;

  const hasValidExpiry =
    !!expiresAt &&
    !Number.isNaN(new Date(expiresAt).getTime()) &&
    new Date(expiresAt).getTime() > Date.now();

  return plan === "premium" && activeFlag === true && hasValidExpiry;
};

const getPredictionId = (prediction, index) =>
  prediction?._id ||
  prediction?.id ||
  prediction?.predictionId ||
  `prediction-${index}`;

const getPredictionDate = (prediction) => {
  const value =
    prediction?.publishedAt || prediction?.createdAt || prediction?.date;

  if (!value) return "Recently published";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Recently published" : formatDate(date);
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

  const isFinished = /finished|ft|full.?time|match.?over/i.test(fixture.status);

  return (
    <article className="w-[280px] shrink-0 rounded-2xl border border-[#2a3a34] bg-[#0f1f1a] p-4 transition duration-200 hover:border-[#18ffc8]/50 hover:bg-[#132820] sm:w-[310px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="max-w-[190px] truncate rounded-full bg-[#162821] px-3 py-1 text-xs text-gray-300">
          {fixture.league}
        </span>

        <span className="flex shrink-0 items-center gap-1 text-xs text-[#18ffc8]">
          {hasScore ? <FaChartLine /> : <FaRegClock />}
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
              : formatKickoff(fixture.timestamp)}
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
            Football
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
          <TeamBadge src={fixture.awayBadge} name={fixture.away} />
          <span className="line-clamp-2 min-h-8 text-sm font-semibold text-white">
            {fixture.away}
          </span>
        </div>
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
      },
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
          No upcoming football fixtures
        </p>
        <p className={`mt-1 text-sm ${MUTED}`}>
          There are no football matches scheduled to start later today.
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
          <FixtureCard key={`${fixture.id}-${index}`} fixture={fixture} />
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
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
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

function PredictionCard({ prediction, index, premiumMember }) {
  const matches = Array.isArray(prediction?.matches) ? prediction.matches : [];

  const isLocked = !premiumMember;

  const formatTeams = (teams) => {
    if (typeof teams === "string") return teams;

    if (Array.isArray(teams)) {
      return teams
        .map((team) =>
          typeof team === "string" ? team : team?.name || team?.teamName || "",
        )
        .filter(Boolean)
        .join(" vs ");
    }

    if (teams && typeof teams === "object") {
      if (teams.home || teams.away) {
        return [teams.home?.name || teams.home, teams.away?.name || teams.away]
          .filter(Boolean)
          .join(" vs ");
      }

      return (
        teams.name ||
        teams.match ||
        teams.fixture ||
        "Match details unavailable"
      );
    }

    return "Match details unavailable";
  };

  return (
    <article
      className={`${PANEL} flex h-full flex-col p-4 transition hover:border-[#18ffc8]/40`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {getPredictionDate(prediction)}
        </span>
      </div>

      {/* Betting site and status */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">
          {prediction?.bettingSite || "Sports Prediction"}
        </span>

        {prediction?.status &&
          (() => {
            const status = String(prediction.status).trim().toLowerCase();

            const statusStyles = {
              win: "bg-[#18ffc8]/10 text-[#18ffc8] border-[#18ffc8]/20",
              active: "bg-[#fea92a]/10 text-[#fea92a] border-[#fea92a]/20",
              loss: "bg-[#f57cff]/10 text-[#f57cff] border-[#f57cff]/20",
            };

            const style =
              statusStyles[status] ||
              "bg-[#162821] text-gray-300 border-[#2a3a34]";

            return (
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
              >
                {status.replace(/_/g, " ").toUpperCase()}
              </span>
            );
          })()}
      </div>

      {/* Betting code: blurred for non-premium users */}
      <div className="mb-4 rounded-xl border border-[#2a3a34] bg-[#09140f] p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
          Betting Code
        </p>

        <div className="relative">
          <p
            className={`break-all font-mono text-sm font-bold text-[#18ffc8] ${
              isLocked ? "select-none blur-sm" : ""
            }`}
          >
            {prediction?.bettingCode || "No betting code available"}
          </p>
        </div>
      </div>

      {/* Odds and confidence remain visible */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#162821] p-3">
          <p className="mb-1 text-xs text-gray-400">Total Odds</p>
          <p className="text-lg font-extrabold text-[#18ffc8]">
            {prediction?.totalOdd ?? "N/A"}
          </p>
        </div>

        <div className="rounded-xl bg-[#162821] p-3">
          <p className="mb-1 text-xs text-gray-400">Confidence</p>
          <p className="text-lg font-extrabold text-white">
            {prediction?.confidenceLevel != null
              ? `${prediction.confidenceLevel}${
                  typeof prediction.confidenceLevel === "number" ||
                  /^\d+(\.\d+)?$/.test(String(prediction.confidenceLevel))
                    ? "%"
                    : ""
                }`
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Matches */}
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-bold text-white">Matches</h3>
        </div>

        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match, matchIndex) => {
              const matchLocked = isLocked && matchIndex > 0;

              return (
                <div
                  key={match?._id || match?.id || matchIndex}
                  className="relative overflow-hidden rounded-xl border border-[#2a3a34] bg-[#09140f] p-3"
                >
                  <div className={matchLocked ? "select-none blur-sm" : ""}>
                    <p className="mb-2 text-sm font-semibold leading-5 text-white">
                      {formatTeams(match?.teams)}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Prediction</span>

                      <span className="rounded-lg bg-[#18ffc8]/10 px-2.5 py-1 text-xs font-bold text-[#18ffc8]">
                        {match?.prediction || "N/A"}
                      </span>
                    </div>
                  </div>

                  {matchLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#071411]/60 p-2 text-center">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-400/20 bg-[#0a120e]/95 px-3 py-2 text-xs font-bold text-[#f57cff]">
                        <FaLock />
                        Premium Match
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-[#2a3a34] bg-[#09140f] p-4 text-sm text-gray-400">
            No match details available.
          </p>
        )}
      </div>

      {/* Subscription prompt */}
      {isLocked && (
        <button
          type="button"
          onClick={() => {
            window.location.href = "/profile";
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18ffc8] px-4 py-3 text-sm font-bold text-[#07130e] transition hover:bg-[#7dffdf]"
        >
          <FaLock />
          Subscribe to Unlock
          <FaArrowRight />
        </button>
      )}
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  const premiumMember = useMemo(() => isPremiumMember(user), [user]);

  const fetchUser = useCallback(async () => {
    setLoadingUser(true);

    try {
      const token = await localforage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await axios.post(`${Api}/client/getUser`, { token });

      const result =
        response?.data?.user || response?.data?.data || response?.data;

      setUser(result || null);
    } catch (error) {
      console.error("Unable to load user:", error);
      toast.error("Could not load your account information.");
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const fetchSportFixtures = async ({
    sport,
    url,
    apiKey,
    endpoint,
    normalize,
    date,
    timezone,
  }) => {
    const cacheKey = `${FIXTURES_CACHE_PREFIX}:${sport}:${date}:${timezone}`;

    const cached = await localforage.getItem(cacheKey);

    const cacheIsValid =
      cached?.savedAt &&
      Date.now() - cached.savedAt < FIXTURES_CACHE_DURATION &&
      Array.isArray(cached.fixtures);

    if (cacheIsValid) {
      return cached.fixtures;
    }

    try {
      if (!apiKey) {
        throw new Error(`Missing API key for ${sport}.`);
      }

      const response = await axios.get(`${url}/${endpoint}`, {
        params: {
          date,
          timezone,
        },
        headers: {
          "x-apisports-key": apiKey,
        },
        timeout: 15000,
      });

      const data = response.data;

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      const events = Array.isArray(data.response) ? data.response : [];

      const normalized = events
        .map(normalize)
        .filter((fixture) => fixture.id != null)
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      await localforage.setItem(cacheKey, {
        savedAt: Date.now(),
        fixtures: normalized,
      });

      return normalized;
    } catch (error) {
      console.error(`Unable to load ${sport} fixtures:`, error);

      if (Array.isArray(cached?.fixtures)) {
        return cached.fixtures;
      }

      throw error;
    }
  };

  const fetchFixtures = useCallback(async () => {
    setLoadingFixtures(true);

    const date = getLocalDate();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    try {
      const footballFixtures = await fetchSportFixtures({
        sport: "football",
        url: FOOTBALL_API_URL,
        apiKey: API_KEY,
        endpoint: "fixtures",
        normalize: normalizeFixture,
        date,
        timezone,
      });

      setFixtures(footballFixtures);
    } catch (error) {
      console.error("Unable to load football fixtures:", error);
      setFixtures([]);
      toast.error(
        "Could not load football fixtures. Check your API key and connection.",
      );
    } finally {
      setLoadingFixtures(false);
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    setLoadingPredictions(true);

    try {
      const response = await axios.get(`${Api}/client/getTip`);

      const result =
        response?.data?.predictions || response?.data?.data || response?.data;

      setPredictions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load predictions:", error);
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchFixtures();
    fetchPredictions();
  }, [fetchUser, fetchFixtures, fetchPredictions]);

  // Keep the list in sync with the visitor's current device time.
  // Fixtures disappear from the upcoming list once their kickoff time passes.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const filteredFixtures = useMemo(
    () =>
      fixtures.filter(
        (fixture) =>
          fixture.timestamp !== null &&
          fixture.timestamp > currentTime &&
          ["NS", "TBD"].includes(
            String(fixture.statusShort || "").toUpperCase(),
          ),
      ),
    [fixtures, currentTime],
  );

  const recentPredictions = useMemo(() => {
    return [...predictions]
      .sort((a, b) => {
        const dateA = new Date(a?.publishedAt || a?.createdAt || 0).getTime();

        const dateB = new Date(b?.publishedAt || b?.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .slice(1, 3);
  }, [predictions]);

  const handleUpgrade = () => {
    navigate("/profile");
  };

  const handleViewAllPredictions = () => {
    navigate("/feed");
  };

  const handleRefresh = () => {
    fetchFixtures();
  };

  return (
    <div className="min-h-screen bg-[#0a120e] text-white">
      <div className="px-4 pt-4 sm:px-6 lg:px-8">
        <Header />
      </div>

      <main className="mx-auto max-w-[1600px] space-y-8 px-4 py-4 sm:px-6 lg:px-8">
        {/* Fixtures */}
        <section>
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Upcoming Football Fixtures
              </h2>
              <p className={`mt-1 text-sm ${MUTED}`}>
                {formatDate(new Date())} ·
              </p>
            </div>
          </div>

          <FixtureMarquee
            fixtures={filteredFixtures}
            loading={loadingFixtures}
            onRefresh={handleRefresh}
          />
        </section>

        <div className="flex flex-col gap-4 rounded-xl border border-[#2a3a34] bg-[#14241c] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                premiumMember
                  ? "bg-[#18ffc8]/10 text-[#18ffc8]"
                  : "bg-[#f57cff]/10 text-[#f57cff]"
              }`}
            >
              {premiumMember ? (
                <FaCheckCircle className="text-xl" />
              ) : (
                <FaCrown className="text-xl" />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-white">
                {premiumMember ? "Premium membership" : "Free membership"}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400 sm:text-sm">
                {premiumMember
                  ? "Your premium analysis access is active."
                  : "Unlock premium predictions and expert analysis."}
              </p>
            </div>
          </div>

          {premiumMember ? (
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-[#18ffc8]/20 bg-[#18ffc8]/5 px-3 py-2 text-xs font-semibold text-[#18ffc8]">
              <FaCheckCircle />
              Active
            </span>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#18ffc8] px-4 py-3 text-sm font-bold text-[#07130e] transition hover:bg-[#7dffdf] sm:w-auto"
            >
              Explore Premium
              <FaArrowRight />
            </button>
          )}
        </div>

        {/* Predictions */}
        <section>
          <SectionHeading
            title="Recently Published Predictions"
            action="View all"
            onAction={handleViewAllPredictions}
          />

          {loadingPredictions ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl border border-[#2a3a34] bg-[#0f1f1a]"
                />
              ))}
            </div>
          ) : recentPredictions.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {recentPredictions.map((prediction, index) => (
                <PredictionCard
                  key={getPredictionId(prediction, index)}
                  prediction={prediction}
                  index={index}
                  premiumMember={premiumMember}
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
