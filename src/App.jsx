// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import localforage from "localforage";
import "./styles/Splash.css";
import SplashScreen from "./pages/Splash"; // Ensure this component handles the conditional navigation
import WelcomeScreen from "./pages/Welcome";
import RegisterScreen from "./pages/Register";
import LoginScreen from "./pages/Login";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerHome from "./pages/customer/Home";
import CustomerFeed from "./pages/customer/Feed";
import CustomerLive from "./pages/customer/Live";
import CustomerProfile from "./pages/customer/Profile";
import CustomerPunters from "./pages/customer/Punters";
import CustomerSearch from "./pages/customer/Search";
import PunterLayout from "./pages/punter/PunterLayout";
import PunterHome from "./pages/punter/Home";
import PunterHistory from "./pages/punter/History";
import PunterLive from "./pages/punter/Live";
import PunterProfile from "./pages/punter/Profile";
import PunterCreate from "./pages/punter/Create";

const ProtectedRoute = ({ children, requiredRole }) => {
  // This component's logic is correct and handles subsequent route protection.
  const [authStatus, setAuthStatus] = React.useState({
    loading: true,
    isAuthenticated: false,
    role: null,
  });

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const [token, role] = await Promise.all([
          localforage.getItem("token"),
          localforage.getItem("role"),
        ]);

        setAuthStatus({
          loading: false,
          isAuthenticated: !!token,
          role: role || null,
        });
      } catch (error) {
        console.error("Error checking auth status:", error);
        setAuthStatus({
          loading: false,
          isAuthenticated: false,
          role: null,
        });
      }
    };

    checkAuth();
  }, []);

  if (authStatus.loading) {
    return (
      <div
           className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center"
         >
           
           {/* Arcs + Logo */}
           <div className="flex flex-col items-center space-y-6">
             <div className="relative w-[18rem] h-[18rem] flex items-center justify-center">
               {/* ... (Your SVG and logo JSX here) */}
               <svg className="absolute w-full h-full spin-slow" viewBox="0 0 100 100">
                 <path
                   d="M50,0 A50,50 0 1,1 0,50"
                   fill="none"
                   stroke="#fea92a"
                   strokeWidth="4"
                   strokeLinecap="round"
                   className="glow-stroke"
                 />
               </svg>
               <svg className="absolute w-[16rem] h-[16rem] spin-medium" viewBox="0 0 100 100">
                 <path
                   d="M50,0 A50,50 0 1,1 0,50"
                   fill="none"
                   stroke="#855391"
                   strokeWidth="4"
                   strokeLinecap="round"
                   className="glow-stroke"
                 />
               </svg>
               <div className="relative flex items-center justify-center w-[13rem] h-[13rem] p-6 border-4 border-[#18ffc8] border-opacity-70 rounded-full animate-pulse">
                 <span className="text-white text-5xl font-bold tracking-widest uppercase">
                   PH
                 </span>
               </div>
             </div>
           </div>
         </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (requiredRole && authStatus.role !== requiredRole) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

const App = () => {
  // We've removed the `useState` and `useEffect` for `showSplash`.
  // The splash screen is now handled as a regular route.
  return (
    <Router>
      <Routes>
        {/* The SplashScreen component now handles all initial logic. */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        <Route
          path="/customer/*"
          element={
            <ProtectedRoute requiredRole="user">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerHome />} />
          <Route path="home" element={<CustomerHome />} />
          <Route path="feed" element={<CustomerFeed />} />
          <Route path="live" element={<CustomerLive />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="punters" element={<CustomerPunters />} />
          <Route path="search" element={<CustomerSearch />} />
        </Route>
        <Route
          path="/punter/*"
          element={
            <ProtectedRoute requiredRole="punter">
              <PunterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PunterHome />} />
          <Route path="home" element={<PunterHome />} />
          <Route path="history" element={<PunterHistory />} />
          <Route path="profile" element={<PunterProfile />} />
          <Route path="live" element={<PunterLive />} />
          <Route path="create" element={<PunterCreate />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;