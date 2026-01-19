"use client";

import { useState, useEffect } from "react";
import { MenuData, MealPeriod } from "@/types";
import MobileNav from "@/components/mobile-nav";
import MainContent from "@/components/main-content";
import { getMealPeriodFilters, getCurrentMealPeriod } from "@/utils/menu-utils";

interface ClientMainWrapperProps {
  menuData: MenuData;
}

export default function ClientMainWrapper({
  menuData,
}: ClientMainWrapperProps) {
  const [view, setView] = useState<"halls" | "items" | "tracking">("halls");
  const [isDetailedLoading, setIsDetailedLoading] = useState(false);
  const [fullData, setFullData] = useState<MenuData>(menuData);
  const [mealPeriod, setMealPeriod] = useState<MealPeriod | "all">(
    getCurrentMealPeriod()
  );

  // We already have the initial data, but we might want to refresh it client-side
  // or load additional details if needed
  useEffect(() => {
    setFullData(menuData);
    setIsDetailedLoading(false);
  }, [menuData]);

  // Update meal period automatically when time changes
  useEffect(() => {
    const checkMealPeriod = () => {
      const current = getCurrentMealPeriod();
      if (mealPeriod !== "all" && mealPeriod !== current) {
        setMealPeriod(current);
      }
    };

    const interval = setInterval(checkMealPeriod, 60000);
    return () => clearInterval(interval);
  }, [mealPeriod]);

  return (
    <>
      <div className="md:hidden">
        <MobileNav view={view} setView={setView} mealPeriod={mealPeriod} setMealPeriod={setMealPeriod} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="hidden md:block w-64 shrink-0 space-y-4">
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

          {/* Meal Period Selector */}
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
            <h2 className="font-medium mb-4">Meal Time</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setMealPeriod("all")}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  mealPeriod === "all"
                    ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                }`}
              >
                All Day
              </button>
              {getMealPeriodFilters().map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setMealPeriod(filter.id as MealPeriod)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                    mealPeriod === filter.id
                      ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                      : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                  }`}
                  title={filter.timeRange}
                >
                  <span>{filter.label}</span>
                  {getCurrentMealPeriod() === filter.id && (
                    <span className="text-xs bg-zinc-200 dark:bg-zinc-600 px-1.5 py-0.5 rounded">now</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <MainContent
            view={view}
            menuData={fullData}
            isDetailedLoading={isDetailedLoading}
            mealPeriod={mealPeriod}
          />
        </main>
      </div>
    </>
  );
}
