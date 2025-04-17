import { useEffect, useState } from "react";
import { getWeekMenu } from "../api/meals";
import MenuTable from "@/components/MenuTable";
import Header from "@/components/Header"; 

function StudentDashboard() {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await getWeekMenu();
        setMenu(res.data);
        setFilteredMenu(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load meals at counter. Please try again later.");
      }
      setLoading(false);
    };

    fetchMenu();
  }, []);

  const handleSearch = (q) => {
    setQuery(q);
    applyFilters(q, selectedCounter);
  };

  const handleCounterFilter = (counter) => {
    const newCounter = counter === selectedCounter ? null : counter;
    setSelectedCounter(newCounter);
    applyFilters(query, newCounter);
  };

  const applyFilters = (q, counter) => {
    let filtered = [...menu];

    if (counter) {
      filtered = filtered.filter((item) => item.counter?.toLowerCase() === counter.toLowerCase());
    }

    if (q.trim()) {
      const keyword = q.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.item_name?.toLowerCase().includes(keyword) ||
          (item.allergens && item.allergens.join(" ").toLowerCase().includes(keyword)) ||
          (item.vegan && keyword === "vegan") ||
          (item.veg && keyword === "vegetarian") ||
          (item.gluten_free && keyword === "gluten free")
      );
    }

    setFilteredMenu(filtered);
  };

  const uniqueCounters = [...new Set(menu.map((item) => item.counter))];

  return (
    <>
      <Header showItemsTab={false} /> 

      <div className="pt-20 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          <h1 className="text-2xl font-header-primary text-[#303030]">Student Dashboard</h1>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search meals by name, ingredient, or dietary category"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-xl shadow"
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {uniqueCounters.map((counter) => (
              <button
                key={counter}
                onClick={() => handleCounterFilter(counter)}
                className={`px-4 py-2 rounded-xl shadow ${
                  selectedCounter === counter ? "bg-[#008b9e] text-white" : "bg-gray-200"
                }`}
              >
                {counter}
              </button>
            ))}
          </div>

          {error && (
            <div className="text-red-600 mt-4 text-lg font-medium">{error}</div>
          )}

          {!loading && filteredMenu.length === 0 && !error && (
            <div className="text-center text-lg text-gray-500 mt-4">
              {selectedCounter
                ? "No meals available at this counter today."
                : "No meals found. Try a different keyword."}
            </div>
          )}

          <MenuTable menuItems={filteredMenu} loading={loading} hideAdminControls /> 
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;
