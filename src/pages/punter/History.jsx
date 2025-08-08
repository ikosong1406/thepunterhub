import { FiTrash2, FiEdit, FiCheck, FiX, FiChevronRight } from 'react-icons/fi'
import { useState } from 'react'
import Header from "./Header"

const TipsHistoryMobile = () => {
  const [tips, setTips] = useState([
    {
      id: 1,
      type: 'forex',
      pair: "EUR/USD",
      direction: "BUY",
      entryPrice: "1.0850",
      takeProfit: "1.0920",
      stopLoss: "1.0800",
      timeFrame: "H4",
      confidence: 75,
      status: "active",
      postedAt: "30 mins ago",
      result: null
    },
    {
      id: 2,
      type: 'crypto',
      pair: "BTC/USDT",
      direction: "SELL",
      entryPrice: "42500",
      takeProfit: "41000",
      stopLoss: "43500",
      timeFrame: "D1",
      confidence: 68,
      status: "closed",
      postedAt: "2 days ago",
      result: "win"
    },
  ])

  const [activeFilter, setActiveFilter] = useState('all')
  const [swipeAction, setSwipeAction] = useState(null)

  const deleteTip = (id) => {
    setTips(tips.filter(tip => tip.id !== id))
  }

  const filteredTips = tips.filter(tip => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'active') return tip.status === 'active'
    if (activeFilter === 'closed') return tip.status === 'closed'
    if (activeFilter === 'settled') return tip.status === 'settled'
    return true
  })

  const getStatusColor = (status, result) => {
    if (result === 'win') return 'bg-[#18ffc8]/20 text-[#18ffc8]'
    if (result === 'loss') return 'bg-[#f57cff]/20 text-[#f57cff]'
    if (status === 'active') return 'bg-[#fea92a]/20 text-[#fea92a]'
    return 'bg-[#376553]/20 text-[#efefef]'
  }

  const getDirectionColor = (direction) => {
    return direction === 'BUY' 
      ? 'bg-green-900/20 text-green-400' 
      : 'bg-red-900/20 text-red-400'
  }

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-4 pb-20">
      <Header />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#09100d] border-b border-[#162821]">
        <div className="flex space-x-2 mt-3 overflow-x-auto pb-2">
          {['all', 'active', 'closed', 'settled'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs capitalize whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-[#fea92a] text-[#09100d]' 
                  : 'bg-[#162821] text-[#efefef]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tips List */}
      <div className="pt-4 space-y-3">
        {filteredTips.length === 0 ? (
          <div className="text-center py-10 text-[#efefef]/50">
            No tips found for this filter
          </div>
        ) : (
          filteredTips.map(tip => (
            <div 
              key={tip.id}
              className="relative overflow-hidden rounded-xl bg-[#162821] border border-[#376553]/30"
            >
              {/* Swipe actions background */}
              <div className="absolute inset-0 flex">
                <div 
                  className="w-1/2 bg-[#fea92a] flex items-center justify-start pl-4"
                  onClick={() => console.log('Edit', tip.id)}
                >
                  <FiEdit className="text-[#09100d]" size={20} />
                </div>
                <div 
                  className="w-1/2 bg-[#f57cff] flex items-center justify-end pr-4"
                  onClick={() => deleteTip(tip.id)}
                >
                  <FiTrash2 className="text-[#09100d]" size={20} />
                </div>
              </div>

              {/* Tip Card - swipeable */}
              <div 
                className="relative bg-[#162821] p-4 transition-transform duration-300"
                style={{ transform: swipeAction === tip.id ? 'translateX(-100%)' : 'translateX(0)' }}
                onTouchStart={(e) => setSwipeAction(tip.id)}
                onTouchEnd={() => setSwipeAction(null)}
              >
                {/* Tip Header */}
                <div className="flex justify-between items-start">
                  <div>
                    {tip.type === 'sports' ? (
                      <h3 className="font-medium">{tip.event}</h3>
                    ) : (
                      <div className="flex items-center">
                        <h3 className="font-medium mr-2">{tip.pair}</h3>
                        {tip.direction && (
                          <span className={`px-2 py-0.5 rounded text-xs ${getDirectionColor(tip.direction)}`}>
                            {tip.direction}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-[#efefef]/70 mt-1">{tip.postedAt}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(tip.status, tip.result)}`}>
                    {tip.result || tip.status}
                  </span>
                </div>

                {/* Tip Details */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {tip.type !== 'sports' ? (
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
                        <p className="text-[#efefef]/70">Market</p>
                        <p>{tip.market}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-[#efefef]/70">Odds</p>
                        <p>{tip.odds}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Confidence Meter */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Confidence Level</span>
                    <span>{tip.confidence}%</span>
                  </div>
                  <div className="w-full bg-[#376553]/30 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        tip.confidence >= 80 ? 'bg-[#18ffc8]' : 
                        tip.confidence >= 60 ? 'bg-[#fea92a]' : 'bg-[#f57cff]'
                      }`}
                      style={{ width: `${tip.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Hidden actions hint */}
                <div className="absolute bottom-2 right-2 text-[#efefef]/30">
                  <FiChevronRight size={18} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-16"></div>
    </div>
  )
}

export default TipsHistoryMobile