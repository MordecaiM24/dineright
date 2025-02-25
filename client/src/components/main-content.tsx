import { useState } from "react";
import DiningHallView from "./dining-hall-view";
import AllItemsView from "./all-items-view";
import TrackingView from "./tracking-view";
import { MenuData } from "@/types";

interface MainContentProps {
  view: "halls" | "items" | "tracking";
  menuData: MenuData;
  isDetailedLoading: boolean;
}

export default function MainContent({
  view,
  menuData,
  isDetailedLoading,
}: MainContentProps) {
  return (
    <div className="pb-16 md:pb-0">
      {view === "halls" ? (
        <DiningHallView
          menuData={menuData}
          isDetailedLoading={isDetailedLoading}
        />
      ) : view === "items" ? (
        <AllItemsView
          menuData={menuData}
          isDetailedLoading={isDetailedLoading}
        />
      ) : (
        <TrackingView />
      )}
    </div>
  );
}
