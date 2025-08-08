import { FaUser, FaWallet, FaChevronRight, FaHistory, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';

const ProfilePage = () => {
  // Mock user data
  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    balance: 1250.75,
    verified: true,
    bonus: 50.00
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#09100d" }}>
      {/* Header */}
      <div className="pt-6 px-4" style={{ backgroundColor: "#162821" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#376553" }}>
              <FaUser className="text-lg" style={{ color: "#efefef" }} />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: "#efefef" }}>{user.name}</h1>
              <p className="text-xs" style={{ color: "#18ffc8" }}>Premium Account</p>
            </div>
          </div>
          {user.verified && (
            <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "#376553", color: "#18ffc8" }}>
              VERIFIED
            </span>
          )}
        </div>

        {/* Balance Card */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#09100d" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: "#f57cff" }}>Main Balance</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold" style={{ color: "#efefef" }}>${user.balance.toFixed(2)}</span>
            <button 
              className="flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium"
              style={{ backgroundColor: "#fea92a", color: "#09100d" }}
            >
              <IoMdAdd className="text-sm" />
              <span>Deposit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Menu */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 uppercase" style={{ color: "#f57cff" }}>Account</h3>
          <div className="space-y-2">
            <MenuItem icon={<FaUser />} title="Personal Information" />
            <MenuItem icon={<FaWallet />} title="Payment Methods" />
            <MenuItem icon={<FaHistory />} title="Transaction History" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 uppercase" style={{ color: "#f57cff" }}>Support</h3>
          <div className="space-y-2">
            <MenuItem icon={<FaQuestionCircle />} title="Help Center" />
            <MenuItem icon={<FaQuestionCircle />} title="Contact Us" />
          </div>
        </div>

        <div className="mt-8">
          <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium" 
            style={{ backgroundColor: "#376553", color: "#efefef" }}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable menu item component
const MenuItem = ({ icon, title }) => (
  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "#162821" }}>
    <div className="flex items-center space-x-3">
      <div style={{ color: "#fea92a" }}>{icon}</div>
      <span style={{ color: "#efefef" }}>{title}</span>
    </div>
    <FaChevronRight style={{ color: "#18ffc8" }} />
  </div>
);

export default ProfilePage;