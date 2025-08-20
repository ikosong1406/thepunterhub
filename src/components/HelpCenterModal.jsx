import React, { useState } from 'react';
import { FaQuestionCircle, FaSearch, FaTimes, FaArrowLeft, FaChevronRight } from 'react-icons/fa';

const HelpCenterModal = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      id: 'account',
      title: 'Account & Profile',
      icon: <FaQuestionCircle className="mr-2" />,
      questions: [
        {
          id: 'change-email',
          question: 'How do I change my email address?',
          answer: 'Currently, email addresses cannot be changed for security reasons. Please contact support if you need assistance with your account email.'
        },
        {
          id: 'update-profile',
          question: 'How do I update my profile information?',
          answer: 'Go to your Profile page and tap "Edit Profile". You can update your name, phone number, and other details there.'
        },
        {
          id: 'delete-account',
          question: 'How do I delete my account?',
          answer: 'Account deletion can be requested by contacting our support team. Please note this action is irreversible.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Coins',
      icon: <FaQuestionCircle className="mr-2" />,
      questions: [
        {
          id: 'buy-coins',
          question: 'How do I buy coins?',
          answer: 'Navigate to the Buy Coins section in your profile. Select your preferred package and follow the payment instructions.'
        },
        {
          id: 'failed-payment',
          question: 'What should I do if my payment fails?',
          answer: 'First, check your payment method details. If the issue persists, wait 10 minutes and try again. Contact support if you were charged but didn\'t receive coins.'
        },
        {
          id: 'refund',
          question: 'Can I get a refund for purchased coins?',
          answer: 'Coin purchases are generally non-refundable. In exceptional circumstances, contact support with your transaction details.'
        }
      ]
    },
    {
      id: 'subscriptions',
      title: 'Punter Subscriptions',
      icon: <FaQuestionCircle className="mr-2" />,
      questions: [
        {
          id: 'subscribe',
          question: 'How do I subscribe to a punter?',
          answer: 'Visit the Punters section, select a punter you like, and tap "Subscribe". You\'ll need sufficient coins in your balance.'
        },
        {
          id: 'unsubscribe',
          question: 'How do I unsubscribe from a punter?',
          answer: 'Go to your Profile > Subscriptions, find the punter and tap "Unsubscribe". Your subscription will remain active until the current period ends.'
        },
        {
          id: 'subscription-cost',
          question: 'How much does a punter subscription cost?',
          answer: 'Subscription costs vary by punter and are clearly displayed before you subscribe. Most range from 200-1000 coins per month.'
        }
      ]
    }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleBackToCategories = () => {
    setActiveQuestion(null);
    setActiveCategory(null);
  };

  const handleQuestionSelect = (categoryId, questionId) => {
    setActiveCategory(categoryId);
    setActiveQuestion(questionId);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          {activeQuestion ? (
            <button 
              onClick={handleBackToCategories}
              className="mr-4 p-1 rounded-full"
              style={{ color: "#efefef" }}
            >
              <FaArrowLeft size={18} />
            </button>
          ) : null}
          <h2 
            className="text-xl font-bold flex-1"
            style={{ color: "#efefef" }}
          >
            {activeQuestion ? 'Help Answer' : 'Help Center'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Search Bar */}
        {!activeQuestion && (
          <div className="px-6 py-4">
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ backgroundColor: "#162821" }}
            >
              <input
                type="text"
                placeholder="Search help articles..."
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
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {activeQuestion ? (
            // Question Detail View
            <div>
              {filteredCategories.map(category => (
                category.questions.map(question => (
                  question.id === activeQuestion && (
                    <div key={question.id}>
                      <h3 
                        className="text-lg font-semibold mb-4"
                        style={{ color: "#efefef" }}
                      >
                        {question.question}
                      </h3>
                      <div 
                        className="p-4 rounded-lg mb-6"
                        style={{ backgroundColor: "#162821", color: "#efefef" }}
                      >
                        {question.answer}
                      </div>
                      <div className="mb-6">
                        <h4 
                          className="text-sm font-semibold mb-2"
                          style={{ color: "#f57cff" }}
                        >
                          Was this helpful?
                        </h4>
                        <div className="flex space-x-3">
                          <button
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: "#376553", color: "#efefef" }}
                          >
                            Yes
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: "#376553", color: "#efefef" }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ))
              ))}
            </div>
          ) : activeCategory ? (
            // Category Questions List
            <div>
              <button
                onClick={handleBackToCategories}
                className="flex items-center mb-6 text-sm font-medium"
                style={{ color: "#18ffc8" }}
              >
                <FaArrowLeft className="mr-2" />
                Back to all categories
              </button>
              
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: "#efefef" }}
              >
                {helpCategories.find(c => c.id === activeCategory)?.icon}
                {helpCategories.find(c => c.id === activeCategory)?.title}
              </h3>
              
              <div className="space-y-3">
                {helpCategories.find(c => c.id === activeCategory)?.questions.map(question => (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionSelect(activeCategory, question.id)}
                    className="p-4 rounded-lg cursor-pointer"
                    style={{ backgroundColor: "#162821" }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: "#efefef" }}>{question.question}</span>
                      <FaChevronRight style={{ color: "#18ffc8" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Main Categories List
            <div className="space-y-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <div
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className="p-4 rounded-lg cursor-pointer"
                    style={{ backgroundColor: "#162821" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {category.icon}
                        <span style={{ color: "#efefef" }}>{category.title}</span>
                      </div>
                      <FaChevronRight style={{ color: "#18ffc8" }} />
                    </div>
                    <div className="mt-2 text-xs" style={{ color: "#376553" }}>
                      {category.questions.length} articles
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: "#162821", color: "#efefef" }}
                >
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModal;