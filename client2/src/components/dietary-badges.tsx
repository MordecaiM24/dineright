interface DietaryBadgesProps {
  dietaryInfo: string[];
}

export default function DietaryBadges({ dietaryInfo }: DietaryBadgesProps) {
  // Map dietary info to more user-friendly terms
  const getBadgeInfo = (info: string) => {
    const map: Record<string, { label: string; color: string }> = {
      vegetarian_trait: {
        label: "Veg",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      vegan_trait: {
        label: "Vegan",
        color:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      },
      halal_trait: {
        label: "Halal",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      wolf_approved_trait: {
        label: "Wolf",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
      gluten_allergen: {
        label: "Contains Gluten",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      dairy_allergen: {
        label: "Contains Dairy",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      egg_allergen: {
        label: "Contains Egg",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      soy_allergen: {
        label: "Contains Soy",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      nuts_allergen: {
        label: "Contains Nuts",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      sesame_allergen: {
        label: "Contains Sesame",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
      pork_allergen: {
        label: "Contains Pork",
        color:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      },
    };

    return (
      map[info] || {
        label: info,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      }
    );
  };

  // Filter and sort badges for display
  const displayBadges = dietaryInfo
    .filter((info) => info.includes("trait"))
    .map((info) => getBadgeInfo(info));

  // Show allergen info
  const allergens = dietaryInfo
    .filter((info) => info.includes("allergen"))
    .map((info) => getBadgeInfo(info));

  return (
    <div>
      <div className="flex flex-wrap gap-1 mt-1">
        {displayBadges.map((badge, index) => (
          <span
            key={index}
            className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {allergens.map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
