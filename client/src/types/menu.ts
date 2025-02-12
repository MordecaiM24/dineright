export interface Nutrition {
  "Serving Size": string;
  Calories: number;
  Protein: number;
  "Total Carbohydrate": number;
  "Total Fat": number;
  "Saturated Fat": number;
  "Trans Fat": number;
  Fiber: number;
  Sodium: number;
  ingredients?: string;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
}

interface MenuItem {
  item: string;
  dietary_info: string[];
  nutrition: Nutrition;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface DiningHall {
  hall: string;
  menu: MenuCategory[];
}

export type MenuResponse = DiningHall[];
