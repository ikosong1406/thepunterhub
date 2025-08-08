import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrendingUp, FiUsers, FiDollarSign, FiBarChart2, FiChevronRight } from 'react-icons/fi'
import Header from "./Header"

const PunterDashboard = () => {
  const navigate = useNavigate();

  // Dashboard metrics
  const stats = [
    { title: "Total Subscribers", value: "1,248", change: "+12%", icon: <FiUsers className="text-xl" /> },
    { title: "Monthly Earnings", value: "$3,845", change: "+18%", icon: <FiDollarSign className="text-xl" /> },
    { title: "Win Rate", value: "72%", change: "+3%", icon: <FiBarChart2 className="text-xl" /> },
  ]

  // Recent activity
  const recentActivity = [
    { id: 1, action: "New subscriber", user: "John D.", time: "2 mins ago", amount: "+$10" },
    { id: 2, action: "Tip won", details: "BTC prediction", time: "1 hour ago", amount: null },
    { id: 3, action: "Subscription renewed", user: "Sarah M.", time: "3 hours ago", amount: "+$20" },
    { id: 4, action: "New tip posted", details: "NBA playoffs", time: "5 hours ago", amount: null },
  ]

  // Performance data for chart
  const performanceData = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 72 },
    { day: "Wed", value: 80 },
    { day: "Thu", value: 68 },
    { day: "Fri", value: 75 },
    { day: "Sat", value: 82 },
    { day: "Sun", value: 78 },
  ]

  return (
    <div className="min-h-screen bg-[#09100d] text-[#efefef] p-6">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, <span className="font-medium text-[#fea92a]">ProPunter22</span></h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30 hover:border-[#fea92a]/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#efefef]/70 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#376553]/20 text-[#fea92a]">
                  {stat.icon}
                </div>
              </div>
              <p className={`text-xs mt-3 ${parseFloat(stat.change) >= 0 ? 'text-[#f57cff]' : 'text-[#f57cff]'}`}>
                {stat.change} {stat.title.includes('%') ? 'this month' : 'from last week'}
              </p>
            </div>
          ))}
        </div>

        {/* Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Performance Analytics</h2>
              <select className="bg-[#376553]/30 text-sm rounded-lg px-3 py-1 border border-[#376553]/50 focus:border-[#fea92a] focus:outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            
            {/* Chart Visualization */}
            <div className="h-64 relative">
              <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end h-full px-2">
                {performanceData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center w-8">
                    <div 
                      className="w-4 bg-gradient-to-t from-[#fea92a] to-[#855391] rounded-t-sm transition-all duration-500"
                      style={{ height: `${data.value * 0.7}%` }}
                    ></div>
                    <span className="text-xs mt-1 text-[#efefef]/50">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#fea92a] mr-2"></div>
                <span>Win Rate</span>
              </div>
              <div className="text-[#18ffc8] font-medium">+7.2% from last week</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#162821]/80 backdrop-blur-sm rounded-xl p-5 border border-[#376553]/30">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-sm text-[#fea92a] hover:underline">View All</button>
          </div>
          
          <div className="divide-y divide-[#376553]/30">
            {recentActivity.map(activity => (
              <div key={activity.id} className="py-3 flex justify-between items-center">
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-[#376553]/20 text-[#fea92a] mr-3">
                    {activity.icon || <FiUsers className="text-lg" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-[#efefef]/70">
                      {activity.user || activity.details} · {activity.time}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <span className="text-[#18ffc8] font-medium">{activity.amount}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-30 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#fea92a] to-[#855391] flex items-center justify-center shadow-lg hover:shadow-xl transition-all group"
        onClick={() => {navigate('/punter/create')}}
      >
        <FiPlus className="text-2xl text-[#09100d] group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  )
}

export default PunterDashboard