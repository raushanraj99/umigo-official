import { BrowserRouter as Router, useLocation } from "react-router-dom";
// import CustomCursor from "./components/CustomCursor";
// import { useDarkMode } from "./hooks/useDarkMode";
import { AuthProvider } from "./context/AuthContext";
import { CommonProvider } from "./context/CommonContext";
import Header from "./components/layout/Header";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HangoutProvider } from "./context/HangoutContext";
import { subscribeToPushNotifications } from "./hooks/usePushNotifications";
import { useEffect } from "react";

// Component that handles layout based on current route
function AppLayout() {
  const location = useLocation();

  // Routes that should not show header
  const noHeaderRoutes = ['/login', '/signup', '/reset-password'];

  // Routes that should not show footer
  const noFooterRoutes = ['/login', '/signup', '/reset-password'];

  const showHeader = !noHeaderRoutes.includes(location.pathname);
  const showFooter = !noFooterRoutes.includes(location.pathname);

  useEffect(() => {
    // Automatically ask for permission on first load
    subscribeToPushNotifications();
  }, []);

  return (
    <div className="App min-h-screen w-full bg-[#f9f9f9] text-[#ff5500]">
      <ToastContainer
        position="top-center"
        hideProgressBar
        theme="light"
      />
      {showHeader && <Header />}
      <div>
        {/* space for bottom nav on mobile */}
        <AppRoutes />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CommonProvider>
        <HangoutProvider>
          <Router>
            <AppLayout />
          </Router>
        </HangoutProvider>
      </CommonProvider>
    </AuthProvider>
  );
}

export default App;
