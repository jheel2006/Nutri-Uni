// File: AddFoodItemForm.jsx - to add a food item to the food item database
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import foodPlaceholder from '../assets/food_placeholder.png';
import { addFoodItem } from "../api/meals";
import { Plus, ChevronLeft, Pencil } from "lucide-react";
import Header from "./Header";
import { MultiSelect } from "@/components/ui/multiselect";
import { useToast } from "@/components/ToastContext";



export default function AddItemFormPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const { showToast } = useToast();
  const [newFood, setNewFood] = useState({
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


  const handleAddFoodItem = async () => {
    const {
      item_name,
      item_photo_file,
      energy,
      protein,
      fats,
      salt,
      sugar,
      allergens,
    } = newFood;

    // Basic validation
    if (!item_name.trim()) {
      showToast("⚠️ Please enter a valid item name.");
      return;
    }

    if (!item_photo_file) {
      showToast("📷 Please upload a photo of the food item.");
      return;
    }

    // if (allergens.length === 0 || allergens.every((a) => !a.trim())) {
    //   showToast("⚠️ Please enter at least one allergen (or specify 'None').");
    //   return;
    // }

    // Numeric field validation
    const fields = [
      { key: "energy", label: "Energy" },
      { key: "protein", label: "Protein" },
      { key: "fats", label: "Fats" },
      { key: "salt", label: "Salt" },
      { key: "sugar", label: "Sugar" },
    ];

    for (const { key, label } of fields) {
      const value = newFood[key];
      if (value === "" || value === null || isNaN(value)) {
        showToast(`⚠️ Please enter a number for ${label}.`);
        return;
      }
      if (Number(value) < 0) {
         showToast(`🚫 ${label} cannot be negative.`);
         return
      }
    }

    try {
      const formData = new FormData();
      formData.append("item_name", item_name);
      formData.append("veg", newFood.veg);
      formData.append("vegan", newFood.vegan);
      formData.append("gluten_free", newFood.gluten_free);
      formData.append("allergens", JSON.stringify(allergens));
      formData.append("energy", energy);
      formData.append("fats", fats);
      formData.append("protein", protein);
      formData.append("salt", salt);
      formData.append("sugar", sugar);
      formData.append("photo", item_photo_file);

      await addFoodItem(formData);
      showToast("Food item added successfully!");
      navigate("/admin/dashboard", { state: { tab: "items" } });
    } catch (err) {
      console.error("Error uploading food item:", err);
      showToast("❌ Something went wrong while adding the food item. Please try again.");
    }
  };

  return (

    <div className="min-h-screen p-8">
      <Header />
      <div className="pt-12 px-6 mt-15">
        <div className="max-w-[1600px] mx-auto">
          <button
            onClick={() => navigate("/admin/dashboard", { state: { tab: "items" } })}
            className="text-black font-semibold mb-6 flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Add new item
          </button>

          <div className="bg-white p-8 rounded-xl shadow-md max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
            {/* LEFT */}
            <div className="flex flex-col items-center w-full md:w-1/3 space-y-6">
              <label
                htmlFor="image-upload"
                className="relative w-48 h-48 rounded-full border-[1px] border-[#a4ae7d] flex items-center justify-center cursor-pointer"
              >
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  {newFood.item_photo_file ? (
                    <img
                      src={URL.createObjectURL(newFood.item_photo_file)}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <img
                        src={foodPlaceholder}
                        alt="Placeholder"
                        className="w-48 h-48 object-cover opacity-50"
                      />
                      <span className="text-gray-400 mt-2">Add photo</span>
                    </div>
                  )}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) =>
                    setNewFood({ ...newFood, item_photo_file: e.target.files[0] })
                  }
                  className="hidden"
                />
                <div className="absolute top-2 right-2 bg-[#ffa41b] text-white rounded-full p-2">
                  <Pencil size={16} />
                </div>
              </label>

              <input
                type="text"
                placeholder="Enter Item Name"
                className="text-lg font-semibold text-center border-b border-gray-300 focus:outline-none"
                value={newFood.item_name}
                onChange={(e) =>
                  setNewFood({ ...newFood, item_name: e.target.value })
                }
              />
            </div>

            {/* RIGHT */}
            <div className="w-full md:w-2/3 space-y-6">
              {/* Dietary Requirements */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Dietary Requirements</p>
                <div className="grid grid-cols-3 gap-4 bg-[#f8fcfb] p-4 rounded-md">
                  {[
                    { key: "veg", label: "Vegetarian" },
                    { key: "vegan", label: "Vegan" },
                    { key: "gluten_free", label: "Gluten Free" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newFood[key]}
                        onChange={(e) =>
                          setNewFood({ ...newFood, [key]: e.target.checked })
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <p className="text-sm font-medium mb-1">Allergens</p>
                <MultiSelect
                  options={["Eggs", "Milk", "Nuts", "Soy", "Wheat", "Fish"].map((a) => ({
                    label: a,
                    value: a,
                  }))}
                  selected={newFood.allergens}
                  onChange={(selected) =>
                    setNewFood({ ...newFood, allergens: selected })
                  }
                  className="mt-1"
                  selectedClassName="bg-[#BDE6EA] text-[#303030] font-semibold"
                />

              </div>

              {/* Nutrition facts */}
              <div>
                <p className="text-sm font-medium mb-2">Nutrition facts</p>
                <div className="grid grid-cols-2 gap-4 bg-[#f8fcfb] p-4 rounded-md">
                  {["energy", "protein", "fats", "salt", "sugar"].map((key) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="number"
                        value={newFood[key]}
                        onChange={(e) =>
                          setNewFood({ ...newFood, [key]: +e.target.value })
                        }
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder={key === "energy" ? "kcal" : "g"}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-right text-xs mt-1 text-gray-400">
                  Per 100 g portion
                </p>
              </div>


              <div className="text-right">
                <button
                  onClick={handleAddFoodItem}
                  className="bg-[#95ae45] text-white px-6 py-2 rounded-md hover:bg-[#819a3b]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}