import {
  FiTrash2,
  FiEdit,
  FiCheck,
  FiX,
  FiChevronRight,
  FiThumbsUp,
  FiThumbsDown,
  FiPlus,
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { MdPushPin } from "react-icons/md";
import { useState, useEffect } from "react";
import axios from "axios";
import Api from "../../components/Api";
import localforage from "localforage";
import Header from "./Header";

const TipsHistoryMobile = () => {
    const navigate = useNavigate();
  const [tips, setTips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await localforage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found.");
      }
      const userResponse = await axios.post(`${Api}/client/getUser`, { token });
      const userData = userResponse.data.data;
      setUser(userData);
      const userId = userData._id;
      const signalsResponse = await axios.post(`${Api}/client/getSignal`, {
        userId,
      });
      const sortedSignals = signalsResponse.data.signals.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTips(sortedSignals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteModal = (tip) => {
    setSelectedTip(tip);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (tip) => {
    setSelectedTip(tip);
    setNewStatus(tip.status);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedTip(null);
  };

  // New function to handle pin/unpin
  const handlePinUnpin = async (tipId, isCurrentlyPinned) => {
    try {
      const response = await axios.post(`${Api}/client/pinSignal`, {
        signalId: tipId,
        isPinned: !isCurrentlyPinned, // Toggle the pin status
      });

      if (response.data.status === "ok") {
        // Refetch tips to get the updated, sorted list
        await fetchData();
      } else {
        throw new Error(
          response.data.message || "Failed to update pin status."
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Inside handleDelete
  const handleDelete = async () => {
    if (!selectedTip) return;
    try {
      const response = await axios.post(`${Api}/client/deleteSignal`, {
        signalId: selectedTip._id,
      });
      if (response.data.status === "ok") {
        // Instead of setTips, just refetch all tips
        await fetchData();
      } else {
        throw new Error(response.data.message || "Failed to delete tip.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      closeModals();
    }
  };

  // Inside handleUpdateStatus
  const handleUpdateStatus = async () => {
    if (!selectedTip || !newStatus) return;
    try {
      const response = await axios.post(`${Api}/client/editSignal`, {
        signalId: selectedTip._id,
        status: newStatus,
      });
      if (response.data.status === "ok") {
        // Instead of setTips, just refetch all tips
        await fetchData();
      } else {
        throw new Error(
          response.data.message || "Failed to update tip status."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      closeModals();
    }
  };

  const filteredTips = tips.filter((tip) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return tip.status === "active";
    if (activeFilter === "win") return tip.status === "win";
    if (activeFilter === "loss") return tip.status === "loss";
    return true;
  });

  const getStatusColor = (status) => {
    if (status === "win") return "bg-[#18ffc8]/20 text-[#18ffc8]";
    if (status === "loss") return "bg-[#f57cff]/20 text-[#f57cff]";
    if (status === "active") return "bg-[#fea92a]/20 text-[#fea92a]";
    return "bg-[#376553]/20 text-[#efefef]";
  };

  const getDirectionColor = (direction) => {
    return direction.toLowerCase() === "buy"
      ? "bg-green-900/20 text-green-400"
      : "bg-red-900/20 text-red-400";
  };

  const formatPostedAt = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postedDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#162821] p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h4 className="text-lg font-bold text-red-400 mb-2">
          Confirm Deletion
        </h4>
        <p className="text-sm text-[#efefef]/70 mb-4">
          Are you sure you want to delete this tip? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={closeModals}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#376553] text-[#efefef] hover:bg-[#fea92a]/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const EditStatusModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#162821] p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h4 className="text-lg font-bold text-[#fea92a] mb-2">
          Edit Tip Status
        </h4>
        <p className="text-sm text-[#efefef]/70 mb-4">
          Change the status of this tip.
        </p>
        <div className="mb-4">
          <label
            htmlFor="status-select"
            className="block text-sm font-medium text-[#efefef] mb-1"
          >
            Status
          </label>
          <select
            id="status-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full p-2 rounded-md bg-[#09100d] text-[#efefef] border border-[#376553] focus:outline-none focus:border-[#fea92a]"
          >
            <option value="active">Active</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={closeModals}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#376553] text-[#efefef] hover:bg-[#fea92a]/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#fea92a] text-[#09100d] hover:bg-[#ffc666] transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      <Header />
      <div className="sticky top-0 z-10 bg-[#09100d] border-b border-[#162821]">
        <div className="flex space-x-2 mt-3 overflow-x-auto pb-2">
          {["all", "active", "win", "loss"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-[#fea92a] text-[#09100d]"
                  : "bg-[#162821] text-[#efefef]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <hr className="my-4" />
      <div className="pt-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-[#efefef]/50">
            Loading tips...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500/50">
            Error: {error}
          </div>
        ) : filteredTips.length === 0 ? (
          <div className="text-center py-10 text-[#efefef]/50">
            No tips found for this filter.
          </div>
        ) : (
          filteredTips.map((tip) => (
            <div
              key={tip._id}
              className="relative rounded-xl bg-[#162821] border border-[#376553]/30 p-4"
            >
              {/* Tip Card Content */}
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

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-[#376553]/30 flex justify-between space-x-4">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1 text-green-400">
                    <FiThumbsUp size={16} />
                    <span className="text-sm">{tip.thumbsUp || 0}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-red-400">
                    <FiThumbsDown size={16} />
                    <span className="text-sm">{tip.thumbsDown || 0}</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  {/* Pin Icon */}
                  <button
                    onClick={() => handlePinUnpin(tip._id, tip.isPinned)}
                    className="p-1 rounded-full text-white/50 hover:text-white transition"
                  >
                    {tip.isPinned ? (
                      <MdPushPin size={20} className="text-yellow-400" />
                    ) : (
                      <MdPushPin size={20} />
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(tip)}
                    className="p-2 rounded-full bg-[#fea92a]/20 text-[#fea92a] hover:bg-[#fea92a] hover:text-[#09100d]"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(tip)}
                    className="p-2 rounded-full bg-[#f57cff]/20 text-[#f57cff] hover:bg-[#f57cff] hover:text-[#09100d]"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="h-16"></div>
      {isDeleteModalOpen && <DeleteConfirmationModal />}
      {isEditModalOpen && <EditStatusModal />}
            <button 
        className="fixed bottom-30 right-8 h-16 rounded-full bg-gradient-to-br from-[#fea92a] to-[#855391] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group px-5"
        onClick={() => {navigate('/punter/create')}}
      >
        <FiPlus className="text-2xl group-hover:rotate-90 transition-transform" />
        <span className="ml-2">Create New Tip</span>
      </button>
    </div>
  );
};

export default TipsHistoryMobile;
