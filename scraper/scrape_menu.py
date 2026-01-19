#!/usr/bin/env python3
"""
CBORD NetNutrition scraper for NC State Dining
Scrapes menu data from https://netmenu2.cbord.com/NetNutrition/ncstate-dining
Only scrapes dining halls that are currently open according to dining.ncsu.edu
"""

import requests
import re
import json
import time
from copy import deepcopy
from collections import defaultdict

BASE_URL = "https://netmenu2.cbord.com/NetNutrition/ncstate-dining"
DINING_NCSU_URL = "https://dining.ncsu.edu/locations/"

# Map dietary icon titles to internal names
DIETARY_MAP = {
    "Halal (U)": "halal_trait",
    "Vegan": "vegan_trait",
    "Vegetarian": "vegetarian_trait",
    "Wolf Approved": "wolf_approved_trait",
    "Contains Gluten": "gluten_allergen",
    "Contains Dairy": "dairy_allergen",
    "Contains Eggs": "egg_allergen",
    "Contains Fish": "fish_allergen",
    "Contains Peanuts": "peanut_allergen",
    "Contains Shellfish": "shellfish_allergen",
    "Contains Soy": "soy_allergen",
    "Contains Tree Nuts": "treenut_allergen",
    "Contains Pork": "pork_allergen",
    "Contains Sesame": "sesame_allergen",
}

# Map dining.ncsu.edu names to CBORD names
HALL_NAME_MAP = {
    "fountain": "Fountain Dining Hall",
    "clark": "Clark Dining Hall",
    "case": "Case Dining Hall",
    "university towers": "University Towers Dining Hall",
    "one earth": "One Earth Dining Hall",
}


class DiningMenuScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
        })

    def _post(self, endpoint, data=None):
        """Make a POST request to the API"""
        url = f"{BASE_URL}/{endpoint}"
        resp = self.session.post(url, data=data)
        return resp

    def get_open_dining_halls(self):
        """Get list of currently open dining halls from dining.ncsu.edu"""
        try:
            resp = requests.get(DINING_NCSU_URL, timeout=10)
            html = resp.text

            # Find open dining halls in the "Dining Hall" section
            # Pattern: location-tile--open...><strong>Name</strong>...range">Hours
            pattern = r'location-tile--open"[^>]*>[^<]*<[^>]*>[^<]*<[^>]*style="[^"]*"[^>]*>[^<]*</div><div[^>]*><h4><strong>([^<]+)</strong>'
            matches = re.findall(pattern, html)

            open_halls = []
            for name in matches:
                name_lower = name.lower().strip()
                # Map to CBORD name if it's a main dining hall
                for key, cbord_name in HALL_NAME_MAP.items():
                    if key in name_lower:
                        open_halls.append({
                            "ncsu_name": name.strip(),
                            "cbord_name": cbord_name
                        })
                        break

            return open_halls
        except Exception as e:
            print(f"Error fetching open halls: {e}")
            return []

    def init_session(self):
        """Initialize session by loading the main page"""
        resp = self.session.get(BASE_URL)
        return resp.status_code == 200

    def get_units(self):
        """Get all dining units (halls) from the main page"""
        resp = self.session.get(BASE_URL)
        html = resp.text

        # Parse units from SelectUnit onclick handlers
        pattern = r"SelectUnit\((\d+)\);\">([^<]+)</a>"
        matches = re.findall(pattern, html)

        units = []
        for unit_id, name in matches:
            units.append({
                "id": int(unit_id),
                "name": name.strip()
            })

        return units

    def select_unit(self, unit_id):
        """Select a dining unit and get its menus"""
        resp = self._post("Unit/SelectUnitFromUnitsList", {"unitOid": unit_id})

        try:
            data = resp.json()
            if data.get("success"):
                return data
        except:
            pass
        return None

    def get_today_menus(self, unit_response):
        """Extract today's menu IDs with their meal names from unit response"""
        if not unit_response:
            return []

        menus = []
        for panel in unit_response.get("panels", []):
            if panel.get("id") == "menuPanel":
                html = panel.get("html", "")
                html = html.encode().decode('unicode_escape')

                # Find today's menus (first card should be today)
                # Pattern: menuListSelectMenu(ID);">MealName</a>
                menu_pattern = r"menuListSelectMenu\((\d+)\)[^>]*>([^<]+)</a>"
                all_matches = re.findall(menu_pattern, html)

                if all_matches:
                    # Find the first date header and get menus until the next date
                    date_pattern = r"card-title[^>]*>([^<]+)</header>"
                    date_matches = re.findall(date_pattern, html)

                    if date_matches:
                        first_date_idx = html.find(date_matches[0])
                        if len(date_matches) > 1:
                            second_date_idx = html.find(date_matches[1])
                            first_section = html[first_date_idx:second_date_idx]
                        else:
                            first_section = html[first_date_idx:]

                        # Get menus from first section only (today)
                        today_matches = re.findall(menu_pattern, first_section)
                        for menu_id, meal_name in today_matches:
                            menus.append({
                                "id": int(menu_id),
                                "meal": meal_name.strip()
                            })
                    else:
                        # Fallback: take first 4 menus
                        for menu_id, meal_name in all_matches[:4]:
                            menus.append({
                                "id": int(menu_id),
                                "meal": meal_name.strip()
                            })

        return menus

    def select_menu(self, menu_id):
        """Select a menu and get its items"""
        resp = self._post("Menu/SelectMenu", {"menuOid": menu_id})

        try:
            data = resp.json()
            if data.get("success"):
                return data
        except:
            pass
        return None

    def parse_menu_items(self, menu_response):
        """Parse menu items from the response"""
        if not menu_response:
            return {}

        items_by_category = defaultdict(list)

        for panel in menu_response.get("panels", []):
            if panel.get("id") == "itemPanel":
                html = panel.get("html", "")
                html = html.encode().decode('unicode_escape')

                # Find all categories
                category_pattern = r"toggleCourseItems\(this,\s*(\d+)\)[^>]*>\s*<td[^>]*><div[^>]*>([^<]+)"
                categories = re.findall(category_pattern, html)

                category_map = {}
                for cat_id, cat_name in categories:
                    category_map[cat_id] = cat_name.strip()

                # Use a more reliable approach - split by rows
                rows = re.split(r"<tr[^>]*data-categoryid='(\d+)'", html)

                current_category = None
                for i, row in enumerate(rows):
                    if i % 2 == 1:  # This is a category ID
                        current_category = row
                    elif current_category and i > 0:
                        # Parse item from this row
                        detail_match = re.search(r"getItemNutritionLabelOnClick\(event,(\d+)\)", row)
                        name_match = re.search(r"class='cbo_nn_itemHover'>([^<]+)", row)

                        if detail_match and name_match:
                            detail_id = detail_match.group(1)
                            item_name = name_match.group(1).strip()

                            # Extract dietary info from img titles
                            dietary_matches = re.findall(r"<img[^>]*title='([^']+)'", row)
                            dietary_info = []
                            for diet in dietary_matches:
                                if diet in DIETARY_MAP:
                                    dietary_info.append(DIETARY_MAP[diet])

                            category_name = category_map.get(current_category, "Other")

                            items_by_category[category_name].append({
                                "detail_id": detail_id,
                                "item": item_name,
                                "dietary_info": dietary_info,
                            })

        return dict(items_by_category)

    def get_nutrition(self, detail_id):
        """Get nutrition info for an item"""
        resp = self._post("NutritionDetail/ShowItemNutritionLabel", {"detailOid": detail_id})
        html = resp.text

        nutrition = {}

        # Parse serving size
        serving_match = re.search(r"Serving Size:&nbsp;([^<]+)</td>", html)
        if serving_match:
            # Clean up HTML entities
            serving = serving_match.group(1).strip()
            serving = serving.replace("&nbsp;", " ").replace("&amp;", "&")
            nutrition["Serving Size"] = serving

        # Parse calories
        calories_match = re.search(r"<span style='font-weight: bold;'>Calories</span>&nbsp;&nbsp;<span[^>]*>(\d+)", html)
        if calories_match:
            nutrition["Calories"] = float(calories_match.group(1))

        # Parse nutrients using pattern: nutrient name followed by value
        nutrient_patterns = [
            (r"Total Fat</span></td><td><span[^>]*>&nbsp;([0-9.]+)g", "Total Fat"),
            (r"Saturated Fat</span></td><td><span[^>]*>&nbsp;([0-9.]+)g", "Saturated Fat"),
            (r"Trans Fat</span></td><td><span[^>]*>&nbsp;([0-9.]+)g", "Trans Fat"),
            (r"Cholesterol</span></td><td><span[^>]*>&nbsp;([0-9.]+)mg", "Cholesterol"),
            (r"Sodium</span></td><td><span[^>]*>&nbsp;([0-9.]+)mg", "Sodium"),
            (r"Total Carbohydrate</span></td><td><span[^>]*>&nbsp;([0-9.]+)g", "Total Carbohydrate"),
            (r"Dietary Fiber</span></td><td><span[^>]*>&nbsp;([0-9.]+)g", "Fiber"),
            (r"Sugars</span></td><td><span[^>]*>&nbsp;([0-9.]+)g", "Sugars"),
            (r"Protein</span></td><td><span[^>]*>&nbsp;([0-9.&lt;<]+)g", "Protein"),
        ]

        for pattern, name in nutrient_patterns:
            match = re.search(pattern, html)
            if match:
                value = match.group(1)
                # Handle "< 1g" or "&lt; 1g" as 0.5
                if "<" in value or "&lt;" in value:
                    value = "0.5"
                try:
                    nutrition[name] = float(value)
                except ValueError:
                    nutrition[name] = 0.0

        # Parse ingredients
        ingredients_match = re.search(r"Ingredients:</span><span[^>]*>([^<]+)", html)
        if ingredients_match:
            ingredients = ingredients_match.group(1).strip()
            # Clean up HTML entities
            ingredients = ingredients.replace("&nbsp;", " ").replace("&amp;", "&")
            nutrition["ingredients"] = ingredients

        return nutrition

    def scrape_all(self, halls_filter=None, only_open=True):
        """Scrape all menus from dining halls

        Args:
            halls_filter: List of hall names to filter (partial match)
            only_open: If True, only scrape halls that are currently open
        """
        print("Initializing session...")
        if not self.init_session():
            print("Failed to initialize session")
            return []

        # Get open halls if requested
        open_hall_names = None
        if only_open:
            print("Checking which dining halls are open...")
            open_halls = self.get_open_dining_halls()
            if open_halls:
                open_hall_names = [h["cbord_name"] for h in open_halls]
                print(f"Open dining halls: {', '.join(open_hall_names)}")
            else:
                print("Could not determine open halls, falling back to filter list")

        print("Getting dining units from CBORD...")
        units = self.get_units()
        print(f"Found {len(units)} dining units")

        # Filter units
        if open_hall_names:
            # Use open halls list
            units = [u for u in units if u["name"] in open_hall_names]
            print(f"Filtering to {len(units)} open dining halls")
        elif halls_filter:
            # Use provided filter
            units = [u for u in units if any(h.lower() in u["name"].lower() for h in halls_filter)]
            print(f"Filtered to {len(units)} dining halls")

        all_data = []

        for unit in units:
            print(f"\nScraping {unit['name']}...")

            # Select the unit
            unit_resp = self.select_unit(unit["id"])
            if not unit_resp:
                print(f"  Failed to select unit {unit['name']}")
                continue

            # Get today's menus with meal names
            menus = self.get_today_menus(unit_resp)
            if not menus:
                print(f"  No menus found for {unit['name']}")
                continue

            print(f"  Found {len(menus)} menus for today: {', '.join(m['meal'] for m in menus)}")

            # Track items by category, with meal periods
            hall_categories = defaultdict(dict)  # category -> item_name -> item_data
            seen_items = set()  # Track detail_ids we've already fetched

            for menu in menus:
                meal_name = menu["meal"]
                print(f"  Processing {meal_name}...")

                # Select the menu
                menu_resp = self.select_menu(menu["id"])
                if not menu_resp:
                    continue

                # Parse items
                items_by_category = self.parse_menu_items(menu_resp)

                for category, items in items_by_category.items():
                    new_items_count = 0

                    for item in items:
                        item_key = item["item"]

                        # If we've already have this item (by name), just add the meal period
                        if item_key in hall_categories[category]:
                            existing_meals = hall_categories[category][item_key].get("meal_periods", [])
                            if meal_name not in existing_meals:
                                hall_categories[category][item_key]["meal_periods"].append(meal_name)
                            continue

                        # Skip if we've already fetched nutrition for this detail_id
                        if item["detail_id"] in seen_items:
                            continue

                        seen_items.add(item["detail_id"])
                        new_items_count += 1

                        # Get nutrition info
                        nutrition = self.get_nutrition(item["detail_id"])

                        # Only add items with valid nutrition
                        if nutrition.get("Calories"):
                            hall_categories[category][item_key] = {
                                "item": item["item"],
                                "dietary_info": item["dietary_info"],
                                "nutrition": nutrition,
                                "meal_periods": [meal_name]
                            }

                        # Rate limit
                        time.sleep(0.1)

                    if new_items_count:
                        print(f"    {category}: {new_items_count} new items")

            if hall_categories:
                all_data.append({
                    "hall": unit["name"],
                    "menu": [
                        {"category": cat, "items": list(items_dict.values())}
                        for cat, items_dict in hall_categories.items()
                    ]
                })

        return all_data


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Scrape NC State dining menus")
    parser.add_argument("--halls", nargs="+", help="Filter to specific dining halls (partial match)")
    parser.add_argument("--output", default=".", help="Output directory")
    parser.add_argument("--all", action="store_true", help="Scrape all halls, not just open ones")
    args = parser.parse_args()

    scraper = DiningMenuScraper()

    # Default to main dining halls if --all is specified but no --halls
    halls_filter = args.halls
    if args.all and not halls_filter:
        halls_filter = [
            "Fountain Dining Hall",
            "Clark Dining Hall",
            "Case Dining Hall",
            "University Towers Dining Hall",
            "One Earth Dining Hall"
        ]

    data = scraper.scrape_all(halls_filter=halls_filter, only_open=not args.all)

    if not data:
        print("No data scraped")
        return

    # Save full data
    full_path = f"{args.output}/menu_full.json"
    with open(full_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"\nSaved full menu to {full_path}")

    # Save compact data (without ingredients)
    compact_data = deepcopy(data)
    for hall in compact_data:
        for cat in hall["menu"]:
            for item in cat["items"]:
                if "ingredients" in item["nutrition"]:
                    del item["nutrition"]["ingredients"]

    compact_path = f"{args.output}/menu_compact.json"
    with open(compact_path, "w") as f:
        json.dump(compact_data, f, indent=2)
    print(f"Saved compact menu to {compact_path}")


if __name__ == "__main__":
    main()
