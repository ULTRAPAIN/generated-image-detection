/* eslint-disable react/prop-types */
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Collaboration from "./components/Collaboration";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Roadmap from "./components/Roadmap";
import Services from "./components/Services";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FloatingShape from "./components/FloatingShape";
import AstronautSpinner from "./components/AstronautSpinner";
import DashboardPage from "./pages/DashboardPage"

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// ProtectedRoute for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

// RedirectAuthenticatedUser: For redirecting authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AuthFloatingShapes = () => {
  return (
    <>
      <FloatingShape color="bg-green-500" size="w-64 h-64" top="5%" left="10%" delay={0} />
      <FloatingShape color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShape color="bg-lime-500" size="w-32 h-32" top="40%" left="10%" delay={2} />
    </>
  );
};

const AppContent = () => {
  const location = useLocation();
  
  // Define auth-related routes
  const authRoutes = ["/signup", "/login", "/forgot-password", "/verify-email", "/reset-password"];

  return (
    <div className=" overflow-hidden">
      {/* Show FloatingShapes only on auth pages */}
      {authRoutes.some((route) => location.pathname.startsWith(route)) && <AuthFloatingShapes />}

      <Routes>
        {/* Default landing page route */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Hero />
              <Benefits />
              <Collaboration />
              <Services />
              <Roadmap />
              <Footer />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage/>
          </ProtectedRoute>
          }
        />

        {/* Routes for unauthenticated users */}
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
              <ResetPasswordPage />
          }
        />

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
};

const App = () => {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <AstronautSpinner />;

  return (
    <Router>
      <AppContent />
      <ButtonGradient />
    </Router>
  );
};

export default App;
