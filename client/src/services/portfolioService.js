import api from "../lib/api";

export const portfolioService = {
  // Get portfolio images/posts for a profile
  getByProfile: async (profileId) => {
    const response = await api.get(`/portfolio/profile/${profileId}`);
    return response.data?.data || response.data || [];
  },

  // Upload a new portfolio item (with metadata: type, caption, brandTag, etc.)
  addImage: async (profileId, imageFile, sortOrder = 0, metadata = {}) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("profileId", profileId);
    if (sortOrder != null) {
      formData.append("sortOrder", String(sortOrder));
    }
    if (metadata.type) formData.append("type", metadata.type);
    if (metadata.caption) formData.append("caption", metadata.caption);
    if (metadata.brandTag) formData.append("brandTag", metadata.brandTag);
    if (metadata.likesCount) formData.append("likesCount", String(metadata.likesCount));
    if (metadata.viewsCount) formData.append("viewsCount", String(metadata.viewsCount));
    if (metadata.aspectRatio) formData.append("aspectRatio", metadata.aspectRatio);
    if (metadata.mediaType) formData.append("mediaType", metadata.mediaType);

    const response = await api.post("/portfolio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data || response.data;
  },

  // Toggle like on a portfolio item
  toggleLike: async (id) => {
    const response = await api.post(`/portfolio/${id}/like`);
    return response.data;
  },

  // Add a comment to a portfolio item
  addComment: async (id, text, userName = "", userAvatar = "") => {
    const response = await api.post(`/portfolio/${id}/comments`, {
      text,
      userName,
      userAvatar,
    });
    return response.data;
  },

  // Update portfolio item
  updateItem: async (id, updates) => {
    const response = await api.put(`/portfolio/${id}`, updates);
    return response.data;
  },

  // Delete portfolio image by id
  deleteImage: async (id) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
  },

  // Reorder portfolio images
  reorder: async (images) => {
    const response = await api.post("/portfolio/reorder", { images });
    return response.data;
  },
};

export default portfolioService;