import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api"; // Assuming this path is correct
import Header from "./Header"; // Assuming this path is correct
import localforage from "localforage";
import {
  FiArrowLeft,
  FiSend,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare,
  FiLock,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import { MdPushPin } from "react-icons/md";

// --- Utility Functions (Copied/Modified from TipsHistoryMobile for consistency) ---

const getStatusColor = (status) => {
  if (status === "win") return "bg-[#18ffc8]/20 text-[#18ffc8]";
  if (status === "loss") return "bg-[#f57cff]/20 text-[#f57cff]";
  if (status === "active") return "bg-[#fea92a]/20 text-[#fea92a]";
  return "bg-[#376553]/20 text-[#efefef]";
};

const getDirectionColor = (direction) => {
  return direction?.toLowerCase() === "buy"
    ? "bg-green-900/20 text-green-400"
    : "bg-red-900/20 text-red-400";
};

const formatPostedAt = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- NEW Utility Function for tipType Design ---
const getTipTypeDesign = (tipType) => {
  const type = tipType?.toLowerCase();
  switch (type) {
    case "free":
      return "bg-[#376553] text-[#18ffc8] border border-[#18ffc8] font-semibold";
    case "premium":
      // Lock icon for premium to indicate exclusivity
      return "bg-[#fea92a]/30 text-[#fea92a] border border-[#fea92a] font-semibold flex items-center";
    case "vip":
      // A more intense style for VIP
      return "bg-[#f57cff]/30 text-[#f57cff] border border-[#f57cff] font-extrabold flex items-center";
    default:
      return "bg-[#376553]/20 text-[#efefef]/70 border border-[#376553]";
  }
};

// --- Tip Details Component ---

const TipDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tipId = location.state?.tipId; // Retrieve tipId from state

  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  // Define fetchTipDetails outside of useEffect for re-use
  const fetchTipDetails = async (tipId, token) => {
    try {
      const response = await axios.post(`${Api}/client/getTip`, { tipId });

      if (response.data.status === "ok") {
        setTip(response.data.data.tip);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch tip details."
        );
      }
    } catch (err) {
      console.error("Error refetching tip:", err);
      // Don't set global error here, just log or handle locally
      throw err; // rethrow for the useEffect catch block
    }
  };


  useEffect(() => {
    if (!tipId) {
      setError("No Tip ID provided.");
      setLoading(false);
      return;
    }

    const initialFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await localforage.getItem("token");

        // 1. Get User Data (to check if logged in and for comment posting)
        const userResponse = await axios.post(`${Api}/client/getUser`, {
          token,
        });
        setUser(userResponse.data.data);

        // 2. Get Tip Details
        await fetchTipDetails(tipId, token); // Use the defined function
      } catch (err) {
        console.error(err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    initialFetch();
  }, [tipId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert("You must be logged in to post a comment.");
      return;
    }

    try {
      // Assuming an endpoint for posting a comment
      const response = await axios.post(`${Api}/client/comment`, {
        signalId: tipId,
        comment: newComment,
        author: user.username || user.firstname, // Use username if available
      });

      if (response.data.status === "ok") {
        // Optimistically update comments or refetch data
        setNewComment("");
        // A full re-fetch ensures all data (like comment counts) is fresh
        await fetchTipDetails(tipId, await localforage.getItem("token"));
      } else {
        throw new Error(response.data.message || "Failed to post comment.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render Logic for Loading/Error States ---
  if (!tipId) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4">
        <Header />
        <div className="text-center py-20 text-red-500/50">
          Tip ID is missing. Navigate back to history.
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 p-3 rounded-md bg-[#376553] text-[#efefef] hover:bg-[#fea92a]/20 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4">
        <Header />
        <div className="text-center py-20 text-[#efefef]/50">
          Loading tip details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4">
        <Header />
        <div className="text-center py-20 text-red-500/50">Error: {error}</div>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 p-3 rounded-md bg-[#376553] text-[#efefef] hover:bg-[#fea92a]/20 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Ensure tip exists before rendering details
  if (!tip) {
    return (
      <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4">
        <Header />
        <div className="text-center py-20 text-red-500/50">Tip not found.</div>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-4 p-3 rounded-md bg-[#376553] text-[#efefef] hover:bg-[#fea92a]/20 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Tip Details Structure ---

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      <Header />

      {/* Back Button and Title */}
      <div className="sticky top-0 z-10 bg-[#09100d] pt-4 pb-2 border-b border-[#162821]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#fea92a] hover:text-[#ffc666] transition"
        >
          <FiArrowLeft size={24} className="mr-2" />
          <h2 className="text-lg font-bold">Tip Details</h2>
        </button>
      </div>

      {/* Tip Card Section (Redesigned) */}
      <div className="space-y-4">
        <div className="relative rounded-xl bg-[#162821] border border-[#376553]/30 p-4">
          {/* Pin Indicator */}
          {tip.isPinned && (
            <div className="absolute top-0 right-0 p-2 text-yellow-400">
              <MdPushPin size={20} />
            </div>
          )}

          <div className="flex justify-between items-start">
            <div>
              {tip.primaryCategory === "sports" ? (
                <h3 className="font-medium">{tip.bettingSite}</h3>
              ) : (
                <div className="flex items-center">
                  <h3 className="font-medium mr-2">{tip.pair}</h3>
                  {tip.direction && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getDirectionColor(
                        tip.direction
                      )}`}
                    >
                      {tip.direction.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm text-[#efefef]/70 mt-1">
                {formatPostedAt(tip.createdAt)}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(
                tip.status,
                tip.result
              )}`}
            >
              {tip.result || tip.status}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {tip.primaryCategory !== "sports" ? (
              <>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Entry</p>
                  <p>{tip.entryPrice}</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Take Profit</p>
                  <p className="text-[#18ffc8]">{tip.takeProfit}</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Stop Loss</p>
                  <p className="text-[#f57cff]">{tip.stopLoss}</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Time Frame</p>
                  <p>{tip.timeFrame}</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Site</p>
                  <p>{tip.bettingSite}</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Code</p>
                  <p>{tip.bettingCode}</p>
                </div>
                <div className="text-sm">
                  <p className="text-[#efefef]/70">Total Odd</p>
                  <p>{tip.totalOdd}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Confidence Level</span>
              <span>{tip.confidenceLevel}%</span>
            </div>
            <div className="w-full bg-[#376553]/30 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  tip.confidenceLevel >= 80
                    ? "bg-[#18ffc8]"
                    : tip.confidenceLevel >= 60
                    ? "bg-[#fea92a]"
                    : "bg-[#f57cff]"
                }`}
                style={{ width: `${tip.confidenceLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Engagement Footer */}
          <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-start space-x-6 items-center">
            <div className="flex items-center space-x-1 text-green-400">
              <FiThumbsUp size={16} />
              <span className="text-sm">{tip.thumbsUp || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-red-400">
              <FiThumbsDown size={16} />
              <span className="text-sm">{tip.thumbsDown || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-[#fea92a]">
              <FiMessageSquare size={16} />
              <span className="text-sm">{tip.comments?.length || 0}</span>
            </div>
            {/* TIP TYPE DESIGN IMPLEMENTATION */}
            <div
              className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${getTipTypeDesign(
                tip.tipType
              )}`}
            >
              {/* Conditionally render icon for premium/vip */}
              {(tip.tipType?.toLowerCase() === "premium" ||
                tip.tipType?.toLowerCase() === "vip") && (
                <FiLock size={12} className="mr-1" />
              )}
              <span className="align-middle">{tip.tipType}</span>
            </div>
            {/* END TIP TYPE DESIGN */}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 border-b border-[#376553]/50 pb-2 mt-6">
          Comments ({tip.comments?.length || 0})
        </h3>

        {/* New Comment Input (Sticky) */}
        <div className="mb-6 sticky top-20 z-10 bg-[#09100d] pt-2 pb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                user ? "Drop your comment..." : "Login to comment..."
              }
              className="flex-grow p-3 rounded-lg bg-[#162821] border border-[#376553] text-[#efefef] focus:ring-1 focus:ring-[#fea92a] focus:outline-none disabled:opacity-50"
              disabled={!user}
            />
            <button
              onClick={handlePostComment}
              disabled={!user || !newComment.trim()}
              className="p-3 rounded-lg bg-[#fea92a] text-[#09100d] hover:bg-[#ffc666] transition disabled:bg-[#376553]/50 disabled:text-[#efefef]/50"
            >
              <FiSend size={20} />
            </button>
          </div>
          {!user && (
            <p className="text-sm text-red-400 mt-2">
              You must be logged in to post comments.
            </p>
          )}
        </div>

        {/* Existing Comments List */}
        <div className="space-y-4">
          {tip.comments && tip.comments.length > 0 ? (
            tip.comments
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by latest first
              .map((comment, index) => (
                <CommentCard key={index} comment={comment} />
              ))
          ) : (
            <div className="text-center py-10 text-[#efefef]/50 bg-[#162821] rounded-lg p-4">
              No comments yet. Be the first!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helper Component (Unchanged) ---

const CommentCard = ({ comment }) => (
  <div className="bg-[#162821] border border-[#376553]/30 p-4 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-2">
      <p className="font-bold text-[#fea92a] text-sm">
        {comment.user || "Anonymous User"}
      </p>
      <p className="text-xs text-[#efefef]/50">
        {formatPostedAt(comment.createdAt)}
      </p>
    </div>
    <p className="text-sm text-[#efefef]/90">{comment.comment}</p>
  </div>
);

export default TipDetails;