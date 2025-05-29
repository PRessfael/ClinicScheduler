import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.ts";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import AppointmentDashboard from "@/pages/AppointmentDashboard";

import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/Dashboard";
import UserDashboard from "@/pages/user/Dashboard";
import DoctorDashboard from "@/pages/doctor/Dashboard";
import Profile from "@/pages/Profile";
import CompleteProfile from "@/pages/CompleteProfile";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { UserRoute, AdminRoute, ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ManageSchedules from "@/pages/ManageSchedules";

function Dashboard() {
  const { user, isAdmin, isDoctor } = useAuth();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPatientProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Skip patient check for admin and doctor users
      if (isAdmin() || isDoctor()) {
        setLoading(false);
        if (isAdmin()) {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/doctor/dashboard");
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('patient_id, first_name, last_name')
          .eq('user_id', user.id)
          .single();

        if (error || !data || (!data.first_name && !data.last_name)) {
          // No patient profile found or incomplete profile, redirect to complete profile
          setLocation("/complete-profile");
        } else {
          // Patient profile exists and is complete, redirect to dashboard
          setLocation("/user/dashboard");
        }
      } catch (error) {
        console.error("Error checking patient profile:", error);
        // In case of error, redirect to complete profile
        setLocation("/complete-profile");
      } finally {
        setLoading(false);
      }
    };

    checkPatientProfile();
  }, [user, isAdmin, isDoctor, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return null;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/admin">
            <AdminRoute component={AdminDashboard} />
          </Route>
          <Route path="/user/dashboard" component={UserDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/doctor/dashboard" component={DoctorDashboard} />
          <Route path="/profile">
            <ProtectedRoute component={Profile} />
          </Route>
          <Route path="/complete-profile">
            <ProtectedRoute component={CompleteProfile} />
          </Route>
          <Route path="/appointments">
            <UserRoute component={Appointments} />
          </Route>
          <Route path="/appointment-dashboard">
            <ProtectedRoute component={AppointmentDashboard} adminOnly={false} />
          </Route>
          <Route path="/manage-schedules">
            <ProtectedRoute component={ManageSchedules} allowedRoles={["admin"]} />
          </Route>

          <Route path="/login">
            {user ? <Dashboard /> : <Auth type="login" />}
          </Route>
          <Route path="/register">
            {user ? <Dashboard /> : <Auth type="register" />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
