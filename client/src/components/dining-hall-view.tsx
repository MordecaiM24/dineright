import { useState } from "react";
import { MenuData, DiningHall, MenuItem } from "@/types";
import ItemCard from "@/components/item-card";
import { getAllergenFilters, getDietaryFilters } from "@/utils/menu-utils";
import { Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [, setSelectedCategory] = useState<string | null>(null);
  const [hallFilters, setHallFilters] = useState<
    Record<string, { dietary: string[]; allergen: string[] }>
  >({});

  const toggleDietaryFilter = (hallName: string, filter: string) => {
    setHallFilters((prev) => {
      const hallFilter = prev[hallName] || { dietary: [], allergen: [] };
      return {
        ...prev,
        [hallName]: {
          ...hallFilter,
          dietary: hallFilter.dietary.includes(filter)
            ? hallFilter.dietary.filter((f) => f !== filter)
            : [...hallFilter.dietary, filter],
        },
      };
    });
  };

  const toggleAllergenFilter = (hallName: string, filter: string) => {
    setHallFilters((prev) => {
      const hallFilter = prev[hallName] || { dietary: [], allergen: [] };
      return {
        ...prev,
        [hallName]: {
          ...hallFilter,
          allergen: hallFilter.allergen.includes(filter)
            ? hallFilter.allergen.filter((f) => f !== filter)
            : [...hallFilter.allergen, filter],
        },
      };
    });
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
  const getFilteredItems = (hallName: string, items: MenuItem[]) => {
    const filters = hallFilters[hallName] || { dietary: [], allergen: [] };

    return items.filter((item) => {
      // Apply dietary filters
      if (
        filters.dietary.length > 0 &&
        !filters.dietary.every((filter) => item.dietary_info.includes(filter))
      ) {
        return false;
      }

      // Apply allergen filters
      if (
        filters.allergen.length > 0 &&
        filters.allergen.some((filter) => item.dietary_info.includes(filter))
      ) {
        return false;
      }

      return true;
    });
  };

  // Get all items from all categories in a hall
  const getAllItems = (hall: DiningHall) => {
    return hall.menu.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryName: category.category,
      }))
    );
  };

  return (
    <div className="space-y-8 pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-medium">Dining Halls</h2>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {menuData.halls.map((hall, hallIndex) => {
          const featuredItems = getFeaturedItems(hall);
          const hallName = hall.hall;
          const currentFilters = hallFilters[hallName] || {
            dietary: [],
            allergen: [],
          };

          return (
            <div
              key={hallIndex}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between"
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
                      <ItemCard
                        key={itemIndex}
                        item={item}
                        hallName={hall.hall}
                        categoryName={featuredItems.category}
                        isDetailedLoading={isDetailedLoading}
                      />
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
                    <Button variant="outline" className="w-full">
                      View All Categories
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto flex flex-col">
                    <DialogHeader>
                      <DialogTitle>{hall.hall}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                      {/* Filters Panel */}
                      <div className="md:w-64 space-y-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                          </h4>

                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm text-zinc-500 mb-2">
                                Dietary Preferences
                              </h5>
                              <div className="space-y-2">
                                {getDietaryFilters().map((filter) => (
                                  <div
                                    key={filter.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={`${hallName}-${filter.id}`}
                                      checked={currentFilters.dietary.includes(
                                        filter.id
                                      )}
                                      onCheckedChange={() =>
                                        toggleDietaryFilter(hallName, filter.id)
                                      }
                                    />
                                    <Label htmlFor={`${hallName}-${filter.id}`}>
                                      {filter.label.charAt(0).toUpperCase() +
                                        filter.label.slice(1)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm text-zinc-500 mb-2">
                                Allergen-Free
                              </h5>
                              <div className="space-y-2">
                                {getAllergenFilters().map((filter) => (
                                  <div
                                    key={filter.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={`${hallName}-${filter.id}`}
                                      checked={currentFilters.allergen.includes(
                                        filter.id
                                      )}
                                      onCheckedChange={() =>
                                        toggleAllergenFilter(
                                          hallName,
                                          filter.id
                                        )
                                      }
                                    />
                                    <Label htmlFor={`${hallName}-${filter.id}`}>
                                      {filter.label.charAt(0).toUpperCase() +
                                        filter.label.slice(1)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Content */}
                      <div className="flex-1">
                        <Tabs defaultValue="all">
                          <TabsList className="flex flex-wrap justify-start mb-4 h-fit">
                            <TabsTrigger
                              value="all"
                              onClick={() => setSelectedCategory("all")}
                              className="leading-6 font-medium"
                            >
                              All Categories
                            </TabsTrigger>
                            {hall.menu.map((category, categoryIndex) => (
                              <TabsTrigger
                                key={categoryIndex}
                                value={category.category}
                                onClick={() =>
                                  setSelectedCategory(category.category)
                                }
                                className="leading-6"
                              >
                                {category.category}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {/* All Categories Tab Content */}
                          <TabsContent value="all" className="mt-0">
                            {(() => {
                              const allItems = getAllItems(hall);
                              const filteredItems = getFilteredItems(
                                hallName,
                                allItems
                              );

                              return filteredItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {filteredItems.map((item, itemIndex) => (
                                    <ItemCard
                                      key={itemIndex}
                                      item={item}
                                      hallName={hall.hall}
                                      categoryName={item.categoryName || ""}
                                      isDetailedLoading={isDetailedLoading}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="py-8 text-center">
                                  <p className="text-zinc-500">
                                    No items match your filter criteria
                                  </p>
                                </div>
                              );
                            })()}
                          </TabsContent>

                          {hall.menu.map((category, categoryIndex) => {
                            const filteredItems = getFilteredItems(
                              hallName,
                              category.items
                            );

                            return (
                              <TabsContent
                                key={categoryIndex}
                                value={category.category}
                                className="mt-0"
                              >
                                {filteredItems.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredItems.map((item, itemIndex) => (
                                      <ItemCard
                                        key={itemIndex}
                                        item={item}
                                        hallName={hall.hall}
                                        categoryName={category.category}
                                        isDetailedLoading={isDetailedLoading}
                                      />
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
                      </div>
                    </div>
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
