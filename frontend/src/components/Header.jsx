// // Header.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, Menu } from "lucide-react";

const Header = ({ activeTab, setActiveTab, setTabRefreshKey, showItemsTab = true, onSearch, onProfileClick, showSearch }) => {
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-[#fff9f0] shadow-lg px-4 py-3 md:top-6 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[92%] md:max-w-[1400px] md:rounded-2xl z-50">
      <div className="flex items-center justify-between w-full">
        {/* Mobile menu icon */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6 text-[#303030]" />
        </button>

        {/* Logo */}
        <div className="text-xl md:text-2xl text-[#303030] tracking-tight whitespace-nowrap">
          Nutri-Uni
        </div>

        {/* Desktop search */}
        {showSearch && !mobileMenuOpen && (
          <div className="hidden md:block md:flex-1 md:max-w-md md:mx-4">
            <div className="relative">
              <Input
                className="bg-white border border-[#e5dcdc] rounded-[10px] pl-10 py-2 w-full"
                placeholder="Search meals by name, ingredient, or dietary category"
                value={searchValue}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Desktop nav + user */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 font-medium text-sm">
            {showItemsTab && (
              <button
                onClick={() => setActiveTab("items")}
                className={`cursor-pointer hover:underline ${
                  activeTab === "items"
                    ? "text-[#008b9e] underline font-semibold"
                    : "text-[#303030]"
                }`}
              >
                Items
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab("menu");
                if (typeof setTabRefreshKey === "function") {
                  setTabRefreshKey(prev => prev + 1);
                }
              }}
              className={`cursor-pointer hover:underline ${
                activeTab === "menu"
                  ? "text-[#008b9e] underline font-semibold"
                  : "text-[#303030]"
              }`}
            >
              Week's Menu
            </button>
          </nav>
          <UserCircle
            data-testid="profile-icon" // Added for testing
            className="h-6 w-6 text-[#F9A826] cursor-pointer"
            onClick={onProfileClick}
          />
        </div>

        {/* Mobile: search icon + user */}
        {!mobileMenuOpen && (
          <div className="flex items-center gap-4 md:hidden">
            {showSearch && (
              <Search
                className="h-5 w-5 text-[#303030] cursor-pointer"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              />
            )}
            <UserCircle
              className="h-6 w-6 text-[#F9A826] cursor-pointer"
              onClick={onProfileClick}
            />
          </div>
        )}
      </div>

      {/* Mobile: expanded search input */}
      {mobileSearchOpen && showSearch && (
        <div className="md:hidden mt-3">
          <div className="relative">
            <Input
              className="bg-white border border-[#e5dcdc] rounded-[10px] pl-10 py-2 w-full"
              placeholder="Search meals..."
              value={searchValue}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-4">
          <nav className="flex flex-col gap-4 font-medium text-sm">
            {showItemsTab && (
              <button
                onClick={() => {
                  setActiveTab("items");
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 ${
                  activeTab === "items"
                    ? "text-[#008b9e] font-semibold"
                    : "text-[#303030]"
                }`}
              >
                Items
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab("menu");
                if (typeof setTabRefreshKey === "function") {
                  setTabRefreshKey(prev => prev + 1);
                }
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 ${
                activeTab === "menu"
                  ? "text-[#008b9e] font-semibold"
                  : "text-[#303030]"
              }`}
            >
              Week's Menu
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
