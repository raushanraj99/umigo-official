import { Routes, Route } from "react-router-dom";
import AboutUs from "../pages/AboutUs";
import Features from "../pages/Features";
import Events from "../pages/Events";
import Support from "../pages/Support";
import SignUp from "../pages/auth/SignUp";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import Profile from "../pages/Profile";
import Landing from "../pages/Landing";
import Notifications from "../pages/Notifications";
// import GlowMode from "../pages/GlowMode";
import Chat from "../pages/Chat";
import ProtectedRoute from "../components/ProtectedRoute";
import UserProfile from "../pages/userProfile";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/notifications" element={<Notifications />} />
    {/* <Route path="/glow" element={
     <ProtectedRoute>
       <GlowMode />
   </ProtectedRoute>
    } /> */}
    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />{" "}
    <Route path="/about" element={<AboutUs />} />
    <Route path="/features" element={<Features />} />
    <Route path="/events" element={<Events />} />
    <Route path="/support" element={<Support />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/login" element={<Login />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    {/* <Route path="/profile" element={<Profile />} /> */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />
    {/* <Route path="/profile" element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } /> */}

    <Route path="/user/:id" element={
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    } />
  </Routes>
);

export default AppRoutes;