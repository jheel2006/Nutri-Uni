// AdminDashboard.jsx


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import {
  getWeekMenu,
  addFoodItem,
  getFoodItems,
  addMenuItem,
  deleteMenuItem,updateMenuItem
} from "../api/meals";

import AddFoodItemForm from "@/components/AddFoodItemForm";
import AddMenuItemForm from "@/components/AddMenuItemForm";
import Header from "@/components/Header";
import MenuTable from "@/components/MenuTable";
import FoodItemsTable from "@/components/FoodItemsTable";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminDashboard() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu"); 
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
    if (!newFood.item_name) return alert("Item name is required.");

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
      alert("Food item added!");
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
      alert("Error adding food item.");
    }
  };

  const handleAddMenuItem = async () => {
    if (!selectedFoodId || !menuMeta.dining_hall || !menuMeta.counter)
      return alert("All fields are required.");

    try {
      await addMenuItem({
        food_info_id: selectedFoodId,
        ...menuMeta,
        date_available: new Date().toISOString().split("T")[0],
      });
      alert("Menu item added!");
      fetchMenu();
      setShowMenuForm(false);
    } catch (err) {
      alert("Error adding menu item.");
    }
  };

  const loadFoodItems = async () => {
    const res = await getFoodItems();
    setFoodItems(res.data);
  };

  useEffect(() => {
    fetchMenu();
    loadFoodItems();
  }, []);

  return (
    <div className="pt-20 px-4 md:px-6 lg:px-8"> 
      <div className="w-full  max-w-[1600px] mx-auto space-y-8">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-header-primary text-[#303030]">Menu</h1>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/admin/add-item")}
              className="bg-[#95ae45] hover:bg-[#86a036] text-white px-4 py-2 rounded-xl shadow"
            >
              + Add Item
            </button>

            <button
              onClick={() => navigate("/admin/add-to-menu")}
              className="bg-[#008b9e] hover:bg-[#007a8a] text-white px-4 py-2 rounded-xl shadow"
            >
              + Add to Menu
            </button>
          </div>
        </div>
        {activeTab === "menu" && (
          <MenuTable menuItems={menu} loading={loading} refresh={fetchMenu} />
        )}
        {activeTab === "items" && (
          <FoodItemsTable loading={loading} refresh={loadFoodItems} />
        )}
        
        {/* <MenuTable menuItems={menu} loading={loading} refresh={fetchMenu}/> */}
        {/* <FoodItemsTable menuItems={menu} loading={loading} refresh={fetchMenu}/> */}
      </div>
    </div>
  );

}

export default AdminDashboard;


// earlier
// import { useEffect, useState } from "react";
// import {
//   getWeekMenu,
//   addFoodItem,
//   getFoodItems,
//   addMenuItem,
// } from "../api/meals";

// function AdminDashboard() {
//   const [menu, setMenu] = useState([]);
//   const [foodItems, setFoodItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newFood, setNewFood] = useState({
//     item_name: "",
//     item_photo_link: "",
//     veg: false,
//     vegan: false,
//     gluten_free: false,
//     allergens: [],
//     energy: "",
//     fats: "",
//     protein: "",
//     salt: "",
//     sugar: "",
//   });

//   // Form states
//   //   const [newFood, setNewFood] = useState({ item_name: "" });
//   const [selectedFoodId, setSelectedFoodId] = useState("");
//   const [menuMeta, setMenuMeta] = useState({ dining_hall: "", counter: "" });

//   const fetchMenu = async () => {
//     setLoading(true);
//     try {
//       const res = await getWeekMenu();
//       setMenu(res.data);
//     } catch (err) {
//       console.error("Failed to fetch week menu:", err);
//     }
//     setLoading(false);
//   };

//   const handleAddFoodItem = async () => {
//     if (!newFood.item_name) return alert("Item name is required.");

//     try {
//       const formData = new FormData();
//       formData.append("item_name", newFood.item_name);
//       formData.append("veg", newFood.veg);
//       formData.append("vegan", newFood.vegan);
//       formData.append("gluten_free", newFood.gluten_free);
//       formData.append("allergens", JSON.stringify(newFood.allergens));
//       formData.append("energy", newFood.energy);
//       formData.append("fats", newFood.fats);
//       formData.append("protein", newFood.protein);
//       formData.append("salt", newFood.salt);
//       formData.append("sugar", newFood.sugar);

//       if (newFood.item_photo_file) {
//         formData.append("photo", newFood.item_photo_file); // Must match multer field name
//       }

//       await addFoodItem(formData);
//       alert("Food item added!");

//       setNewFood({
//         item_name: "",
//         item_photo_file: null,
//         veg: false,
//         vegan: false,
//         gluten_free: false,
//         allergens: [],
//         energy: "",
//         fats: "",
//         protein: "",
//         salt: "",
//         sugar: "",
//       });
//     } catch (err) {
//       console.error("Error uploading food item:", err);
//       alert("Error adding food item.");
//     }
//   };

//   const handleAddMenuItem = async () => {
//     if (!selectedFoodId || !menuMeta.dining_hall || !menuMeta.counter)
//       return alert("All fields are required.");
//     try {
//       await addMenuItem({
//         food_info_id: selectedFoodId,
//         ...menuMeta,
//         date_available: new Date().toISOString().split("T")[0],
//       });
//       alert("Menu item added!");
//       fetchMenu(); // Refresh table
//     } catch (err) {
//       alert("Error adding menu item.");
//     }
//   };

