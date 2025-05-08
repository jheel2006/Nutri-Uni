// StudentDashboard.jsx - 
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { getRecommendations, getStudentInfo } from "../api/students";
import { getFavorites } from "../api/favorites";
import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import DiningHallSelection from "@/components/DiningHallSelection";
import { NutritionInfo } from "@/components/NutritionInfo";
import UserProfile from "@/components/UserProfile";
// Import Lucide icons
import {
  Utensils,
  Salad,
  Fish,
  Flame,
  BookOpen,
  Sandwich,
  Drumstick,
  Pizza,
  Leaf,
  CircleDot,
  EggFried,
  Soup,
  ChefHat
} from "lucide-react";

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
  const location = useLocation();
  // Match AdminDashboard pattern: activeTab state at the top
  const [activeTab, setActiveTab] = useState("menu");
  const [allMenu, setAllMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingView, setSwitchingView] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [selectedDiningHall, setSelectedDiningHall] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [topRecommendations, setTopRecommendations] = useState([]);
  const [studentPreferences, setStudentPreferences] = useState(null);
  const [profileJustClosed, setProfileJustClosed] = useState(false);
  const [favoritesUpdated, setFavoritesUpdated] = useState(false);
  const [selectedDay, setSelectedDay] = useState("All Days");
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const recommendedIds = topRecommendations?.map(item => item.id) || [];

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

  const fetchData = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      const [menuRes, studentRes, favoritesRes] = await Promise.all([
        getRecommendations(user.id),
        getStudentInfo(user.id),
        getFavorites(user.id),
      ]);
      console.log("Raw menu data", menuRes.data);
      const enhancedMenu = enhanceMenuData(menuRes.data);
      const studentData = studentRes.data;
      const favoriteIds = favoritesRes.data.map((f) => f.food_id);

      setStudentPreferences(studentData);
      setFavoriteIds(favoriteIds);
      setAllMenu(enhancedMenu);
    } catch (err) {
      console.error(err);
      setError("Unable to load meals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    fetchData();
  }, [user, location.state]);

  useEffect(() => {
    if (favoritesUpdated) {
      fetchData();
      setFavoritesUpdated(false);
    }
  }, [favoritesUpdated]);

  useEffect(() => {
    if (profileJustClosed) {
      setSelectedDiningHall(null);
      setSelectedCounter(null);
      fetchData();
      setProfileJustClosed(false);
    }
  }, [profileJustClosed]);

  useEffect(() => {
    if (loading) return;
    applyFilters(query, selectedCounter, selectedDiningHall);
  }, [allMenu, loading, selectedDiningHall, selectedCounter, query, selectedDay]);

  useEffect(() => {
    if (filteredMenu.length === 0) {
      setTopRecommendations([]);
      return;
    }

    const favoriteMeals = filteredMenu.filter((m) => m.isFavorite).sort((a, b) => b.health_score - a.health_score);
    const nonFavoriteMeals = filteredMenu.filter((m) => !m.isFavorite).sort((a, b) => b.health_score - a.health_score);

    let recommendations = [];
    if (favoriteMeals.length >= 3) {
      recommendations = favoriteMeals.slice(0, 3);
    } else {
      recommendations = [...favoriteMeals, ...nonFavoriteMeals.slice(0, 3 - favoriteMeals.length)];
    }

    setTopRecommendations(recommendations);
  }, [filteredMenu]);

  // Always clear selected dining hall/counter, hide profile, and fetch data on menu tab
  useEffect(() => {
    if (activeTab === "menu") {
      setShowProfile(false);
      setSelectedDiningHall(null);
      setSelectedCounter(null);
      setSelectedDay("All Days");
      fetchData();
    }
  }, [activeTab, tabRefreshKey]);

  const handleSearch = (q) => {
    setQuery(q);
  };

  const applyFilters = (q, counter, diningHall) => {
    let filtered = [...allMenu];

    // First, consolidate items with the same food_info.id
    const uniqueItems = new Map();
    filtered.forEach(item => {
      if (!item.food_info?.id) return;

      if (!uniqueItems.has(item.food_info.id)) {
        uniqueItems.set(item.food_info.id, {
          ...item,
          days_available: new Set()
        });
      }

      const existingItem = uniqueItems.get(item.food_info.id);
      if (item.day || item.date_available) {
        existingItem.days_available.add(item.day || item.date_available);
      }
    });

    filtered = Array.from(uniqueItems.values()).map(item => ({
      ...item,
      days_available: Array.from(item.days_available).sort(),
      health_score: item.food_info?.health_score || 0,
      isFavorite: favoriteIds.includes(item.food_info?.id),
    }));

    if (diningHall) {
      filtered = filtered.filter(item => item.dining_hall?.toLowerCase() === diningHall.toLowerCase());
    }
    if (counter) {
      filtered = filtered.filter(item => item.counter?.toLowerCase() === counter.toLowerCase());
    }
    if (selectedDay && selectedDay !== "All Days") {
      filtered = filtered.filter((item) => {
        const itemDays = item.days_available || [];
        const selected = selectedDay.trim().toLowerCase();
        return itemDays.some(day => day.toLowerCase() === selected);
      });
    }

    if (q?.trim()) {
      const keyword = q.toLowerCase();
      filtered = filtered.filter(item => {
        if (!item.food_info) return false;
        if (item.food_info.item_name?.toLowerCase().includes(keyword)) return true;
        if (item.food_info.allergens?.some(a => a.toLowerCase().includes(keyword))) return true;
        const tags = [];
        if (item.food_info.veg) tags.push("vegetarian");
        if (item.food_info.vegan) tags.push("vegan");
        if (item.food_info.gluten_free) tags.push("gluten free");
        return tags.some(tag => tag.includes(keyword));
      });
    }
    if (studentPreferences) {
      filtered = filtered.filter(item => {
        if (!item.food_info) return false;
        if (studentPreferences.is_veg && !item.food_info.veg) return false;
        if (studentPreferences.is_vegan && !item.food_info.vegan) return false;
        if (studentPreferences.is_gluten_free && !item.food_info.gluten_free) return false;
        return true;
      });
    }
    if (studentPreferences?.allergens?.length > 0) {
      const allergens = studentPreferences.allergens.map(a => a.toLowerCase());
      filtered = filtered.filter(item => {
        const itemAllergens = item.food_info?.allergens || [];
        return !itemAllergens.some(a => allergens.includes(a.toLowerCase()));
      });
    }

    setFilteredMenu(filtered);
  };

  const handleDiningHallSelect = (hall) => {
    setSwitchingView(true);
    setTimeout(() => {
      setSelectedDiningHall(hall);
      setSelectedCounter(null);
      setTimeout(() => setSwitchingView(false), 300);
    }, 100);
  };

  const handleCounterFilter = (counter) => {
    setSwitchingView(true);
    setTimeout(() => {
      const newCounter = counter === selectedCounter ? null : counter;
      setSelectedCounter(newCounter);
      setTimeout(() => setSwitchingView(false), 300);
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

  // const counterIcons = {
  //   Mongolian: "🥢",
  //   Salad: "🥗",
  //   Japanese: "🍣",
  //   Grill: "🔥",
  //   Subjects: "📚",
  //   Flavors: "🌶️",
  //   Italian: "🍝",
  //   Vegan: "🌱",
  //   Chakra: "🔀",
  //   "Los Amigos": "🌮️",
  //   Asiatic: "🍜",
  //   Pasta: "🍝",
  // };
  // Replace emoji icons with Lucide React icons
  const getCounterIcon = (counter) => {
    switch (counter) {
      case "Mongolian":
        return <Utensils size={28} />;
      case "Salad":
        return <Salad size={28} />;
      case "Japanese":
        return <Fish size={28} />;
      case "Grill":
        return <Flame size={28} />;
      case "Subjects":
        return <Sandwich size={28} />;
      case "Flavors":
        return <Drumstick size={28} />;
      case "Italian":
        return <Pizza size={28} />;
      case "Vegan":
        return <Leaf size={28} />;
      case "Chakra":
        return <CircleDot size={28} />;
      case "Los Amigos":
        return <EggFried size={28} />;
      case "Asiatic":
        return <Soup size={28} />;
      case "Pasta":
        return <ChefHat size={28} />;
      default:
        return <Utensils size={28} />;
    }
  };

  const handleProfileClose = () => {
    setShowProfile(false);
    setProfileJustClosed(true);
  };

  const uniqueDiningHalls = Object.keys(hallCounters);

  if (loading) {
    return (
      <>
        <Header
          showItemsTab={false}
          onSearch={handleSearch}
          onProfileClick={toggleProfile}
          showSearch={!!selectedDiningHall}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTabRefreshKey={setTabRefreshKey}
        />
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
      <Header
        showItemsTab={false}
        onSearch={handleSearch}
        onProfileClick={toggleProfile}
        showSearch={!!selectedDiningHall}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setTabRefreshKey={setTabRefreshKey}
      />

      <div className="pt-20 px-4 md:px-6 lg:px-8 mt-20">
        {showProfile ? (
          <UserProfile onBack={handleProfileClose} />
        ) : (
          <div className="w-full max-w-[1600px] mx-auto space-y-6">
            <h1 className="text-2xl font-header-primary text-[#303030]">
              Hello {user?.firstName || "there"},
            </h1>
            {!selectedDiningHall ? (
              <DiningHallSelection diningHalls={uniqueDiningHalls} onSelect={handleDiningHallSelect} />
            ) : (
              <>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {getAvailableCounters().map((counter) => (
                      <button
                        key={counter}
                        onClick={() => handleCounterFilter(counter)}
                        className={`cursor-pointer flex flex-col items-center justify-center w-22 h-30 rounded-full transition shadow-sm text-sm font-medium ${selectedCounter === counter
                          ? "bg-[#AEE1E1] text-[#303030]"
                          : "bg-[#f3fafa] hover:bg-[#e1f0f0] text-[#303030]"
                          }`}
                      >
                        <div className="flex items-center justify-center w-15 h-15 bg-white rounded-full mb-2 shadow-sm">
                          {getCounterIcon(counter)}
                        </div>
                        <span>{counter}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 items-center w-full justify-end">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="px-4 py-2 border rounded-lg bg-white text-[#303030] shadow"
                    >
                      <option value="All Days">All Days </option>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDiningHallSelect(null)}
                      className="px-4 py-2 bg-[#ebf6f7] rounded-xl hover:bg-[#bde6ea] transition-colors"
                    >
                      Change Dining Hall
                    </button>
                  </div>
                </div>

                {switchingView ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008b9e]"></div>
                  </div>
                ) : (
                  <>
                    {topRecommendations.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl text-[#303030] mb-2">Recommended for You</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {topRecommendations
                            .filter(item => selectedCounter ? item.counter === selectedCounter : true)
                            .map((item) => (
                              <MenuCard
                                key={item.id}
                                item={item}
                                onClick={handleCardClick}
                                isFavorited={favoriteIds.includes(item.food_info?.id)}
                                onFavoriteUpdate={() => setFavoritesUpdated(true)}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
                    )}

                    <h2 className="text-xl text-[#303030] mb-2">Other Meals</h2>
                    {filteredMenu.length === 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-sm text-yellow-700">
                          {query.trim()
                            ? "No meals found. Try a different keyword."
                            : selectedCounter
                              ? "No meals available at this counter today."
                              : "No meals currently available in this dining hall."}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMenu
                        .filter(item => !recommendedIds.includes(item.id))
                        .filter(item => selectedCounter ? item.counter === selectedCounter : true)
                        .map((item) => (
                          <MenuCard
                            key={item.id}
                            item={item}
                            onClick={handleCardClick}
                            isFavorited={favoriteIds.includes(item.food_info?.id)}
                            onFavoriteUpdate={() => setFavoritesUpdated(true)}
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
