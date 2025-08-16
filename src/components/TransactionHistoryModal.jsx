import React, { useState } from 'react';
import { FaArrowLeft, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';

const TransactionHistoryModal = ({ onClose }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 1,
      type: 'Deposit',
      amount: 1000,
      date: '2023-07-15T14:30:00Z',
      status: 'completed',
      reference: 'DEP-789456123'
    },
    {
      id: 2,
      type: 'Withdrawal',
      amount: 500,
      date: '2023-07-10T09:15:00Z',
      status: 'completed',
      reference: 'WDL-321654987'
    },
    {
      id: 3,
      type: 'Bet',
      amount: 200,
      date: '2023-07-05T16:45:00Z',
      status: 'lost',
      reference: 'BET-147258369'
    },
    {
      id: 4,
      type: 'Bet',
      amount: 300,
      date: '2023-07-01T20:15:00Z',
      status: 'won',
      reference: 'BET-369258147'
    },
    {
      id: 5,
      type: 'Deposit',
      amount: 2000,
      date: '2023-06-25T11:30:00Z',
      status: 'failed',
      reference: 'DEP-987654321'
    },
  ];

  const filteredTransactions = transactions
    .filter(tx => 
      (activeFilter === 'all' || tx.type.toLowerCase() === activeFilter) &&
      (tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
       tx.type.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <h2 
            className="text-xl font-bold"
            style={{ color: "#efefef" }}
          >
            Transaction History
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 flex flex-col space-y-3">
          {/* Search Bar */}
          <div 
            className="relative rounded-lg overflow-hidden"
            style={{ backgroundColor: "#162821" }}
          >
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-4 pr-10 focus:outline-none"
              style={{ backgroundColor: "#162821", color: "#efefef" }}
            />
            <div 
              className="absolute right-3 top-3"
              style={{ color: "#f57cff" }}
            >
              <FaSearch size={16} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {['all', 'deposit', 'withdrawal', 'bet'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === filter ? 'bg-[#18ffc8] text-black' : 'bg-gray text-white'
                }`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-2 overflow-y-auto">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map(tx => (
                <div 
                  key={tx.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#162821" }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 
                        className="font-medium"
                        style={{ color: "#efefef" }}
                      >
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </h3>
                      <p 
                        className="text-xs"
                        style={{ color: "#376553" }}
                      >
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p 
                        className={`font-bold ${
                          tx.type === 'deposit' ? 'text-blue' : 'text-white'
                        }`}
                      >
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount} coins
                      </p>
                      <p 
                        className="text-xs capitalize"
                        style={{ color: getStatusColor(tx.status) }}
                      >
                        {tx.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p 
                      className="text-xs"
                      style={{ color: "#376553" }}
                    >
                      Ref: {tx.reference}
                    </p>
                    <button 
                      className="text-xs flex items-center"
                      style={{ color: "#fea92a" }}
                    >
                      <FiDownload className="mr-1" />
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="p-8 text-center rounded-lg"
              style={{ backgroundColor: "#162821" }}
            >
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

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t text-center"
          style={{ borderColor: "#376553" }}
        >
          <button
            className="text-sm font-medium"
            style={{ color: "#18ffc8" }}
          >
            View Full Transaction History
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;