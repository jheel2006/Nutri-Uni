// src/__tests__/Header.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header";
import { MemoryRouter } from "react-router-dom";

describe("Header", () => {
  let setActiveTab;
  let setTabRefreshKey;
  let onSearch;
  let onProfileClick;

  beforeEach(() => {
    setActiveTab = vi.fn();
    setTabRefreshKey = vi.fn();
    onSearch = vi.fn();
    onProfileClick = vi.fn();
  });

  const renderHeader = (props = {}) => {
    return render(
      <MemoryRouter>
        <Header
          activeTab="menu"
          setActiveTab={setActiveTab}
          setTabRefreshKey={setTabRefreshKey}
          onSearch={onSearch}
          onProfileClick={onProfileClick}
          showSearch
          showItemsTab
          {...props}
        />
      </MemoryRouter>
    );
  };

  it("renders logo and profile icon", () => {
    renderHeader();
    expect(screen.getByText("Nutri-Uni")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toBeTruthy(); // Profile + nav + menu icon
  });

  it("calls onSearch when search input changes", () => {
    renderHeader();
    const input = screen.getByPlaceholderText(/search meals/i);
    fireEvent.change(input, { target: { value: "paneer" } });
    expect(onSearch).toHaveBeenCalledWith("paneer");
  });

  it("clicking profile icon triggers onProfileClick", () => {
    renderHeader();
    const buttons = screen.getAllByRole("button");
    const profileBtn = screen.getByTestId("profile-icon");
    fireEvent.click(profileBtn);
    expect(onProfileClick).toHaveBeenCalled();
  });

  it("clicking Week's Menu tab triggers setActiveTab and refresh", () => {
    renderHeader();
    const menuBtn = screen.getByText("Week's Menu");
    fireEvent.click(menuBtn);
    expect(setActiveTab).toHaveBeenCalledWith("menu");
    expect(setTabRefreshKey).toHaveBeenCalled();
  });

  it("clicking Items tab triggers setActiveTab", () => {
    renderHeader({ activeTab: "menu" });
    const itemsBtn = screen.getByText("Items");
    fireEvent.click(itemsBtn);
    expect(setActiveTab).toHaveBeenCalledWith("items");
  });

  it("opens mobile search and menu", () => {
    window.innerWidth = 500; // simulate mobile
    renderHeader();
  
    // Open mobile menu
    const menuToggle = screen.getAllByRole("button")[0];
    fireEvent.click(menuToggle);
  
    // There will now be TWO "Week's Menu" buttons; choose the one inside the mobile menu
    const weeksMenuButtons = screen.getAllByText("Week's Menu");
    expect(weeksMenuButtons.length).toBeGreaterThan(1);
  
    fireEvent.click(weeksMenuButtons[1]); // Click the mobile one
    expect(setActiveTab).toHaveBeenCalledWith("menu");
  });
  
});
