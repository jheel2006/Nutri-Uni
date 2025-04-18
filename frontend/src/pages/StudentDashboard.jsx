import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getWeekMenu } from "../api/meals";
import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import DiningHallSelection from "@/components/DiningHallSelection";
import { NutritionInfo } from "@/components/NutritionInfo";

const DAILY_VALUES = {
  energy: 2000,
  fats: 70,
  protein: 50,
  sugar: 30,
  salt: 6
};

function StudentDashboard() {
  const { user } = useUser();
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [selectedDiningHall, setSelectedDiningHall] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");

  const calculateKJ = (kcal) => kcal ? Math.round(kcal * 4.184) : null;
  const calculatePercentage = (value, nutrient) => {
    if (!value || !DAILY_VALUES[nutrient]) return null;
    return Math.round((value / DAILY_VALUES[nutrient]) * 100);
  };

  const enhanceMenuData = (menuData) => {
    return menuData.map(item => ({
      ...item,
      food_info: item.food_info ? {
        ...item.food_info,
        energy_kj: calculateKJ(item.food_info.energy),
        energy_percent: calculatePercentage(item.food_info.energy, 'energy'),
        fats_percent: calculatePercentage(item.food_info.fats, 'fats'),
        protein_percent: calculatePercentage(item.food_info.protein, 'protein'),
        sugar_percent: calculatePercentage(item.food_info.sugar, 'sugar'),
        salt_percent: calculatePercentage(item.food_info.salt, 'salt')
      } : null
    }));
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await getWeekMenu();
        setMenu(enhanceMenuData(res.data));
        setFilteredMenu(enhanceMenuData(res.data));
      } catch (err) {
        setError("Unable to load meals. Please try again later.");
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const handleSearch = (q) => {
    setQuery(q);
    applyFilters(q, selectedCounter, selectedDiningHall);
  };

  const applyFilters = (q, counter, diningHall) => {
    let filtered = [...menu];
    
    if (diningHall) {
      filtered = filtered.filter(item => 
        item.dining_hall?.toLowerCase() === diningHall.toLowerCase()
      );
    }

    if (counter) {
      filtered = filtered.filter(item => 
        item.counter?.toLowerCase() === counter.toLowerCase()
      );
    }

    if (q.trim()) {
      const keyword = q.toLowerCase();
      filtered = filtered.filter(item => {
        if (!item.food_info) return false;
        
        if (item.food_info.item_name?.toLowerCase().includes(keyword)) {
          return true;
        }
        
        if (item.food_info.allergens?.some(allergen => 
          allergen.toLowerCase().includes(keyword)
        )) {
          return true;
        }
        
        const dietaryKeywords = [];
        if (item.food_info.veg) dietaryKeywords.push('vegetarian');
        if (item.food_info.vegan) dietaryKeywords.push('vegan');
        if (item.food_info.gluten_free) dietaryKeywords.push('gluten free');
        
        return dietaryKeywords.some(tag => 
          tag.includes(keyword)
        );
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
    const hallMeals = menu.filter(item => 
      item.dining_hall?.toLowerCase() === selectedDiningHall.toLowerCase()
    );
    return [...new Set(hallMeals.map(item => item.counter))].filter(Boolean);
  };

  const uniqueDiningHalls = [...new Set(menu.map(item => item.dining_hall))];

  return (
    <>
      <Header 
        showItemsTab={false} 
        onSearch={handleSearch}
      />

      <div className="pt-20 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          <h1 className="text-2xl font-header-primary text-[#303030]">
            Hello {user?.firstName || 'there'},
          </h1>

          {!selectedDiningHall ? (
            <DiningHallSelection
              diningHalls={uniqueDiningHalls}
              onSelect={handleDiningHallSelect}
            />
          ) : (
            <>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-3">
                  {getAvailableCounters().map(counter => (
                    <button
                      key={counter}
                      onClick={() => handleCounterFilter(counter)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCounter === counter
                          ? "bg-[#008b9e] text-white"
                          : "bg-[#ebf6f7] text-gray-800 hover:bg-[#bde6ea]"
                      }`}
                    >
                      {counter}
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

              {error && (
                <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
              )}

              {!loading && filteredMenu.length === 0 && (
                <div className="text-center text-lg text-gray-500 mt-4">
                  {query.trim() 
                    ? "No meals found. Try a different keyword."
                    : selectedCounter
                      ? "No meals available at this counter today."
                      : "No meals found."}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenu.map(item => (
                  <MenuCard 
                    key={item.id} 
                    item={item} 
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
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
