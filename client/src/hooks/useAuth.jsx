import { createContext, useState, useContext, useEffect } from "react";

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On component mount, try to retrieve user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      // In a real app, this would make a request to a server API
      // For this prototype, we'll simulate a successful login with a mock user
      
      // Find the user by username (would be a server call in a real app)
      const mockedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = mockedUsers.find(u => u.username === username);
      
      if (!foundUser || foundUser.password !== password) {
        return { success: false, error: "Invalid username or password" };
      }
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Set the user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (username, password, role = "user") => {
    try {
      // In a real app, this would make a request to a server API
      // For this prototype, we'll simulate user registration with localStorage
      
      // Get existing users or create empty array
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if username already exists
      if (existingUsers.some(user => user.username === username)) {
        return { success: false, error: "Username already exists" };
      }
      
      // Create the new user
      const newUser = {
        id: Date.now(), // simple ID generation
        username,
        password, // In a real app, NEVER store plain text passwords
        role
      };
      
      // Add to "database"
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      
      // Login the user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Check if user is an admin
  const isAdmin = () => {
    return user?.role === "admin";
  };

  const authContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;