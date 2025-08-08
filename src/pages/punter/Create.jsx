import { useState } from 'react'
import { FiPlus, FiX, FiTrendingUp, FiTrendingDown, FiPhone, FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi'
import { FaFutbol, FaChartLine, FaExchangeAlt } from 'react-icons/fa'

const CreateTipPage = () => {
  // Category selection
  const [activeCategory, setActiveCategory] = useState('sports')
  const categories = [
    { key: 'sports', name: 'Sports Betting', icon: <FaFutbol /> },
    { key: 'forex', name: 'Forex Signal', icon: <FaChartLine /> },
    { key: 'crypto', name: 'Crypto Signal', icon: <FaExchangeAlt /> }
  ]

  // Sports betting form state
  const [sportsForm, setSportsForm] = useState({
    site: '',
    code: '',
    startTime: '',
    totalOdd: '',
    confidence: 50,
    matches: [{ teams: '', prediction: '', odd: '' }],
    sport: 'football'
  })

  // Trading signal form state
  const [tradingForm, setTradingForm] = useState({
    pair: '',
    direction: 'BUY',
    entryPrice: '',
    takeProfit: '',
    stopLoss: '',
    timeFrame: 'H4',
    confidence: 50,
    type: activeCategory // forex or crypto
  })

  // Add new match to sports tip
  const addMatch = () => {
    setSportsForm({
      ...sportsForm,
      matches: [...sportsForm.matches, { teams: '', prediction: '', odd: '' }]
    })
  }

  // Remove match from sports tip
  const removeMatch = (index) => {
    const newMatches = [...sportsForm.matches]
    newMatches.splice(index, 1)
    setSportsForm({ ...sportsForm, matches: newMatches })
  }

  // Handle sports match input change
  const handleMatchChange = (index, field, value) => {
    const newMatches = [...sportsForm.matches]
    newMatches[index][field] = value
    setSportsForm({ ...sportsForm, matches: newMatches })
  }

  // Handle trading form input change
  const handleTradingChange = (field, value) => {
    setTradingForm({ ...tradingForm, [field]: value })
  }

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeCategory === 'sports') {
      console.log('Submitting sports tip:', sportsForm)
      // Submit sports tip logic
    } else {
      console.log('Submitting trading signal:', tradingForm)
      // Submit trading signal logic
    }
  }

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#fea92a]">Create New Tip</h1>
        <p className="text-[#efefef]/70">Share your prediction with subscribers</p>
      </div>

      {/* Category Selector */}
      <div className="flex border-b border-[#2a3a34] mb-6">
        {categories.map(category => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${
              activeCategory === category.key 
                ? "text-[#18ffc8] border-b-2 border-[#18ffc8]" 
                : "text-[#efefef]/50"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {activeCategory === 'sports' ? (
          /* Sports Betting Form */
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Betting Site</label>
                <input
                  type="text"
                  value={sportsForm.site}
                  onChange={(e) => setSportsForm({...sportsForm, site: e.target.value})}
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                  placeholder="Bet9ja, 1xBet, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Booking Code</label>
                <input
                  type="text"
                  value={sportsForm.code}
                  onChange={(e) => setSportsForm({...sportsForm, code: e.target.value})}
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                  placeholder="3HG7D"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={sportsForm.startTime}
                    onChange={(e) => setSportsForm({...sportsForm, startTime: e.target.value})}
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none"
                    required
                  />
                  <FiClock className="absolute left-3 top-3 text-[#efefef]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Total Odd</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={sportsForm.totalOdd}
                    onChange={(e) => setSportsForm({...sportsForm, totalOdd: e.target.value})}
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none"
                    placeholder="5.60"
                    required
                  />
                  <FiTrendingUp className="absolute left-3 top-3 text-[#efefef]/50" />
                </div>
              </div>
            </div>

            {/* Sport Selection */}
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">Sport</label>
              <select
                value={sportsForm.sport}
                onChange={(e) => setSportsForm({...sportsForm, sport: e.target.value})}
                className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="cricket">Cricket</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Confidence Slider */}
            <div>
              <label className="block text-sm mb-1 text-[#efefef]/70">
                Confidence: {sportsForm.confidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sportsForm.confidence}
                onChange={(e) => setSportsForm({...sportsForm, confidence: e.target.value})}
                className="w-full h-2 bg-[#376553] rounded-lg appearance-none cursor-pointer"
                style={{
                  backgroundImage: `linear-gradient(to right, #f57cff 0%, #fea92a ${sportsForm.confidence}%, #376553 ${sportsForm.confidence}%, #376553 100%)`
                }}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Matches */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-[#efefef]/70">Matches</label>
                <button
                  type="button"
                  onClick={addMatch}
                  className="text-sm flex items-center text-[#18ffc8]"
                >
                  <FiPlus size={14} className="mr-1" /> Add Match
                </button>
              </div>

              <div className="space-y-3">
                {sportsForm.matches.map((match, index) => (
                  <div key={index} className="bg-[#162821]/50 p-3 rounded-lg border border-[#376553]/30">
                    <div className="flex justify-end">
                      {sportsForm.matches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMatch(index)}
                          className="text-[#f57cff] hover:text-[#f57cff]/70"
                        >
                          <FiX size={18} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1 text-[#efefef]/70">Teams/Event</label>
                        <input
                          type="text"
                          value={match.teams}
                          onChange={(e) => handleMatchChange(index, 'teams', e.target.value)}
                          className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none"
                          placeholder="Chelsea vs Arsenal"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-[#efefef]/70">Prediction</label>
                        <input
                          type="text"
                          value={match.prediction}
                          onChange={(e) => handleMatchChange(index, 'prediction', e.target.value)}
                          className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none"
                          placeholder="Over 2.5 Goals"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-[#efefef]/70">Odd</label>
                        <input
                          type="number"
                          step="0.01"
                          value={match.odd}
                          onChange={(e) => handleMatchChange(index, 'odd', e.target.value)}
                          className="w-full bg-[#162821] border border-[#376553] rounded-lg px-3 py-2 text-sm focus:border-[#fea92a] focus:outline-none"
                          placeholder="1.85"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Trading Signal Form */
          <div className="space-y-4">
            {/* Pair and Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  {activeCategory === 'forex' ? 'Currency Pair' : 'Crypto Pair'}
                </label>
                <input
                  type="text"
                  value={tradingForm.pair}
                  onChange={(e) => handleTradingChange('pair', e.target.value)}
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                  placeholder={activeCategory === 'forex' ? 'EUR/USD' : 'BTC/USDT'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Direction</label>
                <select
                  value={tradingForm.direction}
                  onChange={(e) => handleTradingChange('direction', e.target.value)}
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
            </div>

            {/* Price Levels */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Entry Price</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={tradingForm.entryPrice}
                    onChange={(e) => handleTradingChange('entryPrice', e.target.value)}
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#fea92a] focus:outline-none"
                    required
                  />
                  <FiDollarSign className="absolute left-3 top-3 text-[#efefef]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#18ffc8]">Take Profit</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={tradingForm.takeProfit}
                    onChange={(e) => handleTradingChange('takeProfit', e.target.value)}
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#18ffc8] focus:outline-none"
                    required
                  />
                  <FiTrendingUp className="absolute left-3 top-3 text-[#18ffc8]" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#f57cff]">Stop Loss</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={tradingForm.stopLoss}
                    onChange={(e) => handleTradingChange('stopLoss', e.target.value)}
                    className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 pl-10 focus:border-[#f57cff] focus:outline-none"
                    required
                  />
                  <FiTrendingDown className="absolute left-3 top-3 text-[#f57cff]" />
                </div>
              </div>
            </div>

            {/* Time Frame and Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">Time Frame</label>
                <select
                  value={tradingForm.timeFrame}
                  onChange={(e) => handleTradingChange('timeFrame', e.target.value)}
                  className="w-full bg-[#162821] border border-[#376553] rounded-lg px-4 py-2 focus:border-[#fea92a] focus:outline-none"
                >
                  <option value="M1">M1</option>
                  <option value="M5">M5</option>
                  <option value="M15">M15</option>
                  <option value="M30">M30</option>
                  <option value="H1">H1</option>
                  <option value="H4">H4</option>
                  <option value="D1">D1</option>
                  <option value="W1">W1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#efefef]/70">
                  Confidence: {tradingForm.confidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tradingForm.confidence}
                  onChange={(e) => handleTradingChange('confidence', e.target.value)}
                  className="w-full h-2 bg-[#376553] rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to right, #f57cff 0%, #fea92a ${tradingForm.confidence}%, #376553 ${tradingForm.confidence}%, #376553 100%)`
                  }}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-[#fea92a] to-[#855391] text-[#09100d] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          Publish {activeCategory === 'sports' ? 'Tip' : 'Signal'}
        </button>
      </form>
    </div>
  )
}

export default CreateTipPage