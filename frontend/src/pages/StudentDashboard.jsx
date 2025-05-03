// File: StudentDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { getRecommendations, getStudentInfo } from "../api/students";
import { getFavorites } from "../api/favorites";
import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import DiningHallSelection from "@/components/DiningHallSelection";
import { NutritionInfo } from "@/components/NutritionInfo";
import UserProfile from "@/components/UserProfile"; 

const hallCounters = {
  D1: ["Mongolian", "Salad", "Japanese", "Grill"],
  D2: ["Subjects", "Flavors", "Grill", "Italian", "Vegan"],
  Marketplace: ["Chakra", "Los Amigos", "Asiatic", "Pasta"],
};

const DAILY_VALUES = {
  energy: 2000,
  fats: 70,
  protein: 50,
  sugar: 30,
  salt: 6,
};

function StudentDashboard() {
  const { user } = useUser();
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [selectedDiningHall, setSelectedDiningHall] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [topRecommendation, setTopRecommendation] = useState(null);

  const toggleProfile = useCallback(() => {
    setShowProfile((prev) => !prev);
  }, []);

  const calculateKJ = (kcal) => (kcal ? Math.round(kcal * 4.184) : null);
  const calculatePercentage = (value, nutrient) => {
    if (!value || !DAILY_VALUES[nutrient]) return null;
    return Math.round((value / DAILY_VALUES[nutrient]) * 100);
  };

  const enhanceMenuData = (menuData) => {
    return menuData.map((item) => ({
      ...item,
      food_info: item.food_info
        ? {
            ...item.food_info,
            energy_kj: calculateKJ(item.food_info.energy),
            energy_percent: calculatePercentage(item.food_info.energy, "energy"),
            fats_percent: calculatePercentage(item.food_info.fats, "fats"),
            protein_percent: calculatePercentage(item.food_info.protein, "protein"),
            sugar_percent: calculatePercentage(item.food_info.sugar, "sugar"),
            salt_percent: calculatePercentage(item.food_info.salt, "salt"),
          }
        : null,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      try {
        const [menuRes, studentRes, favoritesRes] = await Promise.all([
          getRecommendations(user.id),
          getStudentInfo(user.id),
          getFavorites(user.id),
        ]);

        const enhancedMenu = enhanceMenuData(menuRes.data);
        const [recommendedMeal, ...rest] = enhancedMenu;
        let topPick = recommendedMeal;
        if (selectedCounter && topPick?.counter?.toLowerCase() !== selectedCounter.toLowerCase()) {
          topPick = [recommendedMeal, ...rest].find(
            (item) => item.counter?.toLowerCase() === selectedCounter.toLowerCase()
          );
        }
        setTopRecommendation(topPick);

        const student = studentRes.data;
        const favoriteIds = favoritesRes.data.map((f) => f.food_id);
        setFavoriteIds(favoriteIds);

        const filteredByPreferences = [recommendedMeal, ...rest].filter((item) => {
          if (!item.food_info) return false;
          if (student.is_veg && !item.food_info.veg) return false;
          if (student.is_vegan && !item.food_info.vegan) return false;
          if (student.is_gluten_free && !item.food_info.gluten_free) return false;
          return true;
        });

        // setMenu([recommendedMeal, ...rest]);
        // setFilteredMenu(filteredByPreferences);
        const finalMenu = [recommendedMeal, ...rest];
setMenu(finalMenu);

// Apply filters to match current selections
applyFilters(query, selectedCounter, selectedDiningHall);
      } catch (err) {
        console.error(err);
        setError("Unable to load meals. Please try again later.");
      }
      setLoading(false);
    };

    fetchData();
  }, [user, selectedCounter , selectedDiningHall]);

  const handleSearch = (q) => {
    setQuery(q);
    applyFilters(q, selectedCounter, selectedDiningHall);
  };

  const applyFilters = (q, counter, diningHall) => {
    let filtered = [...menu];
    if (diningHall) {
      filtered = filtered.filter(
        (item) => item.dining_hall?.toLowerCase() === diningHall.toLowerCase()
      );
    }
    if (counter) {
      filtered = filtered.filter(
        (item) => item.counter?.toLowerCase() === counter.toLowerCase()
      );
    }
    if (q.trim()) {
      const keyword = q.toLowerCase();
      filtered = filtered.filter((item) => {
        if (!item.food_info) return false;
        if (item.food_info.item_name?.toLowerCase().includes(keyword)) return true;
        if (
          item.food_info.allergens?.some((allergen) =>
            allergen.toLowerCase().includes(keyword)
          )
        )
          return true;
        const dietaryKeywords = [];
        if (item.food_info.veg) dietaryKeywords.push("vegetarian");
        if (item.food_info.vegan) dietaryKeywords.push("vegan");
        if (item.food_info.gluten_free) dietaryKeywords.push("gluten free");
        return dietaryKeywords.some((tag) => tag.includes(keyword));
      });
    }
    setFilteredMenu(filtered);
  };

  const handleDiningHallSelect = (hall) => {
    setSelectedDiningHall(hall);
    setSelectedCounter(null);
    applyFilters(query, null, hall);
  };

  const handleCounterFilter = (counter) => {
    const newCounter = counter === selectedCounter ? null : counter;
    setSelectedCounter(newCounter);
    applyFilters(query, newCounter, selectedDiningHall);
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseNutrition = () => {
    setSelectedItem(null);
  };

  const getAvailableCounters = () => {
    if (!selectedDiningHall) return [];
    return hallCounters[selectedDiningHall] || [];
  };

  const counterIcons = {
    Mongolian: "🥢",
    Salad: "🥗",
    Japanese: "🍣",
    Grill: "🔥",
    Subjects: "📚",
    Flavors: "🌶️",
    Italian: "🍝",
    Vegan: "🌱",
    Chakra: "🔀",
    "Los Amigos": "🌮️",
    Asiatic: "🍜",
    Pasta: "🍝",
  };

  const uniqueDiningHalls = Object.keys(hallCounters);

  return (
    <>
      <Header showItemsTab={false} onSearch={handleSearch} onProfileClick={toggleProfile} />

      <div className="pt-20 px-4 md:px-6 lg:px-8 mt-20">
        {showProfile ? (
          <UserProfile onBack={() => setShowProfile(false)}/>
        ) : (
          <div className="w-full max-w-[1600px] mx-auto space-y-6">
            <h1 className="text-2xl font-header-primary text-[#303030]">
              Hello {user?.firstName || "there"},
            </h1>

            {!selectedDiningHall ? (
              <DiningHallSelection
                diningHalls={uniqueDiningHalls}
                onSelect={handleDiningHallSelect}
              />
            ) : (
              <>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {getAvailableCounters().map((counter) => (
                      <button
                        key={counter}
                        onClick={() => handleCounterFilter(counter)}
                        className={`flex flex-col items-center justify-center w-20 h-28 rounded-full transition shadow-sm text-sm font-medium ${
                          selectedCounter === counter
                            ? "bg-[#AEE1E1] text-[#303030]"
                            : "bg-[#f3fafa] hover:bg-[#e1f0f0] text-[#303030]"
                        }`}
                      >
                        <div className="text-2xl mb-2">{counterIcons[counter] || "🍽️"}</div>
                        <span>{counter}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedDiningHall(null)}
                    className="px-4 py-2 bg-[#ebf6f7] rounded-xl hover:bg-[#bde6ea] self-start transition-colors"
                  >
                    Change Dining Hall
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl text-[#303030] mb-2">Recommended for You</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topRecommendation ? (
                      <MenuCard
                        item={topRecommendation}
                        onClick={handleCardClick}
                        isFavorited={favoriteIds.includes(topRecommendation.food_info.id)}
                      />
                    ) : (
                      <div className="text-gray-600 italic col-span-1">
                        No recommended meals at this counter. Please explore another counter.
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
                )}

                <h2 className="text-xl text-[#303030] mb-2">All Meals</h2>
                {!loading && filteredMenu.length === 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          {query.trim()
                            ? "No meals found. Try a different keyword."
                            : selectedCounter
                            ? "No meals available at this counter today."
                            : "No meals currently available in this dining hall."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onClick={handleCardClick}
                      isFavorited={favoriteIds.includes(item.food_info.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-40" onClick={handleCloseNutrition}>
          <NutritionInfo
            item={selectedItem}
            open={!!selectedItem}
            onClose={handleCloseNutrition}
          />
        </div>
      )}
    </>
  );
}

export default StudentDashboard;






//earlier
// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/clerk-react";
// import { getWeekMenu } from "../api/meals";
// import { getRecommendations } from "../api/students";
// import { getStudentInfo } from "../api/students";
// import Header from "@/components/Header";
// import MenuCard from "@/components/MenuCard";
// import DiningHallSelection from "@/components/DiningHallSelection";
// import { NutritionInfo } from "@/components/NutritionInfo";

// const hallCounters = {
//   D1: ["Mongolian", "Salad", "Japanese", "Grill"],
//   D2: ["Subjects", "Flavors", "Grill", "Italian", "Vegan"],
//   Marketplace: ["Chakra", "Los Amigos", "Asiatic", "Pasta"],
// };

// const DAILY_VALUES = {
//   energy: 2000,
//   fats: 70,
//   protein: 50,
//   sugar: 30,
//   salt: 6
// };

// function StudentDashboard() {
//   const { user } = useUser();
//   const [menu, setMenu] = useState([]);
//   const [filteredMenu, setFilteredMenu] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState("");
//   const [selectedCounter, setSelectedCounter] = useState(null);
//   const [selectedDiningHall, setSelectedDiningHall] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [error, setError] = useState("");

//   const calculateKJ = (kcal) => kcal ? Math.round(kcal * 4.184) : null;
//   const calculatePercentage = (value, nutrient) => {
//     if (!value || !DAILY_VALUES[nutrient]) return null;
//     return Math.round((value / DAILY_VALUES[nutrient]) * 100);
//   };

//   const enhanceMenuData = (menuData) => {
//     return menuData.map(item => ({
//       ...item,
//       food_info: item.food_info ? {
//         ...item.food_info,
//         energy_kj: calculateKJ(item.food_info.energy),
//         energy_percent: calculatePercentage(item.food_info.energy, 'energy'),
//         fats_percent: calculatePercentage(item.food_info.fats, 'fats'),
//         protein_percent: calculatePercentage(item.food_info.protein, 'protein'),
//         sugar_percent: calculatePercentage(item.food_info.sugar, 'sugar'),
//         salt_percent: calculatePercentage(item.food_info.salt, 'salt')
//       } : null
//     }));
//   };

//   useEffect(() => {
//     const fetchMenu = async () => {
//       if (!user || !user.id) return;

//       setLoading(true);
//       try {
//         // Fetch both menu and student preferences at the same time
//         const [menuRes, studentRes] = await Promise.all([
//           getRecommendations(user.id),
//           getStudentInfo(user.id)
//         ]);

//         const enhancedMenu = enhanceMenuData(menuRes.data);
//         const student = studentRes.data; // { is_veg, is_vegan, is_gluten_free, allergens }

//         // Now filter meals based on student's preferences
//         const filteredByPreferences = enhancedMenu.filter(item => {
//           if (!item.food_info) return false;

//           // Check vegetarian
//           if (student.is_veg && !item.food_info.veg) return false;

//           // Check vegan
//           if (student.is_vegan && !item.food_info.vegan) return false;

//           // Check gluten-free
//           if (student.is_gluten_free && !item.food_info.gluten_free) return false;

//           return true; // If it passes all active filters
//         });

//         setMenu(filteredByPreferences);
//         setFilteredMenu(filteredByPreferences);
//       } catch (err) {
//         console.error(err);
//         setError("Unable to load meals. Please try again later.");
//       }
//       setLoading(false);
//     };

//     fetchMenu();
//   }, [user]);


//   const handleSearch = (q) => {
//     setQuery(q);
//     applyFilters(q, selectedCounter, selectedDiningHall);
//   };

//   const applyFilters = (q, counter, diningHall) => {
//     let filtered = [...menu];

//     if (diningHall) {
//       filtered = filtered.filter(item =>
//         item.dining_hall?.toLowerCase() === diningHall.toLowerCase()
//       );
//     }

//     if (counter) {
//       filtered = filtered.filter(item =>
//         item.counter?.toLowerCase() === counter.toLowerCase()
//       );
//     }

//     if (q.trim()) {
//       const keyword = q.toLowerCase();
//       filtered = filtered.filter(item => {
//         if (!item.food_info) return false;

//         if (item.food_info.item_name?.toLowerCase().includes(keyword)) {
//           return true;
//         }

//         if (item.food_info.allergens?.some(allergen =>
//           allergen.toLowerCase().includes(keyword)
//         )) {
//           return true;
//         }

//         const dietaryKeywords = [];
//         if (item.food_info.veg) dietaryKeywords.push('vegetarian');
//         if (item.food_info.vegan) dietaryKeywords.push('vegan');
//         if (item.food_info.gluten_free) dietaryKeywords.push('gluten free');

//         return dietaryKeywords.some(tag =>
//           tag.includes(keyword)
//         );
//       });
//     }

//     setFilteredMenu(filtered);
//   };

//   const handleDiningHallSelect = (hall) => {
//     setSelectedDiningHall(hall);
//     setSelectedCounter(null);
//     applyFilters(query, null, hall);
//   };

//   const handleCounterFilter = (counter) => {
//     const newCounter = counter === selectedCounter ? null : counter;
//     setSelectedCounter(newCounter);
//     applyFilters(query, newCounter, selectedDiningHall);
//   };

//   const handleCardClick = (item) => {
//     setSelectedItem(item);
//   };

//   const handleCloseNutrition = () => {
//     setSelectedItem(null);
//   };

//   const getAvailableCounters = () => {
//     if (!selectedDiningHall) return [];
//     return hallCounters[selectedDiningHall] || [];
//   };

//   const counterHasMeals = (counter) => {
//     return menu.some(item =>
//       item.dining_hall === selectedDiningHall &&
//       item.counter === counter &&
//       item.food_info
//     );
//   };

//   const uniqueDiningHalls = Object.keys(hallCounters);

//   return (
//     <>
//       <Header
//         showItemsTab={false}
//         onSearch={handleSearch}
//       />

//       <div className="pt-20 px-4 md:px-6 lg:px-8">
//         <div className="w-full max-w-[1600px] mx-auto space-y-6">
//           <h1 className="text-2xl font-header-primary text-[#303030]">
//             Hello {user?.firstName || 'there'},
//           </h1>

//           {!selectedDiningHall ? (
//             <DiningHallSelection
//               diningHalls={uniqueDiningHalls}
//               onSelect={handleDiningHallSelect}
//             />
//           ) : (
//             <>
//               <div className="flex flex-col space-y-4">
//                 <div className="flex flex-wrap gap-3">
//                   {getAvailableCounters().map(counter => (
//                     <button
//                       key={counter}
//                       onClick={() => handleCounterFilter(counter)}
//                       className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCounter === counter
//                         ? "bg-[#008b9e] text-white"
//                         : "bg-[#ebf6f7] text-gray-800 hover:bg-[#bde6ea]"
//                         }`}
//                     >
//                       {counter}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => setSelectedDiningHall(null)}
//                   className="px-4 py-2 bg-[#ebf6f7] rounded-xl hover:bg-[#bde6ea] self-start transition-colors"
//                 >
//                   Change Dining Hall
//                 </button>
//               </div>

//               {error && (
//                 <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
//               )}

//               {!loading && filteredMenu.length === 0 && (
//                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-yellow-700">
//                         {query.trim()
//                           ? "No meals found. Try a different keyword."
//                           : selectedCounter
//                             ? "No meals available at this counter today."
//                             : "No meals currently available in this dining hall."}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {filteredMenu.map(item => (
//                   <MenuCard
//                     key={item.id}
//                     item={item}
//                     onClick={handleCardClick}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {selectedItem && (
//         <div className="fixed inset-0 z-40" onClick={handleCloseNutrition}>
//           <NutritionInfo
//             item={selectedItem}
//             open={!!selectedItem}
//             onClose={handleCloseNutrition}
//           />
//         </div>
//       )}
//     </>
//   );
// }

// export default StudentDashboard;


//working v1
// import { useEffect, useState, useCallback } from "react";
// import { useUser } from "@clerk/clerk-react";
// import { getRecommendations, getStudentInfo } from "../api/students";
// import { getFavorites } from "../api/favorites";
// import Header from "@/components/Header";
// import MenuCard from "@/components/MenuCard";
// import DiningHallSelection from "@/components/DiningHallSelection";
// import { NutritionInfo } from "@/components/NutritionInfo";
// import UserProfile from "@/components/UserProfile"; // make sure this path is correct

// const hallCounters = {
//   D1: ["Mongolian", "Salad", "Japanese", "Grill"],
//   D2: ["Subjects", "Flavors", "Grill", "Italian", "Vegan"],
//   Marketplace: ["Chakra", "Los Amigos", "Asiatic", "Pasta"],
// };

// const DAILY_VALUES = {
//   energy: 2000,
//   fats: 70,
//   protein: 50,
//   sugar: 30,
//   salt: 6,
// };

// function StudentDashboard() {
//   const { user } = useUser();
//   const [menu, setMenu] = useState([]);
//   const [filteredMenu, setFilteredMenu] = useState([]);
//   const [favoriteIds, setFavoriteIds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState("");
//   const [selectedCounter, setSelectedCounter] = useState(null);
//   const [selectedDiningHall, setSelectedDiningHall] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [error, setError] = useState("");
//   const [showProfile, setShowProfile] = useState(false);

//   const toggleProfile = useCallback(() => {
//     setShowProfile((prev) => !prev);
//   }, []);

//   const calculateKJ = (kcal) => (kcal ? Math.round(kcal * 4.184) : null);
//   const calculatePercentage = (value, nutrient) => {
//     if (!value || !DAILY_VALUES[nutrient]) return null;
//     return Math.round((value / DAILY_VALUES[nutrient]) * 100);
//   };

//   const enhanceMenuData = (menuData) => {
//     return menuData.map((item) => ({
//       ...item,
//       food_info: item.food_info
//         ? {
//             ...item.food_info,
//             energy_kj: calculateKJ(item.food_info.energy),
//             energy_percent: calculatePercentage(item.food_info.energy, "energy"),
//             fats_percent: calculatePercentage(item.food_info.fats, "fats"),
//             protein_percent: calculatePercentage(item.food_info.protein, "protein"),
//             sugar_percent: calculatePercentage(item.food_info.sugar, "sugar"),
//             salt_percent: calculatePercentage(item.food_info.salt, "salt"),
//           }
//         : null,
//     }));
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user || !user.id) return;
//       setLoading(true);
//       try {
//         const [menuRes, studentRes, favoritesRes] = await Promise.all([
//           getRecommendations(user.id),
//           getStudentInfo(user.id),
//           getFavorites(user.id),
//         ]);

//         const enhancedMenu = enhanceMenuData(menuRes.data);
//         const student = studentRes.data;
//         const favoriteIds = favoritesRes.data.map((f) => f.food_id);
//         setFavoriteIds(favoriteIds);

//         const filteredByPreferences = enhancedMenu.filter((item) => {
//           if (!item.food_info) return false;
//           if (student.is_veg && !item.food_info.veg) return false;
//           if (student.is_vegan && !item.food_info.vegan) return false;
//           if (student.is_gluten_free && !item.food_info.gluten_free) return false;
//           return true;
//         });

//         setMenu(filteredByPreferences);
//         setFilteredMenu(filteredByPreferences);
//       } catch (err) {
//         console.error(err);
//         setError("Unable to load meals. Please try again later.");
//       }
//       setLoading(false);
//     };

//     fetchData();
//   }, [user]);

//   const handleSearch = (q) => {
//     setQuery(q);
//     applyFilters(q, selectedCounter, selectedDiningHall);
//   };

//   const applyFilters = (q, counter, diningHall) => {
//     let filtered = [...menu];
//     if (diningHall) {
//       filtered = filtered.filter(
//         (item) => item.dining_hall?.toLowerCase() === diningHall.toLowerCase()
//       );
//     }
//     if (counter) {
//       filtered = filtered.filter(
//         (item) => item.counter?.toLowerCase() === counter.toLowerCase()
//       );
//     }
//     if (q.trim()) {
//       const keyword = q.toLowerCase();
//       filtered = filtered.filter((item) => {
//         if (!item.food_info) return false;
//         if (item.food_info.item_name?.toLowerCase().includes(keyword)) return true;
//         if (
//           item.food_info.allergens?.some((allergen) =>
//             allergen.toLowerCase().includes(keyword)
//           )
//         )
//           return true;
//         const dietaryKeywords = [];
//         if (item.food_info.veg) dietaryKeywords.push("vegetarian");
//         if (item.food_info.vegan) dietaryKeywords.push("vegan");
//         if (item.food_info.gluten_free) dietaryKeywords.push("gluten free");
//         return dietaryKeywords.some((tag) => tag.includes(keyword));
//       });
//     }
//     setFilteredMenu(filtered);
//   };

//   const handleDiningHallSelect = (hall) => {
//     setSelectedDiningHall(hall);
//     setSelectedCounter(null);
//     applyFilters(query, null, hall);
//   };

//   const handleCounterFilter = (counter) => {
//     const newCounter = counter === selectedCounter ? null : counter;
//     setSelectedCounter(newCounter);
//     applyFilters(query, newCounter, selectedDiningHall);
//   };

//   const handleCardClick = (item) => {
//     setSelectedItem(item);
//   };

//   const handleCloseNutrition = () => {
//     setSelectedItem(null);
//   };

//   const getAvailableCounters = () => {
//     if (!selectedDiningHall) return [];
//     return hallCounters[selectedDiningHall] || [];
//   };

//   const counterIcons = {
//     Mongolian: "🥢",
//     Salad: "🥗",
//     Japanese: "🍣",
//     Grill: "🔥",
//     Subjects: "📚",
//     Flavors: "🌶️",
//     Italian: "🍝",
//     Vegan: "🌱",
//     Chakra: "🌀",
//     "Los Amigos": "🌮",
//     Asiatic: "🍜",
//     Pasta: "🍝",
//   };
  
//   const uniqueDiningHalls = Object.keys(hallCounters);

//   return (
//     <>
//       <Header showItemsTab={false} onSearch={handleSearch} onProfileClick={toggleProfile} />

//       <div className="pt-20 px-4 md:px-6 lg:px-8 mt-20">
//         {showProfile ? (
//           <UserProfile />
//         ) : (
//           <div className="w-full max-w-[1600px] mx-auto space-y-6">
//             <h1 className="text-2xl font-header-primary text-[#303030]">
//               Hello {user?.firstName || "there"},
//             </h1>

//             {!selectedDiningHall ? (
//               <DiningHallSelection
//                 diningHalls={uniqueDiningHalls}
//                 onSelect={handleDiningHallSelect}
//               />
//             ) : (
//               <>
//                 <div className="flex flex-col space-y-4">
//                   <div className="flex flex-wrap gap-4 justify-center">
//                   {getAvailableCounters().map((counter) => (
//                     <button
//                       key={counter}
//                       onClick={() => handleCounterFilter(counter)}
//                       className={`flex flex-col items-center justify-center w-20 h-28 rounded-full transition shadow-sm text-sm font-medium ${
//                         selectedCounter === counter
//                           ? "bg-[#AEE1E1] text-[#303030]"
//                           : "bg-[#f3fafa] hover:bg-[#e1f0f0] text-[#303030]"
//                       }`}
//                     >
//                       {/* <img
//                       src={`/icons/${counter}.png`}
//                       className="w-10 h-10 mb-2 object-contain"
//                     /> */}
//                       <div className="text-2xl mb-2">{counterIcons[counter] || "🍽️"}</div>
//                       <span>{counter}</span>
//                     </button>
//                   ))}
//                   </div>
//                   <button
//                     onClick={() => setSelectedDiningHall(null)}
//                     className="px-4 py-2 bg-[#ebf6f7] rounded-xl hover:bg-[#bde6ea] self-start transition-colors"
//                   >
//                     Change Dining Hall
//                   </button>
//                 </div>

//                 {error && (
//                   <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
//                 )}

//                 {!loading && filteredMenu.length === 0 && (
//                   <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
//                     <div className="flex">
//                       <div className="flex-shrink-0">
//                         <svg
//                           className="h-5 w-5 text-yellow-400"
//                           xmlns="http://www.w3.org/2000/svg"
//                           viewBox="0 0 20 20"
//                           fill="currentColor"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </div>
//                       <div className="ml-3">
//                         <p className="text-sm text-yellow-700">
//                           {query.trim()
//                             ? "No meals found. Try a different keyword."
//                             : selectedCounter
//                             ? "No meals available at this counter today."
//                             : "No meals currently available in this dining hall."}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {filteredMenu.map((item) => (
//                     <MenuCard
//                       key={item.id}
//                       item={item}
//                       onClick={handleCardClick}
//                       isFavorited={favoriteIds.includes(item.food_info.id)}
//                     />
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {selectedItem && (
//         <div className="fixed inset-0 z-40" onClick={handleCloseNutrition}>
//           <NutritionInfo
//             item={selectedItem}
//             open={!!selectedItem}
//             onClose={handleCloseNutrition}
//           />
//         </div>
//       )}
//     </>
//   );
// }

// export default StudentDashboard;
