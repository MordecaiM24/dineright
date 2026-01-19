import DiningHallView from "./dining-hall-view";
import AllItemsView from "./all-items-view";
import TrackingView from "./tracking-view";
import { MenuData, MealPeriod } from "@/types";

interface MainContentProps {
  view: "halls" | "items" | "tracking";
  menuData: MenuData;
  isDetailedLoading: boolean;
  mealPeriod: MealPeriod | "all";
}

export default function MainContent({
  view,
  menuData,
  isDetailedLoading,
  mealPeriod,
}: MainContentProps) {
  return (
    <div className="pb-16 md:pb-0">
      {view === "halls" ? (
        <DiningHallView
          menuData={menuData}
          isDetailedLoading={isDetailedLoading}
          mealPeriod={mealPeriod}
        />
      ) : view === "items" ? (
        <AllItemsView
          menuData={menuData}
          isDetailedLoading={isDetailedLoading}
          mealPeriod={mealPeriod}
        />
      ) : (
        <TrackingView />
      )}
    </div>
  );
}
