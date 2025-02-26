import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect unauthrized users to login
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
