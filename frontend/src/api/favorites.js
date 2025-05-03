import axios from "axios";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/favorites`,
});

// export const addFavorite = (clerk_user_id, food_id) =>
//     API.post("/add", { clerk_user_id, food_id });

export const getFavorites = (clerk_user_id) =>
    API.get("/", {
      params: { clerk_user_id },
    });

export const addFavorite = (clerk_user_id, food_id) =>
    API.post("/", { clerk_user_id, food_id });


export const removeFavorite = (clerk_user_id, food_id) =>
    API.delete("/", {
        data: { clerk_user_id, food_id }, // DELETE supports a body in Axios
    });