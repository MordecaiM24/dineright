import { MenuItem } from "@/types";

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
