import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.ts";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Appointments from "@/pages/Appointments";
import AppointmentDashboard from "@/pages/AppointmentDashboard";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/Dashboard";
import UserDashboard from "@/pages/user/Dashboard";
import DoctorDashboard from "@/pages/doctor/Dashboard";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { UserRoute, AdminRoute, ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Dashboard() {
  const { user, isAdmin, isDoctor } = useAuth();
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  if (isAdmin()) {
    return <Redirect to="/admin/dashboard" />;
  } else if (isDoctor()) {
    return <Redirect to="/doctor/dashboard" />;
  } else {
    return <Redirect to="/user/dashboard" />;
  }
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
          <Route path="/appointments">
            <UserRoute component={Appointments} />
          </Route>          <Route path="/appointment-dashboard">
            <ProtectedRoute component={AppointmentDashboard} adminOnly={false} />
          </Route>
          <Route path="/contact" component={Contact} />          <Route path="/login">
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
