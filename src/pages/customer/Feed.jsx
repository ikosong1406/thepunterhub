import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import axios from "axios";
import { FaFootballBall } from "react-icons/fa";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiChevronRight,
} from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import Header from "../customer/Header";
import Api from "../../components/Api";

const FeedPage = () => {
  const [allFeedData, setAllFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [likedSignals, setLikedSignals] = useState({});
  const [dislikedSignals, setDislikedSignals] = useState({});
  const [reactionLoading, setReactionLoading] = useState({});

  const navigate = useNavigate();

  // Fetch logged-in user
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

        if (isMounted) {
          const userData = response.data?.data;

          if (!userData?._id) {
            throw new Error("Unable to retrieve your user information.");
          }

          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load user information."
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

  // Fetch sports feed and reactions
  const fetchAllFeed = useCallback(
    async (showLoader = true) => {
      if (!user?._id) return;

      if (showLoader) {
        setLoading(true);
      }

      try {
        const feedResponse = await axios.post(`${Api}/client/getFeed`, {
          userId: user._id,
        });

        const feedItems = Array.isArray(feedResponse.data?.data)
          ? feedResponse.data.data
          : [];

        // Keep sports tips only
        const sportsFeed = feedItems
          .filter((item) => item.primaryCategory === "sports")
          .map((item) => {
            const comments = Array.isArray(item.comments)
              ? item.comments
              : [];

            return {
              ...item,
              thumbsUp: Number(item.thumbsUp) || 0,
              thumbsDown: Number(item.thumbsDown) || 0,
              totalComments: comments.length,
              topComment:
                comments.length > 0
                  ? comments[comments.length - 1]
                  : null,
            };
          });

        setAllFeedData(sportsFeed);
        setError(null);

        // Fetch reactions for the sports tips only
        const signalIds = sportsFeed.map((item) => item._id);

        if (signalIds.length === 0) {
          setLikedSignals({});
          setDislikedSignals({});
          return;
        }

        const reactionsResponse = await axios.post(
          `${Api}/client/getReaction`,
          {
            userId: user._id,
            signalIds,
          }
        );

        setLikedSignals(reactionsResponse.data?.likedSignals || {});
        setDislikedSignals(
          reactionsResponse.data?.dislikedSignals || {}
        );
      } catch (err) {
        console.error(
          "Error fetching sports feed:",
          err.response?.data || err.message || err
        );

        setError("Unable to refresh the sports feed. Please try again.");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [user]
  );

  // Initial fetch and automatic refresh every 30 seconds
  useEffect(() => {
    if (!user?._id) return;

    fetchAllFeed(true);

    const interval = setInterval(() => {
      fetchAllFeed(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [user?._id, fetchAllFeed]);

  // Handle likes and dislikes
  const handleThumbsClick = async (tipId, type) => {
    if (!user?._id) {
      setError("Please log in to react to sports tips.");
      return;
    }

    if (reactionLoading[tipId]) return;

    const previousFeedData = allFeedData;
    const previousLikedSignals = likedSignals;
    const previousDislikedSignals = dislikedSignals;

    const wasLiked = Boolean(likedSignals[tipId]);
    const wasDisliked = Boolean(dislikedSignals[tipId]);

    const isRemovingReaction =
      (type === "up" && wasLiked) ||
      (type === "down" && wasDisliked);

    // Update the interface immediately
    setAllFeedData((previous) =>
      previous.map((tip) => {
        if (tip._id !== tipId) return tip;

        let thumbsUp = Number(tip.thumbsUp) || 0;
        let thumbsDown = Number(tip.thumbsDown) || 0;

        if (type === "up") {
          if (wasLiked) {
            thumbsUp = Math.max(0, thumbsUp - 1);
          } else {
            thumbsUp += 1;

            if (wasDisliked) {
              thumbsDown = Math.max(0, thumbsDown - 1);
            }
          }
        }

        if (type === "down") {
          if (wasDisliked) {
            thumbsDown = Math.max(0, thumbsDown - 1);
          } else {
            thumbsDown += 1;

            if (wasLiked) {
              thumbsUp = Math.max(0, thumbsUp - 1);
            }
          }
        }

        return { ...tip, thumbsUp, thumbsDown };
      })
    );

    setLikedSignals((previous) => {
      const next = { ...previous };

      if (type === "up") {
        if (wasLiked) {
          delete next[tipId];
        } else {
          next[tipId] = true;
        }
      }

      if (type === "down" && wasLiked) {
        delete next[tipId];
      }

      return next;
    });

    setDislikedSignals((previous) => {
      const next = { ...previous };

      if (type === "down") {
        if (wasDisliked) {
          delete next[tipId];
        } else {
          next[tipId] = true;
        }
      }

      if (type === "up" && wasDisliked) {
        delete next[tipId];
      }

      return next;
    });

    setReactionLoading((previous) => ({
      ...previous,
      [tipId]: true,
    }));

    try {
      await axios.post(`${Api}/client/updateReaction`, {
        signalId: tipId,
        userId: user._id,
        type,
      });

      setError(null);
    } catch (err) {
      console.error(
        "Failed to update sports tip reaction:",
        err.response?.data || err.message || err
      );

      // Restore the previous state if the request fails
      setAllFeedData(previousFeedData);
      setLikedSignals(previousLikedSignals);
      setDislikedSignals(previousDislikedSignals);
      setError("Failed to update your reaction. Please try again.");
    } finally {
      setReactionLoading((previous) => {
        const next = { ...previous };
        delete next[tipId];
        return next;
      });
    }
  };

  // Get the first letter of a username
  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : "A";
  };

  // Format the post time
  const formatPostedAt = (dateString) => {
    if (!dateString) return "Just now";

    const postedDate = new Date(dateString);

    if (Number.isNaN(postedDate.getTime())) {
      return "Recently";
    }

    const diffInMinutes = Math.max(
      0,
      Math.floor((Date.now() - postedDate.getTime()) / 60000)
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

  // Status badge styling
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

  // Navigation
  const handlePunterClick = (punterId) => {
    if (!punterId) return;

    navigate("/punters", {
      state: { punterId },
    });
  };

  const navigateToTipDetails = (tipId) => {
    if (!tipId) return;

    navigate("/tip", {
      state: { tipId },
    });
  };

  // Render a sports tip
  const renderSportTip = (tip) => {
    const confidence = Math.min(
      100,
      Math.max(0, Number(tip.confidenceLevel) || 0)
    );

    return (
      <div
        key={tip._id}
        className="relative mb-4 rounded-xl border border-[#376553]/30 bg-[#162821] p-4"
      >
        {/* Tip heading */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FaFootballBall className="text-[#18ffc8]" />

              <h3 className="text-lg font-medium text-white">
                {tip.bettingSite || "Sports Tip"}
              </h3>
            </div>

            <p className="mt-1 text-sm text-[#efefef]/70">
              {formatPostedAt(tip.createdAt)}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${getStatusColor(
              tip.status
            )}`}
          >
            {tip.status || "Pending"}
          </span>
        </div>

        {/* Betting details */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-white">
          <div className="text-sm">
            <p className="text-[#efefef]/70">Code</p>
            <p className="break-words">{tip.bettingCode || "N/A"}</p>
          </div>

          <div className="text-sm">
            <p className="text-[#efefef]/70">Total Odds</p>
            <p>{tip.totalOdd ?? "N/A"}</p>
          </div>

          <div className="col-span-2 text-sm">
            <p className="mb-2 text-[#efefef]/70">Matches</p>

            {Array.isArray(tip.matches) && tip.matches.length > 0 ? (
              <div className="space-y-2">
                {tip.matches.map((match, index) => (
                  <div
                    key={match._id || index}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[#0f1f1a] p-3 text-xs"
                  >
                    <span className="min-w-0 break-words">
                      {match.teams || "Match details unavailable"}
                    </span>

                    <span className="shrink-0 font-medium text-[#18ffc8]">
                      {match.prediction || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                No matches listed.
              </p>
            )}
          </div>
        </div>

        {/* Confidence level */}
        <div className="mt-4">
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

        {/* Punter and reactions */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#376553]/30 pt-4">
          <button
            type="button"
            onClick={() => handlePunterClick(tip.punterId)}
            className="flex min-w-0 items-center gap-2 text-left text-sm text-[#efefef]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#18ffc8] bg-[#18ffc8]/20 text-sm font-bold text-[#18ffc8]">
              {getInitials(tip.punterUsername)}
            </div>

            <span className="truncate">
              {tip.punterUsername || "Anonymous"}
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              disabled={Boolean(reactionLoading[tip._id])}
              onClick={() => handleThumbsClick(tip._id, "up")}
              aria-label="Like sports tip"
              className={`flex items-center gap-1 transition disabled:opacity-50 ${
                likedSignals[tip._id]
                  ? "text-[#18ffc8]"
                  : "text-gray-400 hover:text-[#18ffc8]"
              }`}
            >
              <FiThumbsUp size={19} />
              <span className="text-sm">{tip.thumbsUp || 0}</span>
            </button>

            <button
              type="button"
              disabled={Boolean(reactionLoading[tip._id])}
              onClick={() => handleThumbsClick(tip._id, "down")}
              aria-label="Dislike sports tip"
              className={`flex items-center gap-1 transition disabled:opacity-50 ${
                dislikedSignals[tip._id]
                  ? "text-red-400"
                  : "text-gray-400 hover:text-red-400"
              }`}
            >
              <FiThumbsDown size={19} />
              <span className="text-sm">{tip.thumbsDown || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTipDetails(tip._id)}
              aria-label="View comments"
              className="flex items-center gap-1 text-[#fea92a] transition hover:text-[#18ffc8]"
            >
              <AiOutlineMessage size={18} />
              <span className="text-sm">{tip.totalComments || 0}</span>
            </button>
          </div>
        </div>

        {/* Latest comment */}
        <div className="mt-4 border-t border-[#376553]/30 pt-4">
          {tip.topComment ? (
            <>
              <div className="mb-2 rounded-lg bg-[#376553]/20 p-3 text-sm">
                <p className="mb-1 text-xs font-bold text-[#fea92a]">
                  {tip.topComment.user || "User"}
                </p>

                <p className="line-clamp-2 text-[#efefef]/90">
                  {tip.topComment.comment || ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigateToTipDetails(tip._id)}
                className="flex items-center text-xs font-medium text-[#18ffc8] transition hover:text-[#18ffc8]/80"
              >
                {tip.totalComments > 1
                  ? `See ${tip.totalComments - 1} more comment${
                      tip.totalComments - 1 !== 1 ? "s" : ""
                    }`
                  : "View Tip Details"}

                <FiChevronRight size={15} className="ml-1" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-[#efefef]/70">
                Be the first to comment on this tip!
              </p>

              <button
                type="button"
                onClick={() => navigateToTipDetails(tip._id)}
                className="flex w-full items-center justify-between rounded-md bg-[#376553]/50 p-3 text-sm font-medium text-[#efefef] transition hover:bg-[#376553]"
              >
                Drop a comment...
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render sports feed states
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

    return allFeedData.map((tip) => renderSportTip(tip));
  };

  return (
    <div className="min-h-screen bg-[#0a120e] px-4 py-6 pb-20 text-white">
      <Header />

      {/* Error message */}
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

      {/* Sports tips */}
      <div className="space-y-6">{renderFeedContent()}</div>
    </div>
  );
};

export default FeedPage;
