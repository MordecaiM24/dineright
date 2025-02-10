import menu_compact from "../scraper/dining/menu_compact.json" with {type: "json"}
import menu_full from "../scraper/dining/menu_full.json" with {type: "json"}


function addMacroPercentages(menu) {
  return menu.map(hall => ({
    ...hall,
    menu: hall.menu.map(category => ({
      ...category,
      items: category.items.map(item => {
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
            fatPercent: Math.round((fatCals / totalCals) * 100)
          }
        };
      })
    }))
  }));
}

const processed_menu_compact = addMacroPercentages(menu_compact);
const processed_menu_full = addMacroPercentages(menu_full);

console.log(processed_menu_compact);

export { processed_menu_compact as menu_compact, processed_menu_full as menu_full }