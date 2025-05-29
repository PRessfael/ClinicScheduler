import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../hooks/useAuth";

const Auth = ({ type = "login" }) => {
  const [location, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNumber: ""
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

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
        errors.email = "Invalid email address";
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { success, error, user_type } = await login(formData.username, formData.password);
        if (!success) {
          setFormErrors({ general: error });
        } else {
          if (user_type === 'admin') {
            setLocation("/admin/dashboard");
          } else if (user_type === 'doctor') {
            setLocation("/doctor/dashboard");
          } else {
            setLocation("/user/dashboard");
          }
        }
      } else {
        // For registration, set default user type as "user"
        // Admin accounts should be created through a different process
        const { success, error, user_type } = await register(
          formData.email,
          formData.password,
          "user",
          formData.username,
          formData.phoneNumber
        );

        if (!success) {
          if (error.includes("Username already exists")) {
            setFormErrors({ username: "This username is already taken. Please choose another one." });
          } else if (error.includes("Email already")) {
            setFormErrors({ email: "This email is already registered. Please use another email or try logging in." });
          } else if (error.includes("password")) {
            setFormErrors({ password: error });
          } else if (error.includes("Failed to create user profile")) {
            setFormErrors({ general: "There was a problem creating your account. Please try again." });
          } else {
            console.error("Registration error:", error);
            setFormErrors({ general: error });
          }
        } else {
          // After successful registration, redirect based on user type
          if (user_type === 'admin') {
            setLocation("/admin/dashboard");
          } else if (user_type === 'doctor') {
            setLocation("/doctor/dashboard");
          } else {
            // For regular users, always redirect to complete profile
            setLocation("/complete-profile");
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setFormErrors({ general: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
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
            )}            <div>              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {isLogin ? "Username or email" : "Username"}
            </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className={`mt-1 block w-full px-3 py-2 border ${formErrors.username ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                value={formData.username}
                onChange={handleChange}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>

            {/* Password field for login */}
            {isLogin && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className={`mt-1 block w-full px-3 py-2 border ${formErrors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                  value={formData.password}
                  onChange={handleChange}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
            )}

            {/* Registration form fields */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.email ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    autoComplete="tel"
                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Password field for registration */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.password ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={`mt-1 block w-full px-3 py-2 border ${formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-[#1e5631] hover:underline">
                  Forgot your password?
                </a>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4caf50] hover:bg-[#087f23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5631] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  buttonText
                )}
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
