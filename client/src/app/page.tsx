"use client";
import { useState, useEffect } from "react";
import { calculateMacros } from "@/utils/menu-utils";
import MobileNav from "@/components/mobile-nav";
import MainContent from "@/components/main-content";
import { DiningHall, MenuCategory, MenuData } from "@/types";

export default function Home() {
  const [view, setView] = useState<"halls" | "items" | "tracking">("halls");
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailedLoading, setIsDetailedLoading] = useState(true);

  useEffect(() => {
    // Load mini menu first for fast initial render
    const loadMiniMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minimenu`);
        const data = await res.json();

        // Process data to calculate macro percentages
        const processedData = {
          halls: data.map((hall: DiningHall) => ({
            ...hall,
            menu: hall.menu.map((category: MenuCategory) => ({
              ...category,
              items: category.items.map(calculateMacros),
            })),
          })),
        };

        setMenuData(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load mini menu:", error);
        setIsLoading(false);
      }
    };

    // Load full menu with ingredients in the background
    const loadFullMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`);
        const data = await res.json();

        // Process data to calculate macro percentages
        const processedData = {
          halls: data.map((hall: DiningHall) => ({
            ...hall,
            menu: hall.menu.map((category: MenuCategory) => ({
              ...category,
              items: category.items.map(calculateMacros),
            })),
          })),
        };

        setMenuData(processedData);
        setIsDetailedLoading(false);
      } catch (error) {
        console.error("Failed to load full menu:", error);
        setIsDetailedLoading(false);
      }
    };

    loadMiniMenu();
    loadFullMenu();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <header className="px-4 py-3 bg-zinc-800 dark:bg-zinc-950 text-white">
        <h1 className="text-xl font-bold">Dining Menu</h1>
      </header>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-zinc-500">Loading menu data...</p>
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <MobileNav view={view} setView={setView} />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <aside className="hidden md:block w-64 shrink-0">
                <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                  <h2 className="font-medium mb-4">Views</h2>
                  <nav className="space-y-1">
                    <button
                      onClick={() => setView("halls")}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        view === "halls"
                          ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                      }`}
                    >
                      Dining Halls
                    </button>
                    <button
                      onClick={() => setView("items")}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        view === "items"
                          ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                      }`}
                    >
                      All Items
                    </button>
                    <button
                      onClick={() => setView("tracking")}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        view === "tracking"
                          ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                      }`}
                    >
                      Meal Tracking
                    </button>
                  </nav>
                </div>
              </aside>

              <main className="flex-1">
                {menuData && (
                  <MainContent
                    view={view}
                    menuData={menuData}
                    isDetailedLoading={isDetailedLoading}
                  />
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
