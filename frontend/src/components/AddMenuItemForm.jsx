// File: AddMenuItemForm.jsx - to add an item from food items to the week menu
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFoodItems, addMenuItem, getWeekMenu } from "../api/meals";
import Header from "@/components/Header";
import { ChevronLeft, ChevronDown } from "lucide-react";

const hallCounters = {
  D1: ["Mongolian", "Salad", "Japanese", "Grill"],
  D2: ["Subjects", "Flavors", "Grill", "Italian", "Vegan"],
  Marketplace: ["Chakra", "Los Amigos", "Asiatic", "Pasta"],
};

function AddMenuItemForm() {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [weekMenu, setWeekMenu] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [menuMeta, setMenuMeta] = useState({ dining_hall: "", counter: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodItemsRes, weekMenuRes] = await Promise.all([
          getFoodItems(),
          getWeekMenu()
        ]);
        setFoodItems(foodItemsRes.data);
        setWeekMenu(weekMenuRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddMenuItem = async () => {
    if (!selectedFoodId || !menuMeta.dining_hall || !menuMeta.counter) {
      alert("All fields are required.");
      return;
    }

    const isDuplicate = weekMenu.some(item =>
      item.food_info_id === selectedFoodId &&
      item.dining_hall === menuMeta.dining_hall &&
      item.counter === menuMeta.counter
    );

    if (isDuplicate) {
      alert("This item is already on the menu for this dining hall and counter.");
      return;
    }

    try {
      await addMenuItem({
        food_info_id: selectedFoodId,
        ...menuMeta,
        date_available: new Date().toISOString().split("T")[0],
      });
      alert("Menu item added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      alert("Failed to add menu item.");
    }
  };

  // Get filtered food items (not already in menu) - not working currently
  const filteredFoodItems = foodItems.filter(
    (item) => !weekMenu.some((entry) => entry.food_info_id === item.id)
  );

  return (
    <div className="pt-32 px-8 sm:px-16 md:px-24 lg:px-32 xl:px-48 pb-12">
      <Header />
      <div className="mt-8 space-y-8 mt-15">
        <button
          onClick={() => navigate("/admin/dashboard", { state: { tab: "menu" } })}
          className="flex items-center gap-2 text-[--text] font-semibold"
        >
          <ChevronLeft size={20} />
          Add to week’s Menu
        </button>

        <div className="space-y-6">
          {/* Food Dropdown */}
          <div className="relative">
            <select
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
              className="w-full bg-[#edf7f8] text-[#3f3f3f] px-6 py-4 rounded-full appearance-none"
            >
              <option value="">Select Food item</option>
              {filteredFoodItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {/* Dining Hall Dropdown */}
          <div className="relative">
            <select
              value={menuMeta.dining_hall}
              onChange={(e) =>
                setMenuMeta({ ...menuMeta, dining_hall: e.target.value, counter: "" })
              }
              className="w-full bg-[#edf7f8] text-[#3f3f3f] px-6 py-4 rounded-full appearance-none"
            >
              <option value="">Select Dining Hall</option>
              {Object.keys(hallCounters).map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {/* Counter Dropdown (only shown if dining hall is selected) */}
          {menuMeta.dining_hall && (
            <div className="relative">
              <select
                value={menuMeta.counter}
                onChange={(e) =>
                  setMenuMeta({ ...menuMeta, counter: e.target.value })
                }
                className="w-full bg-[#edf7f8] text-[#3f3f3f] px-6 py-4 rounded-full appearance-none"
              >
                <option value="">Select Counter</option>
                {hallCounters[menuMeta.dining_hall].map((counter) => (
                  <option key={counter} value={counter}>
                    {counter}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          )}

          {/* Submit */}
          <div className="text-right pt-4">
            <button
              onClick={handleAddMenuItem}
              className="bg-[#3b8496] text-white px-8 py-2 rounded-lg hover:bg-[#2c6e7f]"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMenuItemForm;
