// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import SplashScreen from "./pages/Splash";
import WelcomeScreen from "./pages/Welcome";
import RegisterScreen from "./pages/Register";
import LoginScreen from "./pages/Login";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerHome from "./pages/customer/Home";
import CustomerDiscover from "./pages/customer/Discover"
import PunterLayout from "./pages/punter/PunterLayout";
import PunterHome from "./pages/punter/Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        <Route
          path="/customer/*"
          element={
            // <ProtectedRoute>
            <CustomerLayout />
            // {/* </ProtectedRoute> */}
          }
        >
          <Route index element={<CustomerHome />} />
          <Route path="home" element={<CustomerHome />} />
          <Route path="discover" element={<CustomerDiscover />} />
          {/* <Route path="history" element={<History />} />
            <Route path="wallet" element={<WalletScreen />} />
            <Route path="profile" element={<Profile />} /> */}
        </Route>
        <Route
          path="/punter/*"
          element={
            // <ProtectedRoute>
            <PunterLayout />
            // {/* </ProtectedRoute> */}
          }
        >
          <Route index element={<PunterHome />} />
          <Route path="home" element={<PunterHome />} />
          {/* <Route path="history" element={<History />} />
          <Route path="wallet" element={<WalletScreen />} />
          <Route path="profile" element={<Profile />} /> */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
