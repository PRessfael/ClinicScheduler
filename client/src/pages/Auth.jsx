import { useState } from "react";
import { useLocation, Link } from "wouter";

const Auth = ({ type = "login" }) => {
  const [location, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!isLogin && !formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !isLogin && 
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
      // In a real app, this would make an API call to authenticate or register
      // For now, simulate success and redirect
      alert(`${isLogin ? "Login" : "Registration"} successful!`);
      setLocation("/");
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
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.username ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-[#1e5631] focus:border-[#1e5631]`}
                value={formData.username}
                onChange={handleChange}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>

            {!isLogin && (
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
            )}

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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4caf50] hover:bg-[#087f23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5631]"
              >
                {buttonText}
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
