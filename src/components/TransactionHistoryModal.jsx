import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import Api from "../components/Api";

const TransactionHistoryModal = ({ user, onClose }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPositiveTransaction = (type) => ['deposit', 'payment'].includes(type);

  const fetchTransactions = useCallback(async () => {
    if (!user?._id) {
      setIsLoading(false);
      setError("User data not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${Api}/client/getTransaction`, { userId: user._id });
      setTransactions(response.data.transactions);
    } catch (err) {
      setError("Failed to fetch transactions.");
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions
    .filter(tx =>
      (activeFilter === 'all' || tx.type.toLowerCase() === activeFilter) &&
      (tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.amount && parseFloat(tx.amount).toFixed(1).includes(searchQuery))
      )
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'won':
        return '#18ffc8';
      case 'failed':
      case 'lost':
        return '#f57cff';
      default:
        return '#efefef';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "#09100d" }}>
        <p style={{ color: "#efefef" }}>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#09100d" }}>
      <div className="min-h-screen flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center border-b" style={{ borderColor: "#376553" }}>
          <h2 className="text-xl font-bold" style={{ color: "#efefef" }}>
            Transaction History
          </h2>
          <button onClick={onClose} className="p-1 rounded-full" style={{ color: "#efefef" }}>
            <FaTimes size={20} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col space-y-3">
          <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: "#162821" }}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-4 pr-10 focus:outline-none"
              style={{ backgroundColor: "#162821", color: "#efefef" }}
            />
            <div className="absolute right-3 top-3" style={{ color: "#f57cff" }}>
              <FaSearch size={16} />
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {['all', 'deposit', 'withdrawal', 'subscription', 'payment'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === filter ? 'bg-[#18ffc8] text-black' : 'bg-gray text-white'}`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-6 py-2 overflow-y-auto">
          {error ? (
            <div className="p-8 text-center" style={{ color: "#f57cff" }}>
              {error}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map(tx => (
                <div
                  key={tx._id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#162821" }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium" style={{ color: "#efefef" }}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </h3>
                      <p className="text-xs" style={{ color: "#376553" }}>
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold`}
                        style={{ color: isPositiveTransaction(tx.type) ? '#18ffc8' : '#f57cff' }}
                      >
                        {parseFloat(tx.amount).toFixed(1)} coins
                      </p>
                      <p
                        className="text-xs capitalize"
                        style={{ color: getStatusColor(tx.status) }}
                      >
                        {tx.status}
                      </p>
                    </div>
                  </div>
                  {tx.reference && (
                    <p className="text-xs" style={{ color: "#376553" }}>
                      Reference: {tx.reference}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-lg" style={{ backgroundColor: "#162821" }}>
              <p style={{ color: "#efefef" }}>No transactions found</p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="mt-2 text-sm"
                  style={{ color: "#18ffc8" }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;