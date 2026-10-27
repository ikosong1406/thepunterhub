import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import localforage from "localforage";

import logoImage from "./assets/logo3.png";
import "./styles/Splash.css";

import SplashScreen from "./pages/Splash";
import RegisterScreen from "./pages/Register";
import LoginScreen from "./pages/Login";
import ForgetScreen from "./pages/Forgot";

import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerHome from "./pages/customer/Home";
import CustomerFeed from "./pages/customer/Feed";
import CustomerLive from "./pages/customer/Live";
import CustomerProfile from "./pages/customer/Profile";
import CustomerCreate from "./pages/customer/Create";
import Success from "./pages/customer/Success";
import Cancel from "./pages/customer/Cancel";

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = React.useState({
    loading: true,
    isAuthenticated: false,
    role: null,
  });

  React.useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const [token, role] = await Promise.all([
          localforage.getItem("token"),
          localforage.getItem("role"),
        ]);

        if (isMounted) {
          setAuthStatus({
            loading: false,
            isAuthenticated: !!token,
            role: role || null,
          });
        }
      } catch (error) {
        console.error("Error checking auth status:", error);

        if (isMounted) {
          setAuthStatus({
            loading: false,
            isAuthenticated: false,
            role: null,
          });
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authStatus.loading) {
    return (
      <div className="bg-[#09100d] flex flex-col items-center justify-center w-screen h-screen bg-cover bg-center text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-[18rem] h-[18rem] flex items-center justify-center">
            <svg
              className="absolute w-full h-full spin-slow"
              viewBox="0 0 100 100"
            >
              <path
                d="M50,0 A50,50 0 1,1 0,50"
                fill="none"
                stroke="#fea92a"
                strokeWidth="4"
                strokeLinecap="round"
                className="glow-stroke"
              />
            </svg>

            <svg
              className="absolute w-[16rem] h-[16rem] spin-medium"
              viewBox="0 0 100 100"
            >
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
              <img
                src={logoImage}
                alt="Platform Logo"
                className="max-w-full max-h-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot" element={<ForgetScreen />} />

        <Route
          element={
            <ProtectedRoute>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<CustomerHome />} />
          <Route path="/feed" element={<CustomerFeed />} />
          <Route path="/create" element={<CustomerCreate />} />
          <Route path="/live" element={<CustomerLive />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
