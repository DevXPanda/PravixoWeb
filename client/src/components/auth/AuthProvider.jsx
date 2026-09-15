import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../../services/authServices";
import api from "../../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async (userData) => {
    try {
      const userId =
        userData?.userId ||
        userData?._id ||
        userData?.id;

      if (!userId) {
        console.warn("No userId available for profile fetch");
        return null;
      }

      const response = await api.get(
        `/profiles/user/${userId}`
      );

      const profileData =
        response?.data?.data ||
        response?.data?.profile ||
        response?.data ||
        null;

      if (profileData) {
        setProfile(profileData);
      }

      return profileData;
    } catch (error) {
      console.error(
        "Fetch profile error:",
        error?.response?.data || error
      );

      setProfile(null);
      return null;
    }
  };

  // =====================================================
  // RESTORE LOGIN SESSION
  // =====================================================

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("Pravixo_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await authApi.getMe();

        console.log("GET ME RESPONSE:", response);

        const currentUser =
          response?.user ||
          response?.data?.user ||
          response?.data ||
          null;

        if (!currentUser) {
          throw new Error("User session not found");
        }

        setUser(currentUser);

        localStorage.setItem(
          "Pravixo_user",
          JSON.stringify(currentUser)
        );

        // First try profile from /auth/me
        let currentProfile =
          response?.profile ||
          response?.data?.profile ||
          currentUser?.profile ||
          null;

        // If /auth/me doesn't contain profile,
        // fetch it using userId
        if (!currentProfile) {
          currentProfile = await fetchProfile(currentUser);
        } else {
          setProfile(currentProfile);
        }
      } catch (error) {
        console.error(
          "Restore session error:",
          error?.response?.data || error
        );

        localStorage.removeItem("Pravixo_token");
        localStorage.removeItem("Pravixo_user");

        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // =====================================================
  // SEND OTP
  // =====================================================

  const sendOtp = async (email) => {
    return await authApi.sendOtp(email);
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOtp = async (email, otp) => {
    return await authApi.verifyOtp(email, otp);
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async ({
    name,
    email,
    password,
    role,
    otp,
    referralCode,
  }) => {
    const response = await authApi.register({
      name,
      email,
      password,
      role,
      otp,
      referralCode,
    });

    console.log("REGISTER RESPONSE:", response);

    const currentUser =
      response?.user ||
      response?.data?.user ||
      null;

    const currentProfile =
      response?.profile ||
      response?.data?.profile ||
      currentUser?.profile ||
      null;

    const token =
      response?.token ||
      response?.accessToken ||
      response?.data?.token ||
      response?.data?.accessToken ||
      null;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("Pravixo_token", token);
    }

    if (currentUser) {
      setUser(currentUser);

      localStorage.setItem(
        "Pravixo_user",
        JSON.stringify(currentUser)
      );
    }

    if (currentProfile) {
      setProfile(currentProfile);
    } else if (currentUser) {
      await fetchProfile(currentUser);
    }

    return response;
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (email, password) => {
    const response = await authApi.login(
      email,
      password
    );

    console.log("LOGIN RESPONSE:", response);

    const currentUser =
      response?.user ||
      response?.data?.user ||
      null;

    const currentProfile =
      response?.profile ||
      response?.data?.profile ||
      currentUser?.profile ||
      null;

    const token =
      response?.token ||
      response?.accessToken ||
      response?.data?.token ||
      response?.data?.accessToken ||
      null;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("Pravixo_token", token);
    }

    if (currentUser) {
      setUser(currentUser);

      localStorage.setItem(
        "Pravixo_user",
        JSON.stringify(currentUser)
      );
    }

    if (currentProfile) {
      setProfile(currentProfile);
    } else if (currentUser) {
      await fetchProfile(currentUser);
    }

    return response;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setProfile(null);

      localStorage.removeItem("token");
      localStorage.removeItem("Pravixo_token");
      localStorage.removeItem("Pravixo_user");
    }
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const forgotPassword = async (email) => {
    return await authApi.forgotPassword(email);
  };

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const resetPassword = async (token, password) => {
    return await authApi.resetPassword(
      token,
      password
    );
  };

  // =====================================================
  // UPDATE USER
  // =====================================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "Pravixo_user",
      JSON.stringify(updatedUser)
    );
  };

  // =====================================================
  // UPDATE PROFILE LOCALLY
  // =====================================================

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  // =====================================================
  // CONTEXT
  // =====================================================

  const value = {
    user,
    profile,
    loading,

    sendOtp,
    verifyOtp,

    register,
    login,
    signOut,

    forgotPassword,
    resetPassword,

    updateUser,
    updateProfile,

    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// useAuth
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}