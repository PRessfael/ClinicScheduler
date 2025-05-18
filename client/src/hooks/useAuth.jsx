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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData, error } = await supabase
            .from("users")
            .select("username, user_type")
            .eq("email", session.user.email)
            .single();

          if (error) throw error;

          setUser({ username: userData.username, user_type: userData.user_type });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        checkSession();
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
        console.error("Login error: Missing username or password");
        throw new Error("Username and password are required");
      }

      console.log("Attempting to fetch user by username:", username);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, password, user_type")
        .eq("username", username)
        .single();

      if (userError) {
        console.error("Login error: User not found or invalid username:", userError);
        throw new Error("Invalid username or password");
      }

      console.log("User data fetched successfully:", userData);
      console.log("Attempting to authenticate with Supabase using email:", userData.email);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      if (authError) {
        console.error("Login error: Authentication failed:", authError);
        throw new Error("Invalid username or password");
      }

      console.log("Authentication successful. Setting user state.");
      setUser({ username, user_type: userData.user_type });
      return { success: true, user_type: userData.user_type };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (email, password, user_type, username) => {
    try {
      console.log("Attempting to register user with email:", email);
      const { data: session, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error("Registration error: Supabase auth sign-up failed:", error);
        throw error;
      }

      console.log("Supabase auth sign-up successful. Inserting user into 'users' table:", {
        id: session.user.id,
        email,
        password,
        user_type,
        username,
      });
      const { error: insertError } = await supabase
        .from("users")
        .insert({ id: session.user.id, email, password, user_type, username });

      if (insertError) {
        console.error("Registration error: Failed to insert user into 'users' table:", insertError);
        throw insertError;
      }

      console.log("User successfully registered and inserted into 'users' table.");
      setUser({ ...session.user, user_type, username });
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