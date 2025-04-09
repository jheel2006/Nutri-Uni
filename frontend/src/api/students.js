import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/students`,
});

export const initStudent = (clerk_user_id, email) =>
  API.post("/init-student", { clerk_user_id, email });
