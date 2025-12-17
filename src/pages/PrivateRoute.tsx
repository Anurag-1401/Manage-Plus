import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SplashScreen from "@/components/SplashScreen";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />; // or a spinner


  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If NOT logged in → allow access
  return <Outlet />;
};

export default PrivateRoute;
