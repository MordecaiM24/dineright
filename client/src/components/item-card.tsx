import { useState } from "react";
import { MenuItem } from "@/types";
import MacroPieChart from "@/components/macro-pie-chart";
import DietaryBadges from "@/components/dietary-badges";
import TrackMealButton from "./track-meal-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ItemCardProps {
  item: MenuItem;
  hallName?: string;
  categoryName?: string;
  isDetailedLoading?: boolean;
  showSource?: boolean;
}

export default function ItemCard({
  item,
  hallName,
  categoryName,
  isDetailedLoading = false,
  showSource = false,
}: ItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className={`p-4 flex flex-col justify-between rounded-lg bg-white dark:bg-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors`}
        >
          {showSource && hallName && (
            <div className="flex justify-end mb-1">
              <span className="text-xs text-zinc-500">{hallName}</span>
            </div>
          )}

          <div className="flex justify-between items-start">
            <h4 className="font-medium mb-1">{item.item}</h4>
            <span className="text-sm font-mono">
              {item.nutrition.Calories} cal
            </span>
          </div>

          <DietaryBadges dietaryInfo={item.dietary_info} />

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2 text-xs">
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded">
                P: {item.nutrition.Protein}g
              </span>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                C: {item.nutrition["Total Carbohydrate"]}g
              </span>
              <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded">
                F: {item.nutrition["Total Fat"]}g
              </span>
            </div>

            <div className="h-full flex items-center justify-center">
              {hallName && categoryName && (
                <div>
                  <TrackMealButton
                    item={item}
                    hall={hallName}
                    category={categoryName}
                    mini={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.item}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {(hallName || categoryName) && (
            <div className="text-sm text-zinc-500 mb-2">
              {hallName && `From ${hallName}`}
              {categoryName && hallName && ` • ${categoryName}`}
              {categoryName && !hallName && categoryName}
            </div>
          )}

          <DietaryBadges dietaryInfo={item.dietary_info} />

          <div className="mt-4 h-40">
            <MacroPieChart
              protein={item.nutrition.proteinPercent || 0}
              carbs={item.nutrition.carbPercent || 0}
              fat={item.nutrition.fatPercent || 0}
              showLabels
            />
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Nutrition Info</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Serving Size: {item.nutrition["Serving Size"]}</div>
              <div>Calories: {item.nutrition.Calories}</div>
              <div>Protein: {item.nutrition.Protein}g</div>
              <div>Carbs: {item.nutrition["Total Carbohydrate"]}g</div>
              <div>Fat: {item.nutrition["Total Fat"]}g</div>
              <div>Fiber: {item.nutrition.Fiber}g</div>
              <div>Sodium: {item.nutrition.Sodium}mg</div>
            </div>
          </div>

          {!isDetailedLoading && item.nutrition.ingredients && (
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Ingredients</h4>
              <p className="text-sm h-24 overflow-y-scroll text-zinc-600 dark:text-zinc-400">
                {item.nutrition.ingredients}
              </p>
            </div>
          )}

          {isDetailedLoading && (
            <div className="mt-6 italic text-sm text-zinc-500">
              Loading detailed ingredients...
            </div>
          )}

          {hallName && categoryName && (
            <div className="mt-6">
              <TrackMealButton
                item={item}
                hall={hallName}
                category={categoryName}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
