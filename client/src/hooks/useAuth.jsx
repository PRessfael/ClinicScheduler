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

          setUser({ id: session.user.id, username: userData.username, user_type: userData.user_type });
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
  const login = async (identifier, password) => {
    try {
      if (!identifier || !password) {
        throw new Error("Username/Email and password are required");
      }

      // First find the user to get their email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, user_type, username")
        .or(`username.eq."${identifier}",email.eq."${identifier}"`)
        .single();

      if (userError || !userData) {
        console.error("User lookup error:", userError);
        throw new Error("Invalid username/email or password");
      }

      // Then attempt to sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Invalid username/email or password");
      }

      if (!data?.user) {
        throw new Error("Login failed");
      }

      // Set user state with the correct information
      setUser({
        id: data.user.id,
        username: userData.username,
        user_type: userData.user_type
      });

      return { success: true, user_type: userData.user_type };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };  // Register function
  const register = async (email, password, user_type, username) => {
    try {
      // First check if username or email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username, email")
        .or(`username.eq.${username},email.eq.${email}`)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no user found

      // Only throw if there's an error and it's not a "no rows" error
      if (checkError) {
        console.error("User check error:", checkError);
        throw new Error("Failed to check existing user");
      }

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error("Username already exists");
        }
        if (existingUser.email === email) {
          throw new Error("Email already exists");
        }
      }

      // Sign up user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            user_type
          }
        }
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw new Error("Registration failed: " + signUpError.message);
      }

      if (!data?.user?.id) {
        throw new Error("Registration failed: No user ID received");
      }      try {
        // Insert user into our custom users table
        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: email,
            username: username,
            user_type: user_type,
            created_at: new Date().toISOString(),
            password: '**********' // Adding a placeholder since the column is required, but never used
          });

        if (insertError) {
          console.error("User insert error:", insertError);
          // If insertion fails, clean up the auth user
          await supabase.auth.signOut();
          throw new Error("Failed to create user profile: " + insertError.message);
        }

        // Generate a patient ID in format P + YYMMDDxxxx (where xxxx is random)
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newPatientId = `P${year}${month}${day}${random}`.substring(0, 10);
        
        // Create a patient record for the user
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .insert({
            patient_id: newPatientId,
            user_id: data.user.id,  // Link patient to user
            first_name: username,  // Use username as first name initially
            last_name: "",        // Empty last name initially
            age: null            // Age can be updated later
          })
          .select()
          .single();

        if (patientError) {
          console.error("Patient creation error:", patientError);
          // If patient creation fails, clean up the user
          await supabase.auth.signOut();
          throw new Error("Failed to create patient record: " + patientError.message);
        }

        // Create initial patient record
        const { error: recordError } = await supabase
          .from("patient_records")
          .insert({
            patient_id: patientData.patient_id,
            diagnosis: "New patient registration",
            treatment: null
          });

        if (recordError) {
          console.error("Patient record creation error:", recordError);
          // If record creation fails, clean up everything
          await supabase.auth.signOut();
          throw new Error("Failed to create patient record: " + recordError.message);
        }

        // Set user state immediately after successful registration
        setUser({
          id: data.user.id,
          username: username,
          user_type: user_type
        });

        return { success: true, user_type: user_type };
      } catch (error) {
        console.error("User creation error:", error);
        // If insertion fails, clean up the auth user
        await supabase.auth.signOut();
        throw new Error("Failed to complete registration. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed. Please try again."
      };
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