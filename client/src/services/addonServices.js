import api from "../lib/api";

export const addonApi = {
  // Get all addon services
  getServices: async (options = {}) => {
    const params = {};
    if (options.enabledOnly) params.enabledOnly = true;
    if (options.profileId) params.profileId = options.profileId;
    if (options.role) params.role = options.role;
    if (options.status) params.status = options.status;

    const response = await api.get("/addons/services", { params });
    return response.data;
  },

  // Create addon service
  createService: async (serviceData) => {
    const isFormData = serviceData instanceof FormData;
    const response = await api.post("/addons/services", serviceData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });

    return response.data;
  },

  // Update addon service
  updateService: async (id, serviceData) => {
    const isFormData = serviceData instanceof FormData;
    const response = await api.patch(
      `/addons/services/${id}`,
      serviceData,
      {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      }
    );

    return response.data;
  },

  // Delete addon service
  deleteService: async (id) => {
    const response = await api.delete(`/addons/services/${id}`);

    return response.data;
  },

  // Get bookings
  getBookings: async (profileId, role) => {
    const params = {};
    if (profileId) params.profileId = profileId;
    if (role) params.role = role;

    const response = await api.get("/addons/bookings", { params });
    return response.data;
  },

  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post(
      "/addons/bookings",
      bookingData
    );

    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/addons/bookings/${id}`, { status });
    return response.data;
  },

  // Delete booking
  deleteBooking: async (id) => {
    const response = await api.delete(`/addons/bookings/${id}`);
    return response.data;
  },
};