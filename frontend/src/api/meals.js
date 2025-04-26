import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/meals`,
});
// all of these will be used for admin
export const getWeekMenu = () => API.get("/week-menu");
export const addFoodItem = (formData) =>
  API.post("/food-info", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getFoodItems = () => API.get("/food-info");
export const addMenuItem = (data) => API.post("/week-menu", data);
export const deleteMenuItem = (id) => API.delete(`/week-menu/${id}`);
export const updateMenuItem = (id, data) => API.put(`/week-menu/${id}`, data);

export const deleteFoodItem = (id) => API.delete(`/food-info/${id}`);
export const updateFoodItem = (id, data) => API.put(`/food-info/${id}`, data);
