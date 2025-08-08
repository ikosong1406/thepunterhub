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
import CustomerFeed from "./pages/customer/Feed"
import CustomerLive from "./pages/customer/Live"
import CustomerProfile from "./pages/customer/Profile";
import CustomerPunters from "./pages/customer/Punters"
import CustomerSearch from "./pages/customer/Search";
import PunterLayout from "./pages/punter/PunterLayout";
import PunterHome from "./pages/punter/Home";
import PunterHistory from "./pages/punter/History";
import PunterLive from "./pages/punter/Live";
import PunterProfile from "./pages/punter/Profile";
import PunterCreate from "./pages/punter/Create";

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
          <Route path="feed" element={<CustomerFeed />} />
          <Route path="live" element={<CustomerLive />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="punters" element={<CustomerPunters />} />
          <Route path="search" element={<CustomerSearch />} />
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
