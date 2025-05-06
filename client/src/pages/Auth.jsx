import { useState } from "react";
import { useLocation, Link } from "wouter";
import supabase from "../config/supabase";

const Auth = ({ type = "login" }) => {
  const [location, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient", // Default user type
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = type === "login";
  const title = isLogin ? "Login to Your Account" : "Create an Account";
  const buttonText = isLogin ? "Login" : "Register";
  const toggleText = isLogin
    ? "Don't have an account? "
    : "Already have an account? ";
  const toggleLink = isLogin ? "Register" : "Login";
  const toggleUrl = isLogin ? "/register" : "/login";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)
    ) {
      errors.email = "Invalid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!isLogin && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        if (isLogin) {
          // Handle login with Supabase
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          console.log("Auth Data:", authData);
          console.log("Auth Error:", authError);
        
          if (authError) {
            setFormErrors({ general: authError.message });
          } else {
            console.log("Login successful:", authData);
        
            // Fetch user details from the `users` table
            console.log("Fetching user details for email:", formData.email);
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("user_type")
              .eq("email", formData.email)
              .single();
            
            console.log("User Data:", userData);
            console.log("User Error:", userError);
        
            if (userError) {
              setFormErrors({ general: userError.message });
            } else {
              console.log("User type:", userData.user_type);
        
              // Redirect based on user type
              if (userData.user_type === "admin") {
                setLocation("/admin"); // Redirect to admin dashboard
              } else {
                setLocation("/user"); // Redirect to user dashboard
              }
            }
          }
        } else {
          // Handle registration with Supabase
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
          });

          if (error) {
            setFormErrors({ general: error.message });
          } else {
            // Insert additional user data into the `users` table
            const { error: insertError } = await supabase
              .from("users")
              .insert([
                {
                  email: formData.email,
                  password: formData.password, // Consider hashing the password
                  user_type: formData.userType,
                },
              ]);

            if (insertError) {
              setFormErrors({ general: insertError.message });
            } else {
              console.log("Registration successful:", data);
              setLocation("/login"); // Redirect to login page
            }
          }
        }
      } catch (error) {
        setFormErrors({ general: error.message || "An error occurred" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#1e5631] py-6">
          <h2 className="text-center text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {formErrors.general && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{formErrors.general}</span>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                    User Type
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]"
                    value={formData.userType}
                    onChange={handleChange}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4caf50] hover:bg-[#087f23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5631] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : buttonText}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {toggleText}
              <Link href={toggleUrl} className="text-[#1e5631] hover:underline">
                {toggleLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;