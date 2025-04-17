import { Input } from "@/components/ui/input";
import { Search, UserCircle } from "lucide-react";

const Header = ({ activeTab, setActiveTab, showItemsTab = true }) => (
  <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-[1400px] bg-[#fff9f0] rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between z-50">
    {/* Left: Nutri-Uni logo or name */}
    <div className="text-2xl text-[#303030] tracking-tight">
      Nutri-Uni
    </div>

    {/* Center: Search Bar */}
    <div className="relative w-120 gap-60">
      <Input
        className="bg-white border border-[#e5dcdc] rounded-[10px] pl-10 py-2"
        placeholder="Search"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>

    {/* Right: Nav Tabs + User */}
    <div className="flex items-center gap-8">
      {/* Tabs */}
      <nav className="flex gap-6 font-medium text-sm">
        {showItemsTab && (
          <button
            onClick={() => setActiveTab("items")}
            className={`hover:underline ${
              activeTab === "items"
                ? "text-[#008b9e] underline font-semibold"
                : "text-[#303030]"
            }`}
          >
            Items
          </button>
        )}
        <button
          onClick={() => setActiveTab("menu")}
          className={`hover:underline ${
            activeTab === "menu"
              ? "text-[#008b9e] underline font-semibold"
              : "text-[#303030]"
          }`}
        >
          Week’s Menu
        </button>
      </nav>

      {/* User Icon */}
      <UserCircle className="h-6 w-6 text-[#F9A826]" />
    </div>
  </header>
);

export default Header;