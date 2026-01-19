import { MenuItem, MealPeriod } from "@/types";

export const calculateMacros = (item: MenuItem): MenuItem => {
  const protein = item.nutrition.Protein;
  const carbs = item.nutrition["Total Carbohydrate"];
  const fat = item.nutrition["Total Fat"];

  const proteinCals = protein * 4;
  const carbCals = carbs * 4;
  const fatCals = fat * 9;
  const totalCals = proteinCals + carbCals + fatCals;

  return {
    ...item,
    nutrition: {
      ...item.nutrition,
      proteinPercent: Math.round((proteinCals / totalCals) * 100) || 0,
      carbPercent: Math.round((carbCals / totalCals) * 100) || 0,
      fatPercent: Math.round((fatCals / totalCals) * 100) || 0,
    },
  };
};

export const getAllergenFilters = () => [
  { id: "gluten_allergen", label: "gluten-free" },
  { id: "dairy_allergen", label: "dairy-free" },
  { id: "egg_allergen", label: "egg-free" },
  { id: "soy_allergen", label: "soy-free" },
  { id: "nuts_allergen", label: "nut-free" },
  { id: "sesame_allergen", label: "sesame-free" },
  { id: "pork_allergen", label: "pork-free" },
  { id: "seafood_allergen", label: "seafood-free" },
];

export const getDietaryFilters = () => [
  { id: "vegetarian_trait", label: "vegetarian" },
  { id: "vegan_trait", label: "vegan" },
  { id: "halal_trait", label: "halal" },
  { id: "wolf_approved_trait", label: "wolf approved" },
];

export const getSortOptions = () => [
  { id: "calories_high", label: "calories (high to low)" },
  { id: "calories_low", label: "calories (low to high)" },
  { id: "protein_high", label: "protein % (high to low)" },
  { id: "carb_high", label: "carb % (high to low)" },
  { id: "fat_high", label: "fat % (high to low)" },
];

/**
 * Get the current meal period based on time of day
 * - Before 10:30am: Breakfast
 * - 10:30am - 1:30pm: Lunch
 * - 1:30pm - 4:30pm: Daily
 * - After 4:30pm: Dinner
 */
export const getCurrentMealPeriod = (): MealPeriod => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour + minute / 60;

  if (time < 10.5) return "Breakfast";
  if (time < 13.5) return "Lunch";
  if (time < 16.5) return "Daily";
  return "Dinner";
};

/**
 * Get all meal period filter options
 */
export const getMealPeriodFilters = () => [
  { id: "Breakfast", label: "Breakfast", timeRange: "until 10:30am" },
  { id: "Lunch", label: "Lunch", timeRange: "10:30am - 1:30pm" },
  { id: "Daily", label: "Daily", timeRange: "1:30pm - 4:30pm" },
  { id: "Dinner", label: "Dinner", timeRange: "after 4:30pm" },
];

/**
 * Filter items by meal period
 * Items with "Daily" in their meal_periods are always included
 */
export const filterItemsByMealPeriod = (
  items: MenuItem[],
  mealPeriod: MealPeriod | "all"
): MenuItem[] => {
  if (mealPeriod === "all") return items;

  return items.filter((item) => {
    const periods = item.meal_periods || [];
    return periods.includes(mealPeriod) || periods.includes("Daily");
  });
};
