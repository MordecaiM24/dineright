"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Menu, Search } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { RangeSlider } from "@/components/ui/range-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import toFormalCase from "@/utils/formal";

const transformDietaryInfo = (info) => {
  return info.map((tag) => tag.replace("_allergen", "").replace("_trait", ""));
};

const ItemCard = ({ item }) => {
  const [modalOpen, setModalOpen] = useState(false);
  console.log(item);

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow relative min-h-64">
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-medium  flex items-center justify-between">
            <p>{item.item}</p>
            <p className="text-base text-gray-600">{item.hall}</p>
          </CardTitle>
          <div className="flex flex-wrap gap-1 mt-2 min-h-8">
            {transformDietaryInfo(item.dietary_info).map((tag, idx) => (
              <Badge
                key={idx}
                variant={tag.includes("free") ? "destructive" : "secondary"}
              >
                {toFormalCase(tag)}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>Calories: {item.nutrition.Calories}</div>
            <div>Protein: {item.nutrition.Protein}g</div>
            <div>Carbs: {item.nutrition["Total Carbohydrate"]}g</div>
            <div>Fat: {item.nutrition["Total Fat"]}g</div>
            <div>Fiber: {item.nutrition.Fiber}g</div>
            <div>Sodium: {item.nutrition.Sodium}mg</div>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-11/12 bottom-4 absolute border border-black "
              >
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{item.item}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Macro Distribution
                  </h4>
                  {modalOpen && <MacroChart nutrition={item.nutrition} />}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Nutrition Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Serving Size: {item.nutrition["Serving Size"]}</div>
                    <div>Calories: {item.nutrition.Calories}</div>
                    <div>Total Fat: {item.nutrition["Total Fat"]}g</div>
                    <div>Saturated Fat: {item.nutrition["Saturated Fat"]}g</div>
                    <div>Trans Fat: {item.nutrition["Trans Fat"]}g</div>
                    <div>
                      Total Carbs: {item.nutrition["Total Carbohydrate"]}g
                    </div>
                    <div>Fiber: {item.nutrition.Fiber}g</div>
                    <div>Protein: {item.nutrition.Protein}g</div>
                    <div>Sodium: {item.nutrition.Sodium}mg</div>
                  </div>
                </div>
                {item.nutrition.ingredients && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Ingredients</h4>
                    <div className="max-h-48 overflow-y-auto rounded border p-2 text-sm">
                      {item.nutrition.ingredients}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  );
};

const ItemsView = ({ data, className = "" }) => {
  const [filters, setFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [calorieRange, setCalorieRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("none");

  const allItems = data.flatMap((hall) =>
    hall.menu.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        hall: hall.hall,
        category: category.category,
      }))
    )
  );

  // Get max calories for slider
  const maxCalories = Math.max(
    ...allItems.map((item) => item.nutrition.Calories)
  );

  // Separate allergens and traits
  const allergenFilters = [
    "gluten-free",
    "dairy-free",
    "egg-free",
    "soy-free",
    "nuts-free",
    "sesame-free",
    "pork-free",
  ];
  const traitFilters = ["vegetarian", "vegan", "halal", "wolf approved"];

  const filteredItems = allItems.filter((item) => {
    // Search filter
    const matchesSearch =
      search.toLowerCase() === "" ||
      item.item.toLowerCase().includes(search.toLowerCase());

    // Dietary filters
    const matchesFilters = filters.every((filter) => {
      // Handle allergen filters (x-free)
      if (filter.endsWith("-free")) {
        const allergen = filter.replace("-free", "_allergen");
        return !item.dietary_info.includes(allergen);
      }
      // Handle trait filters
      return filter === "wolf approved"
        ? item.dietary_info.includes("wolf_approved_trait")
        : item.dietary_info.includes(filter + "_trait");
    });

    // Calorie range filter
    const matchesCalories =
      item.nutrition.Calories >= calorieRange[0] &&
      item.nutrition.Calories <= calorieRange[1];

    return matchesSearch && matchesFilters && matchesCalories;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "calories-asc":
        return a.nutrition.Calories - b.nutrition.Calories;
      case "calories-desc":
        return b.nutrition.Calories - a.nutrition.Calories;
      case "protein-asc":
        return a.nutrition.Protein - b.nutrition.Protein;
      case "protein-desc":
        return b.nutrition.Protein - a.nutrition.Protein;
      case "protein-percentage-desc":
        return b.nutrition.proteinPercent - a.nutrition.proteinPercent;
      default:
        return 0;
    }
  });

  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sort by: None</SelectItem>
                <SelectItem value="calories-asc">
                  Calories (Low to High)
                </SelectItem>
                <SelectItem value="calories-desc">
                  Calories (High to Low)
                </SelectItem>
                <SelectItem value="protein-asc">
                  Protein (Low to High)
                </SelectItem>
                <SelectItem value="protein-desc">
                  Protein (High to Low)
                </SelectItem>
                <SelectItem value="protein-percentage-desc">
                  Protein Percentage (High to Low)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 px-4">
            <p className="text-sm text-muted-foreground mb-2">
              Calories: {calorieRange[0]} - {calorieRange[1]}
            </p>
            <RangeSlider
              min={0}
              max={maxCalories}
              step={50}
              value={calorieRange}
              onValueChange={setCalorieRange}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Allergen Filters:</p>
          <div className="flex flex-wrap gap-2">
            {allergenFilters.map((filter) => (
              <Toggle
                key={filter}
                pressed={filters.includes(filter)}
                onPressedChange={(pressed) => {
                  setFilters((prev) =>
                    pressed
                      ? [...prev, filter]
                      : prev.filter((f) => f !== filter)
                  );
                }}
              >
                {toFormalCase(filter)}
              </Toggle>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Dietary Traits:</p>
          <div className="flex flex-wrap gap-2">
            {traitFilters.map((filter) => (
              <Toggle
                key={filter}
                pressed={filters.includes(filter)}
                onPressedChange={(pressed) => {
                  setFilters((prev) =>
                    pressed
                      ? [...prev, filter]
                      : prev.filter((f) => f !== filter)
                  );
                }}
              >
                {toFormalCase(filter)}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((item, idx) => (
          <ItemCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

const DiningHallCard = ({ hall }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const topItems = hall.menu[0].items.slice(0, 3);

  return (
    <>
      <Card className="w-full mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{hall.hall}</CardTitle>
          <div className="flex gap-2">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">View All</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{hall.hall} - All Items</DialogTitle>
                </DialogHeader>
                <ItemsView data={[hall]} className="pt-4" />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Show Less" : "Show More"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(expanded ? hall.menu[0].items : topItems).map((item, idx) => (
              <div key={idx} className="border-b last:border-0 pb-2">
                <div className="font-medium">{item.item}</div>
                <div className="text-sm text-muted-foreground">
                  {item.nutrition.Calories} cal | {item.nutrition.Protein}g
                  protein
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const DiningHallsView = ({ data }) => (
  <div className="p-4 max-w-4xl mx-auto">
    {data.map((hall, idx) => (
      <DiningHallCard key={idx} hall={hall} />
    ))}
  </div>
);

// Main Dashboard Component
const MenuDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("items");

  console.log(process.env.NEXT_PUBLIC_API_URL);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="space-y-2 mt-8">
            <Button
              variant={activeView === "items" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("items")}
            >
              Items
            </Button>
            <Button
              variant={activeView === "halls" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView("halls")}
            >
              Dining Halls
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1 ml-16">
        {activeView === "items" ? (
          <ItemsView data={data} />
        ) : (
          <DiningHallsView data={data} />
        )}
      </main>
    </div>
  );
};

export default MenuDashboard;

const MacroChart = React.memo(({ nutrition }) => {
  const macroData = useMemo(() => {
    const proteinCals = nutrition.Protein * 4;
    const carbCals = nutrition["Total Carbohydrate"] * 4;
    const fatCals = nutrition["Total Fat"] * 9;
    const totalCals = nutrition.Calories;

    return [
      {
        name: "Protein",
        value: (proteinCals / totalCals) * 100,
        color: "#22c55e",
      },
      {
        name: "Carbs",
        value: (carbCals / totalCals) * 100,
        color: "#3b82f6",
      },
      {
        name: "Fat",
        value: (fatCals / totalCals) * 100,
        color: "#ef4444",
      },
    ];
  }, [nutrition]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart style={{ outline: "none" }}>
          <Pie
            data={macroData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            style={{ outline: "none" }}
            label={({ value }) => `${Math.round(value)}%`}
          >
            {macroData.map((entry, index) => (
              <Cell
                style={{ outline: "none" }}
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Math.round(value)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// const MenuDashboard = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeView, setActiveView] = useState("items");

//   useEffect(() => {
//     fetch(`${process.env.API_URL}/menu`)
//       .then((res) => res.json())
//       .then((data) => {
//         setData(data);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div className="p-4">Loading...</div>;

//   return (
//     <div className="flex min-h-screen bg-[#c00] text-white">
//       {JSON.stringify(data)}
//     </div>
//   );
// };

// export default MenuDashboard;
