import { calculateMacros } from "@/utils/menu-utils";
import { DiningHall, MenuCategory, MenuData } from "@/types";
import ClientMainWrapper from "@/components/client-main-wrapper";

// Server component
export default async function Home() {
  // Server-side data fetching
  const menuData = await fetchMenuData();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <header className="px-4 py-3 bg-zinc-800 dark:bg-zinc-950 text-white">
        <h1 className="text-xl font-bold">Dining Menu</h1>
      </header>

      <div className="container mx-auto px-4 py-6">
        <ClientMainWrapper menuData={menuData} />
      </div>
    </div>
  );
}

// Server-side data fetching function
async function fetchMenuData(): Promise<MenuData> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch menu data: ${res.status}`);

    const data = await res.json();

    // Process data to calculate macro percentages
    const processedData = {
      halls: data.map((hall: DiningHall) => ({
        ...hall,
        menu: hall.menu.map((category: MenuCategory) => ({
          ...category,
          items: category.items.map(calculateMacros),
        })),
      })),
    };

    return processedData;
  } catch (error) {
    console.error("Failed to load menu:", error);
    // Return empty data structure to avoid breaking the UI
    return { halls: [] };
  }
}
