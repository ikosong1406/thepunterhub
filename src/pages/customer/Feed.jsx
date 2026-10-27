import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import axios from "axios";
import { FaFootballBall, FaCrown, FaArrowRight } from "react-icons/fa";
import Header from "../customer/Header";
import Api from "../../components/Api";

const FeedPage = () => {
  const [allFeedData, setAllFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Check whether the user has an active premium subscription.
  const isSubscriptionActive = (userData) => {
    const subscription = userData?.subscription;

    if (subscription?.plan !== "premium") {
      return false;
    }

    if (!subscription.expiresAt) {
      return false;
    }

    const expiryDate = new Date(subscription.expiresAt);

    if (Number.isNaN(expiryDate.getTime())) {
      return false;
    }

    return expiryDate.getTime() > Date.now();
  };

  const hasActiveSubscription = isSubscriptionActive(user);

  // Fetch logged-in user and subscription details.
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const token = await localforage.getItem("token");

        if (!token) {
          throw new Error("Please log in to view the sports feed.");
        }

        const response = await axios.post(`${Api}/client/getUser`, {
          token,
        });

        const userData = response.data?.data;

        if (!userData?._id) {
          throw new Error("Unable to retrieve your user information.");
        }

        if (isMounted) {
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load user information.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch the sports feed.
  const fetchAllFeed = useCallback(
    async (showLoader = true) => {
      if (!user?._id) return;

      if (showLoader) {
        setLoading(true);
      }

      try {
        const feedResponse = await axios.get(`${Api}/client/getTip`);

        const feedItems = Array.isArray(feedResponse.data?.data)
          ? feedResponse.data.data
          : [];

        setAllFeedData(feedItems);
        setError(null);
      } catch (err) {
        console.error(
          "Error fetching sports feed:",
          err.response?.data || err.message || err,
        );

        setError("Unable to refresh the sports feed. Please try again.");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [user?._id],
  );

  // Fetch the feed and refresh every 30 seconds.
  // Both premium and free users can see the feed preview.
  useEffect(() => {
    if (!user?._id) return;

    fetchAllFeed(true);

    const interval = setInterval(() => {
      fetchAllFeed(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [user?._id, fetchAllFeed]);

  // Format the time a tip was posted.
  const formatPostedAt = (dateString) => {
    if (!dateString) return "Just now";

    const postedDate = new Date(dateString);

    if (Number.isNaN(postedDate.getTime())) {
      return "Recently";
    }

    const diffInMinutes = Math.max(
      0,
      Math.floor((Date.now() - postedDate.getTime()) / 60000),
    );

    if (diffInMinutes < 1) return "Just now";

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes === 1 ? "" : "s"} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  };

  // Status badge styling.
  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "win":
        return "bg-[#18ffc8]/20 text-[#18ffc8]";

      case "loss":
        return "bg-[#f57cff]/20 text-[#f57cff]";

      case "active":
        return "bg-[#fea92a]/20 text-[#fea92a]";

      default:
        return "bg-[#376553]/20 text-[#efefef]";
    }
  };

  // Navigate to tip details.
  const navigateToTipDetails = (tipId) => {
    if (!tipId) return;

    navigate("/tip", {
      state: { tipId },
    });
  };

  // Render a single tip.
  const renderSportTip = (tip) => {
    const confidence = Math.min(
      100,
      Math.max(0, Number(tip.confidenceLevel) || 0),
    );

    const isPremium = hasActiveSubscription;
    const matches = Array.isArray(tip.matches) ? tip.matches : [];

    return (
      <div
        key={tip._id}
        className="relative mb-4 overflow-hidden rounded-xl border border-[#376553]/30 bg-[#162821] p-4"
      >
        {/* Tip heading */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FaFootballBall className="shrink-0 text-[#18ffc8]" />

              <h3 className="break-words text-lg font-medium text-white">
                {tip.bettingSite || "Sports Tip"}
              </h3>
            </div>

            <p className="mt-1 text-sm text-[#efefef]/70">
              {formatPostedAt(tip.createdAt)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold capitalize ${getStatusColor(
              tip.status,
            )}`}
          >
            {tip.status || "Pending"}
          </span>
        </div>

        {/* Betting code and total odds */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-white">
          <div className="min-w-0 text-sm">
            <p className="text-[#efefef]/70">Betting Code</p>

            <div className="relative mt-1 min-w-0">
              <p
                className={`break-all ${
                  !isPremium ? "select-none blur-sm" : ""
                }`}
              >
                {tip.bettingCode || "N/A"}
              </p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-[#efefef]/70">Total Odds</p>

            <p className="mt-1 font-semibold text-[#18ffc8]">
              {tip.totalOdd ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Confidence level: visible to all users */}
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-white">
            <span>Confidence Level</span>
            <span>{confidence}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#376553]/30">
            <div
              className={`h-full rounded-full transition-all ${
                confidence >= 80
                  ? "bg-[#18ffc8]"
                  : confidence >= 60
                    ? "bg-[#fea92a]"
                    : "bg-[#f57cff]"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Matches */}
        <div className="mt-5">
          <p className="mb-2 text-sm text-[#efefef]/70">
            Matches ({matches.length})
          </p>

          {matches.length > 0 ? (
            <div className="space-y-2">
              {matches.map((match, index) => {
                // Free users can see only the first match.
                const isLocked = !isPremium && index > 0;

                return (
                  <div
                    key={match._id || index}
                    className="relative overflow-hidden rounded-lg bg-[#0f1f1a] p-3"
                  >
                    <div
                      className={`flex items-center justify-between gap-3 text-xs ${
                        isLocked ? "select-none blur-sm" : ""
                      }`}
                    >
                      <span className="min-w-0 break-words text-white">
                        {match.teams || "Match details unavailable"}
                      </span>

                      <span className="shrink-0 font-medium text-[#18ffc8]">
                        {match.prediction || "N/A"}
                      </span>
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0f1f1a]/70">
                        <span className="rounded bg-[#162821]/90 px-2 py-1 text-xs font-semibold text-white">
                          <FaCrown className="mr-1 inline text-[#18ffc8]" />
                          Premium Match
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No matches listed.</p>
          )}
        </div>
      </div>
    );
  };

  // Render subscription prompt for free or expired users.
  const renderSubscriptionPrompt = () => {
    const subscription = user?.subscription;

    const isExpired =
      subscription?.plan === "premium" &&
      subscription?.expiresAt &&
      !isSubscriptionActive(user);

    return (
      <div className="mb-5 rounded-xl border border-[#18ffc8]/20 bg-[#162821] p-4">
        <div className="flex items-start gap-3">
          <FaCrown className="mt-1 shrink-0 text-xl text-[#18ffc8]" />

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-white">
              {isExpired
                ? "Your Premium Subscription Has Expired"
                : "Unlock All Premium Sports Tips"}
            </h2>

            <p className="mt-1 text-sm leading-5 text-[#efefef]/70">
              {isExpired
                ? "Renew your subscription to reveal the full betting codes and all match predictions."
                : "You are viewing free previews. Subscribe to unlock full betting codes and all match predictions. Total odds and confidence levels remain visible."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#18ffc8] px-4 py-2.5 text-sm font-bold text-[#0a120e] transition hover:bg-[#18ffc8]/80"
            >
              {isExpired ? "Renew Subscription" : "Subscribe Now"}
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate feed state.
  const renderFeedContent = () => {
    if (loading) {
      return (
        <div className="py-10 text-center text-gray-400">
          Loading sports feed...
        </div>
      );
    }

    if (!user) {
      return (
        <div className="py-10 text-center text-gray-400">
          {error || "Please log in to view the sports feed."}
        </div>
      );
    }

    if (allFeedData.length === 0) {
      return (
        <div className="py-10 text-center text-gray-400">
          No sports tips available right now.
        </div>
      );
    }

    return (
      <>
        {/* Free and expired users see the subscription prompt. */}
        {!hasActiveSubscription && renderSubscriptionPrompt()}

        {/* All users can see the feed preview. */}
        {allFeedData.map((tip) => renderSportTip(tip))}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a120e] px-4 py-6 pb-20 text-white">
      <Header />

      {/* Feed error */}
      {error && user && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}

          <button
            type="button"
            onClick={() => fetchAllFeed(true)}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sports feed */}
      <div className="space-y-6">{renderFeedContent()}</div>
    </div>
  );
};

export default FeedPage;
