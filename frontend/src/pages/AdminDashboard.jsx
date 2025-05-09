// AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getWeekMenu,
  addFoodItem,
  getFoodItems,
  addMenuItem,
  deleteMenuItem, updateMenuItem
} from "../api/meals";

import AddFoodItemForm from "@/components/AddFoodItemForm";
import AddMenuItemForm from "@/components/AddMenuItemForm";
import Header from "@/components/Header";
import MenuTable from "@/components/MenuTable";
import FoodItemsTable from "@/components/FoodItemsTable";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfile from "@/components/UserProfile";
import { useToast } from "@/components/ToastContext";

function AdminDashboard() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const { showToast } = useToast();
  const [newFood, setNewFood] = useState({
    item_name: "",
    item_photo_link: "",
    veg: false,
    vegan: false,
    gluten_free: false,
    allergens: [],
    energy: "",
    fats: "",
    protein: "",
    salt: "",
    sugar: "",
  });

  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [menuMeta, setMenuMeta] = useState({ dining_hall: "", counter: "" });

  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await getWeekMenu();
      setMenu(res.data);
    } catch (err) {
      console.error("Failed to fetch week menu:", err);
    }
    setLoading(false);
  };

  const handleAddFoodItem = async () => {
    if (!newFood.item_name) return showToast("Item name is required.");

    try {
      const formData = new FormData();
      formData.append("item_name", newFood.item_name);
      formData.append("veg", newFood.veg);
      formData.append("vegan", newFood.vegan);
      formData.append("gluten_free", newFood.gluten_free);
      formData.append("allergens", JSON.stringify(newFood.allergens));
      formData.append("energy", newFood.energy);
      formData.append("fats", newFood.fats);
      formData.append("protein", newFood.protein);
      formData.append("salt", newFood.salt);
      formData.append("sugar", newFood.sugar);

      if (newFood.item_photo_file) {
        formData.append("photo", newFood.item_photo_file);
      }

      await addFoodItem(formData);
      showToast("Food item added!");
      setNewFood({
        item_name: "",
        item_photo_file: null,
        veg: false,
        vegan: false,
        gluten_free: false,
        allergens: [],
        energy: "",
        fats: "",
        protein: "",
        salt: "",
        sugar: "",
      });
      setShowFoodForm(false);
      loadFoodItems();
    } catch (err) {
      console.error("Error uploading food item:", err);
      showToast("Error adding food item.");
    }
  };

  const handleAddMenuItem = async () => {
    if (!selectedFoodId || !menuMeta.dining_hall || !menuMeta.counter)
      return showToast("All fields are required.");

    try {
      await addMenuItem({
        food_info_id: selectedFoodId,
        ...menuMeta,
        date_available: new Date().toISOString().split("T")[0],
      });
      showToast("Menu item added!");
      fetchMenu();
      setShowMenuForm(false);
    } catch (err) {
      showToast("Error adding menu item.");
    }
  };

  const loadFoodItems = async () => {
    const res = await getFoodItems();
    setFoodItems(res.data);
  };

  useEffect(() => {
    fetchMenu();
    loadFoodItems();
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, []);

  return (
    <div className="pt-20 px-4 md:px-6 lg:px-8 mt-15">
      <div className="w-full max-w-[1600px] mx-auto space-y-8">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onProfileClick={() => setShowProfile(true)}
        />

        {showProfile ? (
          <UserProfile onBack={() => setShowProfile(false)} isAdmin />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-header-primary text-[#303030]">Menu</h1>
              <div className="flex gap-4">
                {activeTab === "items" && (
                  <button
                    onClick={() => navigate("/admin/add-item")}
                    className="bg-[#95ae45] hover:bg-[#86a036] text-white px-4 py-2 rounded-xl shadow"
                  >
                    + Add Item
                  </button>
                )}
                {activeTab === "menu" && (
                  <button
                    onClick={() => navigate("/admin/add-to-menu")}
                    className="bg-[#008b9e] hover:bg-[#007a8a] text-white px-4 py-2 rounded-xl shadow"
                  >
                    + Add to Menu
                  </button>
                )}
              </div>
            </div>

            {activeTab === "menu" && (
              <MenuTable menuItems={menu} loading={loading} refresh={fetchMenu} />
            )}
            {activeTab === "items" && (
              <FoodItemsTable loading={loading} refresh={loadFoodItems} />
            )}

          
            {/* unit testing mocks */}
          {process.env.NODE_ENV === "test" && (
            <>
              <button data-testid="test-add-food" onClick={handleAddFoodItem}>Trigger Add Food</button>
              <button data-testid="test-set-food" onClick={() => setNewFood({
                item_name: "Mock Dish",
                veg: true,
                vegan: false,
                gluten_free: false,
                allergens: ["nuts"],
                energy: "100",
                fats: "10",
                protein: "20",
                salt: "2",
                sugar: "5",
                item_photo_file: new File([""], "mock.png", { type: "image/png" }),
              })}>Set NewFood</button>
            </>
          )}

          {process.env.NODE_ENV === "test" && (
            <button data-testid="test-add-menu" onClick={handleAddMenuItem}>Trigger Add Menu</button>
          )}



          </>
        )}
      </div>
    </div>
  );


}

export default AdminDashboard;

