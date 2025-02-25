export interface NutritionInfo {
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
  proteinPercent?: number;
  carbPercent?: number;
  fatPercent?: number;
}

export interface MenuItem {
  item: string;
  dietary_info: string[];
  nutrition: NutritionInfo;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface DiningHall {
  hall: string;
  menu: MenuCategory[];
}

export interface MenuData {
  halls: DiningHall[];
}

export interface TrackedItem extends MenuItem {
  id: string;
  timestamp: number;
  hall: string;
  category: string;
}

export interface DailyTracking {
  date: string;
  items: TrackedItem[];
}
