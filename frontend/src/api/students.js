import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/students`,
});

export const initStudent = (clerk_user_id, email) =>
  API.post("/init-student", { clerk_user_id, email });

export const updatePreferences = (clerk_user_id, prefs) =>
  API.patch("/preferences", { clerk_user_id, ...prefs });

export const getRecommendations = (clerk_user_id) =>
  API.get(`/recommendations`, {
    params: { clerk_user_id },
  });

export const getStudentInfo = (clerk_user_id) =>
  API.get(`/info`, {
    params: { clerk_user_id },
  });
