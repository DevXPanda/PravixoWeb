import api from "../lib/api";

export const authApi = {
  // =========================
  // LOGIN
  // =========================
  login: async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  // =========================
  // REGISTER
  // =========================
  register: async ({
    role,
    email,
    name,
    password,
    otp,
    referralCode,
  }) => {
    const response = await api.post("/auth/register", {
      role,
      email,
      name,
      password,
      otp,
      referralCode,
    });

    return response.data;
  },

  // =========================
  // GET CURRENT USER
  // =========================
  getMe: async () => {
    const response = await api.get("/auth/me");

    return response.data;
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");

      return response.data;
    } catch {
      return null;
    }
  },

  // =========================
  // SEND OTP
  // =========================
  sendOtp: async (email) => {
    const response = await api.post("/otp/send", {
      email,
    });

    return response.data;
  },

  // =========================
  // VERIFY OTP
  // =========================
  verifyOtp: async (email, otp) => {
    const response = await api.post("/otp/verify", {
      email,
      otp,
    });

    return response.data;
  },

  // =========================
  // FORGOT PASSWORD
  // =========================
  forgotPassword: async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      {
        email,
      }
    );

    return response.data;
  },

  // =========================
  // RESET PASSWORD
  // =========================
  resetPassword: async (token, password) => {
    const response = await api.post(
      "/auth/reset-password",
      {
        token,
        password,
      }
    );

    return response.data;
  },
};