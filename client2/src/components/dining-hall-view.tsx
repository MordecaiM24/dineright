import { useState } from "react";
import { MenuData, DiningHall, MenuCategory, MenuItem } from "@/types";
import MacroPieChart from "@/components/macro-pie-chart";
import DietaryBadges from "./dietary-badges";
import { getAllergenFilters, getDietaryFilters } from "@/utils/menu-utils";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiningHallViewProps {
  menuData: MenuData;
  isDetailedLoading: boolean;
}

export default function DiningHallView({
  menuData,
  isDetailedLoading,
}: DiningHallViewProps) {
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergenFilters, setAllergenFilters] = useState<string[]>([]);

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

  // Get featured items (Home Style Entree if available, otherwise first category)
  const getFeaturedItems = (hall: DiningHall) => {
    const homeStyleCategory = hall.menu.find((category) =>
      category.category.toLowerCase().includes("entree")
    );
    if (homeStyleCategory) {
      return {
        category: homeStyleCategory.category,
        items: homeStyleCategory.items
          .sort(
            (a: MenuItem, b: MenuItem) =>
              b.nutrition.Calories - a.nutrition.Calories
          )
          .slice(0, 3),
      };
    }
    // Default to first category with items
    const firstCategory = hall.menu.find(
      (category) => category.items.length > 0
    );
    if (firstCategory) {
      return {
        category: firstCategory.category,
        items: firstCategory.items.slice(0, 3),
      };
    }
    return { category: "", items: [] };
  };

  // Filter items based on dietary and allergen filters
  const getFilteredItems = (items: MenuItem[]) => {
    return items.filter((item) => {
      // Apply dietary filters
      if (
        dietaryFilters.length > 0 &&
        !dietaryFilters.every((filter) => item.dietary_info.includes(filter))
      ) {
        return false;
      }

      // Apply allergen filters
      if (
        allergenFilters.length > 0 &&
        allergenFilters.some((filter) => item.dietary_info.includes(filter))
      ) {
        return false;
      }

      return true;
    });
  };

  return (
    <div className="space-y-8 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-medium">Dining Halls</h2>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Menu className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="mb-4">
              <SheetTitle>Dietary Filters</SheetTitle>
            </SheetHeader>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-zinc-500 mb-2">
                  Dietary Preferences
                </h4>
                <div className="space-y-2">
                  {getDietaryFilters().map((filter) => (
                    <div key={filter.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`sheet-${filter.id}`}
                        checked={dietaryFilters.includes(filter.id)}
                        onCheckedChange={() => toggleDietaryFilter(filter.id)}
                      />
                      <Label htmlFor={`sheet-${filter.id}`}>
                        {filter.label.charAt(0).toUpperCase() +
                          filter.label.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-zinc-500 mb-2">Allergen-Free</h4>
                <div className="space-y-2">
                  {getAllergenFilters().map((filter) => (
                    <div key={filter.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`sheet-${filter.id}`}
                        checked={allergenFilters.includes(filter.id)}
                        onCheckedChange={() => toggleAllergenFilter(filter.id)}
                      />
                      <Label htmlFor={`sheet-${filter.id}`}>
                        {filter.label.charAt(0).toUpperCase() +
                          filter.label.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {menuData.halls.map((hall, hallIndex) => {
          const featuredItems = getFeaturedItems(hall);

          return (
            <div
              key={hallIndex}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-medium">{hall.hall}</h3>
                {featuredItems.category && (
                  <p className="text-sm text-zinc-500 mt-1">
                    Featured: {featuredItems.category}
                  </p>
                )}
              </div>

              <div className="p-4">
                {featuredItems.items.length > 0 ? (
                  <div className="space-y-3">
                    {featuredItems.items.slice(0, 2).map((item, itemIndex) => (
                      <Dialog key={itemIndex}>
                        <DialogTrigger asChild>
                          <div
                            className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-700/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium mb-1">{item.item}</h4>
                              <span className="text-sm font-mono">
                                {item.nutrition.Calories} cal
                              </span>
                            </div>

                            <DietaryBadges dietaryInfo={item.dietary_info} />

                            <div className="flex justify-between items-end mt-2">
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
                            </div>
                          </div>
                        </DialogTrigger>

                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{item.item}</DialogTitle>
                          </DialogHeader>

                          <div className="mt-4">
                            <div className="text-sm text-zinc-500 mb-2">
                              From {hall.hall} • {featuredItems.category}
                            </div>

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

                            {!isDetailedLoading &&
                              item.nutrition.ingredients && (
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
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm py-2">
                    No featured items available
                  </p>
                )}
              </div>

              <div className="p-4 pt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedHall(hall.hall)}
                    >
                      View All Categories
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{hall.hall}</DialogTitle>
                    </DialogHeader>

                    <Tabs
                      defaultValue={hall.menu[0]?.category || ""}
                      className="mt-4"
                    >
                      <TabsList className="flex flex-wrap justify-start mb-4">
                        {hall.menu.map((category, categoryIndex) => (
                          <TabsTrigger
                            key={categoryIndex}
                            value={category.category}
                            onClick={() =>
                              setSelectedCategory(category.category)
                            }
                          >
                            {category.category}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {hall.menu.map((category, categoryIndex) => {
                        const filteredItems = getFilteredItems(category.items);

                        return (
                          <TabsContent
                            key={categoryIndex}
                            value={category.category}
                            className="mt-0"
                          >
                            {filteredItems.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredItems.map((item, itemIndex) => (
                                  <Dialog key={itemIndex}>
                                    <DialogTrigger asChild>
                                      <div
                                        className="p-4 rounded-md bg-zinc-50 dark:bg-zinc-700/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                        onClick={() => setSelectedItem(item)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <h4 className="font-medium mb-1">
                                            {item.item}
                                          </h4>
                                          <span className="text-sm font-mono">
                                            {item.nutrition.Calories} cal
                                          </span>
                                        </div>

                                        <DietaryBadges
                                          dietaryInfo={item.dietary_info}
                                        />

                                        <div className="flex justify-between items-end mt-3">
                                          <div className="flex gap-2 text-xs">
                                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded">
                                              P: {item.nutrition.Protein}g
                                            </span>
                                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                                              C:{" "}
                                              {
                                                item.nutrition[
                                                  "Total Carbohydrate"
                                                ]
                                              }
                                              g
                                            </span>
                                            <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded">
                                              F: {item.nutrition["Total Fat"]}g
                                            </span>
                                          </div>
                                          <div className="h-16 w-16">
                                            <MacroPieChart
                                              protein={
                                                item.nutrition.proteinPercent ||
                                                0
                                              }
                                              carbs={
                                                item.nutrition.carbPercent || 0
                                              }
                                              fat={
                                                item.nutrition.fatPercent || 0
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>{item.item}</DialogTitle>
                                      </DialogHeader>

                                      <div className="mt-4">
                                        <div className="text-sm text-zinc-500 mb-2">
                                          From {hall.hall} • {category.category}
                                        </div>

                                        <DietaryBadges
                                          dietaryInfo={item.dietary_info}
                                        />

                                        <div className="mt-4 h-40">
                                          <MacroPieChart
                                            protein={
                                              item.nutrition.proteinPercent || 0
                                            }
                                            carbs={
                                              item.nutrition.carbPercent || 0
                                            }
                                            fat={item.nutrition.fatPercent || 0}
                                            showLabels
                                          />
                                        </div>

                                        <div className="mt-6 space-y-2">
                                          <h4 className="font-medium">
                                            Nutrition Info
                                          </h4>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              Serving Size:{" "}
                                              {item.nutrition["Serving Size"]}
                                            </div>
                                            <div>
                                              Calories:{" "}
                                              {item.nutrition.Calories}
                                            </div>
                                            <div>
                                              Protein: {item.nutrition.Protein}g
                                            </div>
                                            <div>
                                              Carbs:{" "}
                                              {
                                                item.nutrition[
                                                  "Total Carbohydrate"
                                                ]
                                              }
                                              g
                                            </div>
                                            <div>
                                              Fat: {item.nutrition["Total Fat"]}
                                              g
                                            </div>
                                            <div>
                                              Fiber: {item.nutrition.Fiber}g
                                            </div>
                                            <div>
                                              Sodium: {item.nutrition.Sodium}mg
                                            </div>
                                          </div>
                                        </div>

                                        {!isDetailedLoading &&
                                          item.nutrition.ingredients && (
                                            <div className="mt-6 space-y-2">
                                              <h4 className="font-medium">
                                                Ingredients
                                              </h4>
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
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center">
                                <p className="text-zinc-500">
                                  No items match your filter criteria
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
