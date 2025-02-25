import { useState, useMemo } from "react";
import { MenuData, MenuItem } from "@/types";
import ItemCard from "@/components/item-card";
import {
  getAllergenFilters,
  getDietaryFilters,
  getSortOptions,
} from "@/utils/menu-utils";
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
              <ItemCard
                key={index}
                item={item}
                hallName={source?.hall}
                categoryName={source?.category}
                isDetailedLoading={isDetailedLoading}
                showSource={true}
              />
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
