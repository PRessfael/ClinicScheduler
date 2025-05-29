import { useState } from "react";
import { Link, useLocation } from "wouter";
import MobileMenu from "./MobileMenu";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Define navigation links based on user role
  let navLinks = [
    { href: "/", label: "Home" },
  ];
  if (user) {
    // Add dashboard link based on user type
    const dashboardPath = user.user_type === "admin"
      ? "/admin/dashboard"
      : user.user_type === "doctor"
        ? "/doctor/dashboard"
        : "/user/dashboard";
    navLinks.push({ href: dashboardPath, label: "Dashboard" });

    if (user.user_type === "admin") {
      // Admin-specific links
      navLinks.push({ href: "/appointment-dashboard", label: "Appointments" });
    } else if (user.user_type === "doctor") {
      // Add Home and Contact Us links back to the doctor navigation bar
      navLinks = [
        { href: "/", label: "Home" },
        { href: "/doctor/dashboard", label: "Clinic Dashboard" },
        { href: "/appointment-dashboard", label: "Appointments" },
      ];
    } else {
      // Regular user links
      navLinks.push({ href: "/appointments", label: "My Appointments" });
    }
  }
  const handleLogout = async (e) => {
    e.preventDefault();
    console.log("Starting logout process...");
    try {
      await logout();
      console.log("Logout successful");
      setLocation("/"); // Redirect to home page after successful logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-[#1e5631] shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-white text-2xl font-bold">
          MyClinic
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-white${location !== link.href ? "/90 hover:text-white text-white" : ""
                } font-medium px-2 py-1 ${location === link.href
                  ? "border-b-2 border-white"
                  : "hover:border-b-2 hover:border-white transition-all"
                }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex space-x-2 ml-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-white px-4 py-1.5 font-medium hover:text-[#ffd700] transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#ffd700] text-[#1e5631] px-4 py-1.5 rounded-md font-semibold hover:bg-[#ffff52] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-[#ffd700] text-[#1e5631] px-4 py-1.5 rounded-md font-semibold hover:bg-[#ffff52] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#ffd700] text-[#1e5631] px-4 py-1.5 rounded-md font-semibold hover:bg-[#ffff52] transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={toggleMobileMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        currentPath={location}
        user={user}
        logout={handleLogout}
        navLinks={navLinks}
      />
    </header>
  );
};

export default Navbar;
