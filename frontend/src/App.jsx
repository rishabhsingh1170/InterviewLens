import { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import LandingPage from "./pages/landingPage";
import Dashboard from "./pages/dashboard";
import Interview from "./pages/interview";
import Login from "./pages/login";
import Signup from "./pages/signup";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070f] flex items-center justify-center text-purple-200">
        Loading...
      </div>
    );
  }

  return (
    <div className="pt-[8vh] min-h-screen bg-[#07070f] overflow-hidden">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/interview"
          element={user ? <Interview /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
