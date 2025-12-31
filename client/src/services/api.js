import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API service methods
export const articleAPI = {
  // Get all articles
  getAllArticles: async (params = {}) => {
    const response = await apiClient.get("/articles", { params });
    return response.data;
  },

  // Get single article
  getArticle: async (id) => {
    const response = await apiClient.get(`/articles/${id}`);
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await apiClient.get("/articles/stats");
    return response.data;
  },

  // Create article
  createArticle: async (data) => {
    const response = await apiClient.post("/articles", data);
    return response.data;
  },

  // Update article
  updateArticle: async (id, data) => {
    const response = await apiClient.put(`/articles/${id}`, data);
    return response.data;
  },

  // Delete article
  deleteArticle: async (id) => {
    const response = await apiClient.delete(`/articles/${id}`);
    return response.data;
  },

  // Enhance article with AI
  enhanceArticle: async (id) => {
    const response = await apiClient.post(`/articles/${id}/enhance`);
    return response.data;
  },
};

export default apiClient;
