import { LayoutGrid, UtensilsCrossed, ListChecks, Clock } from "lucide-react";
import { MealPeriod } from "@/types";
import { getMealPeriodFilters, getCurrentMealPeriod } from "@/utils/menu-utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavProps {
  view: "halls" | "items" | "tracking";
  setView: (view: "halls" | "items" | "tracking") => void;
  mealPeriod: MealPeriod | "all";
  setMealPeriod: (mealPeriod: MealPeriod | "all") => void;
}

export default function MobileNav({ view, setView, mealPeriod, setMealPeriod }: MobileNavProps) {
  const getMealLabel = () => {
    if (mealPeriod === "all") return "All";
    return mealPeriod;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 z-10">
      <div className="flex items-center">
        <button
          onClick={() => setView("halls")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${
            view === "halls" ? "text-black dark:text-white" : "text-zinc-500"
          }`}
        >
          <LayoutGrid size={20} />
          <span className="text-xs">Halls</span>
        </button>
        <button
          onClick={() => setView("items")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${
            view === "items" ? "text-black dark:text-white" : "text-zinc-500"
          }`}
        >
          <UtensilsCrossed size={20} />
          <span className="text-xs">Items</span>
        </button>
        <button
          onClick={() => setView("tracking")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${
            view === "tracking" ? "text-black dark:text-white" : "text-zinc-500"
          }`}
        >
          <ListChecks size={20} />
          <span className="text-xs">Tracking</span>
        </button>
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex-1 py-3 flex flex-col items-center gap-1 text-zinc-500"
            >
              <Clock size={20} />
              <span className="text-xs">{getMealLabel()}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Select Meal Time</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-2">
              <button
                onClick={() => setMealPeriod("all")}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  mealPeriod === "all"
                    ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                All Day
              </button>
              {getMealPeriodFilters().map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setMealPeriod(filter.id as MealPeriod)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                    mealPeriod === filter.id
                      ? "bg-zinc-100 dark:bg-zinc-700 font-medium"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">{filter.timeRange}</span>
                    {getCurrentMealPeriod() === filter.id && (
                      <span className="text-xs bg-zinc-200 dark:bg-zinc-600 px-1.5 py-0.5 rounded">now</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
