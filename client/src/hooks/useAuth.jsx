import { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Import Supabase client

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On component mount, check for an active session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("*, user_type")
          .eq("id", session.user.id)
          .single();

        if (!error) {
          setUser({ ...session.user, user_type: userData.user_type });
        }
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // Fetch user by username
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, password, user_type")
        .eq("username", username)
        .single();

      if (userError) throw new Error("Invalid username or password");

      // Authenticate with Supabase using the email and password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      if (authError) throw new Error("Invalid username or password");

      // Set user in state
      setUser({ username, user_type: userData.user_type });
      return { success: true, user_type: userData.user_type };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (email, password, user_type) => {
    try {
      const { data: session, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const { error: insertError } = await supabase
        .from("users")
        .insert({ id: session.user.id, email, user_type });

      if (insertError) throw insertError;

      setUser({ ...session.user, user_type });
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Check if user is an admin
  const isAdmin = () => user?.user_type === "admin";

  // Check if user is a doctor
  const isDoctor = () => user?.user_type === "doctor";

  // Check if user is a regular user
  const isUser = () => user?.user_type === "user";

  const authContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isDoctor,
    isUser
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