import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../hooks/useAuth";

// Protected route component that checks if the user is logged in
export const ProtectedRoute = ({ component: Component, adminOnly = false, ...rest }) => {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        navigate("/login");
      } else if (adminOnly && user.user_type !== "admin" && user.user_type !== "doctor") {
        // Not an admin or doctor, but trying to access admin/doctor route
        navigate("/dashboard");
      }
    }
  }, [user, loading, adminOnly, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  // Only render the component if auth check passed
  if (!user || (adminOnly && user.user_type !== "admin")) {
    return null;
  }

  return <Component {...rest} />;
};

// Admin route component
export const AdminRoute = ({ component, ...rest }) => {
  return <ProtectedRoute component={component} adminOnly={true} {...rest} />;
};

// User route component (any authenticated user)
export const UserRoute = ({ component, ...rest }) => {
  return <ProtectedRoute component={component} {...rest} />;
};