//   const loadFoodItems = async () => {
//     const res = await getFoodItems();
//     setFoodItems(res.data);
//   };

//   useEffect(() => {
//     fetchMenu();
//     loadFoodItems();
//   }, []);

//   return (
//     <div className="p-6 space-y-8 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>

//       {/* Week Menu Table */}
//       <div className="bg-white shadow-md rounded p-4">
//         <h2 className="text-xl font-semibold mb-3">This Week’s Menu</h2>
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <table className="w-full border">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-2 border">Dining Hall</th>
//                 <th className="p-2 border">Counter</th>
//                 <th className="p-2 border">Item</th>
//               </tr>
//             </thead>
//             <tbody>
//               {menu.map((entry) => (
//                 <tr key={entry.id}>
//                   <td className="p-2 border">{entry.dining_hall}</td>
//                   <td className="p-2 border">{entry.counter}</td>
//                   <td className="p-2 border">{entry.food_info?.item_name}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Add Food Item */}
//       <div className="bg-white shadow-md rounded p-4 space-y-4">
//         <h2 className="text-xl font-semibold">Add New Food Item</h2>

//         <input
//           type="text"
//           className="border p-2 w-full"
//           placeholder="Item Name"
//           value={newFood.item_name}
//           onChange={(e) =>
//             setNewFood({ ...newFood, item_name: e.target.value })
//           }
//         />

//         <input
//           type="file"
//           accept="image/*"
//           className="border p-2 w-full"
//           onChange={(e) =>
//             setNewFood({ ...newFood, item_photo_file: e.target.files[0] })
//           }
//         />

//         <div className="flex gap-4">
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={newFood.veg}
//               onChange={(e) =>
//                 setNewFood({ ...newFood, veg: e.target.checked })
//               }
//             />
//             Veg
//           </label>

//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={newFood.vegan}
//               onChange={(e) =>
//                 setNewFood({ ...newFood, vegan: e.target.checked })
//               }
//             />
//             Vegan
//           </label>

//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={newFood.gluten_free}
//               onChange={(e) =>
//                 setNewFood({ ...newFood, gluten_free: e.target.checked })
//               }
//             />
//             Gluten-Free
//           </label>
//         </div>

//         <input
//           type="text"
//           className="border p-2 w-full"
//           placeholder="Allergens (comma-separated)"
//           value={newFood.allergens.join(", ")}
//           onChange={(e) =>
//             setNewFood({
//               ...newFood,
//               allergens: e.target.value.split(",").map((a) => a.trim()),
//             })
//           }
//         />

//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="number"
//             className="border p-2 w-full"
//             placeholder="Energy (kcal)"
//             value={newFood.energy}
//             onChange={(e) =>
//               setNewFood({ ...newFood, energy: +e.target.value })
//             }
//           />
//           <input
//             type="number"
//             className="border p-2 w-full"
//             placeholder="Fats (g)"
//             value={newFood.fats}
//             onChange={(e) => setNewFood({ ...newFood, fats: +e.target.value })}
//           />
//           <input
//             type="number"
//             className="border p-2 w-full"
//             placeholder="Protein (g)"
//             value={newFood.protein}
//             onChange={(e) =>
//               setNewFood({ ...newFood, protein: +e.target.value })
//             }
//           />
//           <input
//             type="number"
//             className="border p-2 w-full"
//             placeholder="Salt (g)"
//             value={newFood.salt}
//             onChange={(e) => setNewFood({ ...newFood, salt: +e.target.value })}
//           />
//           <input
//             type="number"
//             className="border p-2 w-full"
//             placeholder="Sugar (g)"
//             value={newFood.sugar}
//             onChange={(e) => setNewFood({ ...newFood, sugar: +e.target.value })}
//           />
//         </div>

//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={handleAddFoodItem}
//         >
//           Add Food Item
//         </button>
//       </div>

//       {/* <div className="bg-white shadow-md rounded p-4 space-y-4">
//         <h2 className="text-xl font-semibold">Add New Food Item</h2>
//         <input
//           type="text"
//           className="border p-2 w-full"
//           placeholder="Item Name"
//           value={newFood.item_name}
//           onChange={(e) =>
//             setNewFood({ ...newFood, item_name: e.target.value })
//           }
//         />
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={handleAddFoodItem}
//         >
//           Add Food Item
//         </button>
//       </div> */}

//       {/* Add Menu Item */}
//       <div className="bg-white shadow-md rounded p-4 space-y-4">
//         <h2 className="text-xl font-semibold">Add to Week’s Menu</h2>

//         <select
//           className="border p-2 w-full"
//           value={selectedFoodId}
//           onChange={(e) => setSelectedFoodId(e.target.value)}
//         >
//           <option value="">Select Food Item</option>
//           {foodItems.map((item) => (
//             <option key={item.id} value={item.id}>
//               {item.item_name}
//             </option>
//           ))}
//         </select>

//         <input
//           className="border p-2 w-full"
//           placeholder="Dining Hall"
//           value={menuMeta.dining_hall}
//           onChange={(e) =>
//             setMenuMeta({ ...menuMeta, dining_hall: e.target.value })
//           }
//         />

//         <input
//           className="border p-2 w-full"
//           placeholder="Counter"
//           value={menuMeta.counter}
//           onChange={(e) =>
//             setMenuMeta({ ...menuMeta, counter: e.target.value })
//           }
//         />

//         <button
//           className="bg-green-600 text-white px-4 py-2 rounded"
//           onClick={handleAddMenuItem}
//         >
//           Add Menu Item
//         </button>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;


