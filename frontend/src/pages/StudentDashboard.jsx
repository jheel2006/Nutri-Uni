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
  const [allMenu, setAllMenu] = useState([]); // Store all menu items
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingView, setSwitchingView] = useState(false); // New loading state for UI transitions
  const [query, setQuery] = useState("");
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [selectedDiningHall, setSelectedDiningHall] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [topRecommendation, setTopRecommendation] = useState(null);
  const [studentPreferences, setStudentPreferences] = useState(null);

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

  // Load initial data
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
        const studentData = studentRes.data;
        const favoriteIds = favoritesRes.data.map((f) => f.food_id);

        setStudentPreferences(studentData);
        setFavoriteIds(favoriteIds);
        setAllMenu(enhancedMenu); // Store the complete menu

        // Don't set filtered menu yet - we'll do that separately
      } catch (err) {
        console.error(err);
        setError("Unable to load meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle filtering separately based on dining hall, counter, and query
  useEffect(() => {
    // Skip if initial data is still loading
    if (loading) return;

    // Apply initial filtering when data is ready
    applyFilters(query, selectedCounter, selectedDiningHall);
  }, [allMenu, loading, selectedDiningHall, selectedCounter, query]);

  // Find top recommendation whenever filtered menu changes
  useEffect(() => {
    if (filteredMenu.length === 0) {
      setTopRecommendation(null);
      return;
    }

    // Get favorite meals from the current filtered selection
    const favoriteMeals = filteredMenu.filter((m) => m.isFavorite);

    let topPick;
    if (favoriteMeals.length === 1) {
      topPick = favoriteMeals[0];
    } else if (favoriteMeals.length > 1) {
      // Find the favorite with the highest health score
      topPick = favoriteMeals.sort((a, b) => b.health_score - a.health_score)[0];
    } else {
      // No favorites, use the healthiest option
      topPick = [...filteredMenu].sort((a, b) => b.health_score - a.health_score)[0];
    }

    setTopRecommendation(topPick);
  }, [filteredMenu]);

  const handleSearch = (q) => {
    setQuery(q);
  };

  const applyFilters = (q, counter, diningHall) => {
    // Start with all menu items
    let filtered = [...allMenu];

    // Add favorite flag to each item
    filtered = filtered.map(item => ({
      ...item,
      health_score: item.food_info?.health_score || 0,
      isFavorite: favoriteIds.includes(item.food_info?.id),
    }));

    // Apply dining hall filter first
    if (diningHall) {
      filtered = filtered.filter(
        (item) => item.dining_hall?.toLowerCase() === diningHall.toLowerCase()
      );
    }

    // Then apply counter filter
    if (counter) {
      filtered = filtered.filter(
        (item) => item.counter?.toLowerCase() === counter.toLowerCase()
      );
    }

    // Then apply text search
    if (q?.trim()) {
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

    // Apply dietary preferences filter
    if (studentPreferences) {
      filtered = filtered.filter((item) => {
        if (!item.food_info) return false;
        if (studentPreferences.is_veg && !item.food_info.veg) return false;
        if (studentPreferences.is_vegan && !item.food_info.vegan) return false;
        if (studentPreferences.is_gluten_free && !item.food_info.gluten_free) return false;
        return true;
      });
    }

    setFilteredMenu(filtered);
  };

  const handleDiningHallSelect = (hall) => {
    // Set loading state first
    setSwitchingView(true);

    // Use setTimeout to create a visual separation (allows loading UI to render)
    setTimeout(() => {
      setSelectedDiningHall(hall);
      setSelectedCounter(null);

      // Reset loading after a brief delay
      setTimeout(() => {
        setSwitchingView(false);
      }, 300);
    }, 100);
  };

  const handleCounterFilter = (counter) => {
    setSwitchingView(true);

    setTimeout(() => {
      const newCounter = counter === selectedCounter ? null : counter;
      setSelectedCounter(newCounter);

      setTimeout(() => {
        setSwitchingView(false);
      }, 300);
    }, 100);
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

  // Render loading state
  if (loading) {
    return (
      <>
        <Header showItemsTab={false} onSearch={handleSearch} onProfileClick={toggleProfile} />
        <div className="pt-20 px-4 md:px-6 lg:px-8 mt-20 flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008b9e]"></div>
            <p className="mt-2 text-gray-600">Loading meals...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showItemsTab={false} onSearch={handleSearch} onProfileClick={toggleProfile} />

      <div className="pt-20 px-4 md:px-6 lg:px-8 mt-20">
        {showProfile ? (
          <UserProfile onBack={() => setShowProfile(false)} />
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
                        className={`flex flex-col items-center justify-center w-20 h-28 rounded-full transition shadow-sm text-sm font-medium ${selectedCounter === counter
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
                    onClick={() => handleDiningHallSelect(null)}
                    className="px-4 py-2 bg-[#ebf6f7] rounded-xl hover:bg-[#bde6ea] self-start transition-colors"
                  >
                    Change Dining Hall
                  </button>
                </div>

                {switchingView ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008b9e]"></div>
                  </div>
                ) : (
                  <>
                    {topRecommendation && (
                      <div className="mb-6">
                        <h2 className="text-xl text-[#303030] mb-2">Recommended for You</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <MenuCard
                            item={topRecommendation}
                            onClick={handleCardClick}
                            isFavorited={favoriteIds.includes(topRecommendation.food_info?.id)}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
                    )}

                    <h2 className="text-xl text-[#303030] mb-2">All Meals</h2>
                    {filteredMenu.length === 0 && (
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
                      {filteredMenu
                        .filter(item => item !== topRecommendation) // Remove the top recommendation from the list
                        .map((item) => (
                          <MenuCard
                            key={item.id}
                            item={item}
                            onClick={handleCardClick}
                            isFavorited={favoriteIds.includes(item.food_info?.id)}
                          />
                        ))}
                    </div>
                  </>
                )}
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