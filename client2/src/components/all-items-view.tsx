import { useState, useMemo } from "react";
import { MenuData, MenuItem } from "@/types";
import MacroPieChart from "@/components/macro-pie-chart";
import DietaryBadges from "@/components/dietary-badges";
import AddToTrackingButton from "./add-to-tracking-button";
import {
  getAllergenFilters,
  getDietaryFilters,
  getSortOptions,
} from "@/utils/menu-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AllItemsViewProps {
  menuData: MenuData;
  isDetailedLoading: boolean;
}

export default function AllItemsView({
  menuData,
  isDetailedLoading,
}: AllItemsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergenFilters, setAllergenFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Create a map to find which hall and category an item belongs to
  const itemSourceMap = useMemo(() => {
    const map = new Map();

    menuData.halls.forEach((hall) => {
      hall.menu.forEach((category) => {
        category.items.forEach((item) => {
          map.set(item.item, { hall: hall.hall, category: category.category });
        });
      });
    });

    return map;
  }, [menuData]);

  // Get all items from all halls and categories
  const allItems = useMemo(() => {
    const items: MenuItem[] = [];
    menuData.halls.forEach((hall) => {
      hall.menu.forEach((category) => {
        items.push(...category.items);
      });
    });
    return items;
  }, [menuData]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => item.item.toLowerCase().includes(query));
    }

    // Apply dietary filters
    if (dietaryFilters.length > 0) {
      result = result.filter((item) =>
        dietaryFilters.every((filter) => item.dietary_info.includes(filter))
      );
    }

    // Apply allergen filters
    if (allergenFilters.length > 0) {
      result = result.filter((item) =>
        allergenFilters.every((filter) => !item.dietary_info.includes(filter))
      );
    }

    // Apply sorting
    if (sortOption) {
      result.sort((a, b) => {
        switch (sortOption) {
          case "calories_high":
            return b.nutrition.Calories - a.nutrition.Calories;
          case "calories_low":
            return a.nutrition.Calories - b.nutrition.Calories;
          case "protein_high":
            return (
              (b.nutrition.proteinPercent || 0) -
              (a.nutrition.proteinPercent || 0)
            );
          case "carb_high":
            return (
              (b.nutrition.carbPercent || 0) - (a.nutrition.carbPercent || 0)
            );
          case "fat_high":
            return (
              (b.nutrition.fatPercent || 0) - (a.nutrition.fatPercent || 0)
            );
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allItems, searchQuery, dietaryFilters, allergenFilters, sortOption]);

  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleAllergenFilter = (filter: string) => {
    setAllergenFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-medium">All Items</h2>
        <div className="w-full md:w-64">
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="font-medium mb-3">Filters</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-zinc-500 mb-2">
                Dietary Preferences
              </h4>
              <div className="flex flex-wrap gap-3">
                {getDietaryFilters().map((filter) => (
                  <div key={filter.id} className="flex items-center gap-1.5">
                    <Checkbox
                      id={filter.id}
                      checked={dietaryFilters.includes(filter.id)}
                      onCheckedChange={() => toggleDietaryFilter(filter.id)}
                    />
                    <Label
                      htmlFor={filter.id}
                      className="text-sm cursor-pointer"
                    >
                      {filter.label.charAt(0).toUpperCase() +
                        filter.label.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-zinc-500 mb-2">Allergen-Free</h4>
              <div className="flex flex-wrap gap-3">
                {getAllergenFilters().map((filter) => (
                  <div key={filter.id} className="flex items-center gap-1.5">
                    <Checkbox
                      id={filter.id}
                      checked={allergenFilters.includes(filter.id)}
                      onCheckedChange={() => toggleAllergenFilter(filter.id)}
                    />
                    <Label
                      htmlFor={filter.id}
                      className="text-sm cursor-pointer"
                    >
                      {filter.label.charAt(0).toUpperCase() +
                        filter.label.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-zinc-500 mb-2">Sort By</h4>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select sort option" />
                </SelectTrigger>
                <SelectContent>
                  {getSortOptions().map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label.charAt(0).toUpperCase() +
                        option.label.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const source = itemSourceMap.get(item.item);

            return (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div
                    className="p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/70 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    {source && (
                      <div className="flex justify-end mb-1">
                        <span className="text-xs text-zinc-500">
                          {source.hall}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <h4 className="font-medium mb-1">{item.item}</h4>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm font-medium">
                        {item.nutrition.Calories} calories
                      </div>
                      <div className="flex gap-1 text-xs">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded">
                          P: {item.nutrition.proteinPercent || 0}%
                        </span>
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                          C: {item.nutrition.carbPercent || 0}%
                        </span>
                        <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded">
                          F: {item.nutrition.fatPercent || 0}%
                        </span>
                      </div>
                    </div>

                    <DietaryBadges dietaryInfo={item.dietary_info} />

                    <div className="flex justify-between items-end mt-3">
                      <div className="text-xs text-zinc-500">
                        P: {item.nutrition.Protein}g • C:{" "}
                        {item.nutrition["Total Carbohydrate"]}g • F:{" "}
                        {item.nutrition["Total Fat"]}g
                      </div>
                      <div className="h-16 w-16">
                        <MacroPieChart
                          protein={item.nutrition.proteinPercent || 0}
                          carbs={item.nutrition.carbPercent || 0}
                          fat={item.nutrition.fatPercent || 0}
                        />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{item.item}</DialogTitle>
                  </DialogHeader>

                  <div className="mt-4">
                    {source && (
                      <div className="text-sm text-zinc-500 mb-2">
                        From {source.hall} • {source.category}
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
                        <div>
                          Serving Size: {item.nutrition["Serving Size"]}
                        </div>
                        <div>Calories: {item.nutrition.Calories}</div>
                        <div>Protein: {item.nutrition.Protein}g</div>
                        <div>
                          Carbs: {item.nutrition["Total Carbohydrate"]}g
                        </div>
                        <div>Fat: {item.nutrition["Total Fat"]}g</div>
                        <div>Fiber: {item.nutrition.Fiber}g</div>
                        <div>Sodium: {item.nutrition.Sodium}mg</div>
                      </div>
                    </div>

                    {!isDetailedLoading && item.nutrition.ingredients && (
                      <div className="mt-6 space-y-2">
                        <h4 className="font-medium">Ingredients</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {item.nutrition.ingredients}
                        </p>
                      </div>
                    )}

                    {isDetailedLoading && (
                      <div className="mt-6 italic text-sm text-zinc-500">
                        Loading detailed ingredients...
                      </div>
                    )}

                    {source && (
                      <div className="mt-6">
                        <AddToTrackingButton
                          item={item}
                          hall={source.hall}
                          category={source.category}
                        />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <p>No items match your criteria. Try adjusting your filters!</p>
          </div>
        )}
      </div>
    </div>
  );
}
