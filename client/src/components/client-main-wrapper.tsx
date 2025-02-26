"use client";

import { useState, useEffect } from "react";
import { MenuData } from "@/types";
import MobileNav from "@/components/mobile-nav";
import MainContent from "@/components/main-content";

interface ClientMainWrapperProps {
  menuData: MenuData;
}

export default function ClientMainWrapper({
  menuData,
}: ClientMainWrapperProps) {
  const [view, setView] = useState<"halls" | "items" | "tracking">("halls");
  const [isDetailedLoading, setIsDetailedLoading] = useState(false);
  const [fullData, setFullData] = useState<MenuData>(menuData);

  // We already have the initial data, but we might want to refresh it client-side
  // or load additional details if needed
  useEffect(() => {
    setFullData(menuData);
    setIsDetailedLoading(false);
  }, [menuData]);

  return (
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
          <MainContent
            view={view}
            menuData={fullData}
            isDetailedLoading={isDetailedLoading}
          />
        </main>
      </div>
    </>
  );
}
