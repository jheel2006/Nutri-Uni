// File: AddMenuItemForm.jsx - to add an item from food items to the week menu
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFoodItems, addMenuItem, getWeekMenu } from "../api/meals";
import Header from "@/components/Header";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ToastContext";

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
  const [selectedDays, setSelectedDays] = useState([]);
  const { showToast } = useToast();

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
    if (!selectedFoodId || !menuMeta.dining_hall || !menuMeta.counter || selectedDays.length === 0) {
      showToast("All fields are required.");
      return;
    }

    const newItems = selectedDays.map(day => ({
      food_info_id: selectedFoodId,
      ...menuMeta,
      date_available: new Date().toISOString().split("T")[0],
      day,
    }));

    const existing = weekMenu.filter(item =>
      selectedDays.includes(item.day) &&
      item.food_info_id === selectedFoodId &&
      item.dining_hall === menuMeta.dining_hall &&
      item.counter === menuMeta.counter
    );

    const duplicateDays = existing.map(e => e.day);
    if (duplicateDays.length > 0) {
      showToast(`Already on menu for: ${duplicateDays.join(", ")}`);
      return;
    }

    try {
      const itemsToAdd = newItems.filter(
        ni => !existing.some(ei => ei.day === ni.day)
      );

      for (const menuItem of itemsToAdd) {
        await addMenuItem(menuItem);
      }
      showToast("Menu item added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      showToast("Failed to add menu item.");
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
          {/* Day Checkboxes
          <div className="space-y-2">
            <label className="block font-semibold">Select Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={day}
                    checked={selectedDays.includes(day)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedDays(prev =>
                        checked ? [...prev, day] : prev.filter(d => d !== day)
                      );
                    }}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div> */}

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
          {/* Select Days Section */}
          <div className="bg-[#edf7f8] px-6 py-6 rounded-xl mt-2 space-y-3">
            <label className="block text-lg text-[#303030]">Select Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <label key={day} className="flex items-center space-x-2 text-[1.1rem]">
                  <input
                    type="checkbox"
                    value={day}
                    checked={selectedDays.includes(day)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedDays(prev =>
                        checked ? [...prev, day] : prev.filter(d => d !== day)
                      );
                    }}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

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
