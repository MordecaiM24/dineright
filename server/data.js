import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadMenus() {
  const menu_compact = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../scraper/menu_compact.json"))
  );
  const menu_full = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../scraper/menu_full.json"))
  );
  return { menu_compact, menu_full };
}

function addMacroPercentages(menu) {
  return menu.map((hall) => ({
    ...hall,
    menu: hall.menu.map((category) => ({
      ...category,
      items: category.items.map((item) => {
        if (!item.nutrition) return item;

        const nutrition = item.nutrition;
        const proteinCals = nutrition.Protein * 4;
        const carbCals = nutrition["Total Carbohydrate"] * 4;
        const fatCals = nutrition["Total Fat"] * 9;
        const totalCals = nutrition.Calories;

        return {
          ...item,
          nutrition: {
            ...nutrition,
            proteinPercent: Math.round((proteinCals / totalCals) * 100),
            carbPercent: Math.round((carbCals / totalCals) * 100),
            fatPercent: Math.round((fatCals / totalCals) * 100),
          },
        };
      }),
    })),
  }));
}

let processed_menu_compact;
let processed_menu_full;

function processMenus() {
  const { menu_compact, menu_full } = loadMenus();
  processed_menu_compact = addMacroPercentages(menu_compact);
  processed_menu_full = addMacroPercentages(menu_full);
}

processMenus();

// watch for changes
fs.watch(path.join(__dirname, "../scraper"), (eventType, filename) => {
  if (filename === "menu_compact.json" || filename === "menu_full.json") {
    console.log(`reloading menus due to change in ${filename}`);
    processMenus();
  }
});

export {
  processed_menu_compact as menu_compact,
  processed_menu_full as menu_full,
};
