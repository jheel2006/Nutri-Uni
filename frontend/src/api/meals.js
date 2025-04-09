import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/meals`,
});

export const getWeekMenu = () => API.get("/week-menu");
export const addFoodItem = (formData) =>
  API.post("/food-info", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getFoodItems = () => API.get("/food-info");
export const addMenuItem = (data) => API.post("/week-menu", data);
