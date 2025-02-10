import scrapy
import json
from collections import defaultdict
from copy import deepcopy


class DiningMenuSpider(scrapy.Spider):
    name = "dining_menu"
    start_urls = ["https://dining.ncsu.edu/locations/"]
    base_url = "https://dining.ncsu.edu/wp-admin/admin-ajax.php"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.all_dining_data = {}
        self.open_dining_halls = []

    def closed(self, reason):
        full_data = [
            {
                "hall": dh,
                "menu": [
                    {"category": cat, "items": items}
                    for cat, items in categories.items()
                ],
            }
            for dh, categories in self.all_dining_data.items()
        ]

        compact_data = deepcopy(full_data)
        for entry in compact_data:
            for cat_obj in entry["menu"]:
                for item in cat_obj["items"]:
                    if "ingredients" in item["nutrition"]:
                        del item["nutrition"]["ingredients"]

        with open("menu_full.json", "w") as f:
            json.dump(full_data, f, indent=2)

        with open("menu_compact.json", "w") as f:
            json.dump(compact_data, f, indent=2)

    def parse(self, response):
        dining_container = response.css('div[rel="dining-halls"]')
        open_locations = dining_container.css(".location-tile--open")

        for location in open_locations:
            link = location.css("a::attr(href)").get()
            name = location.css(".location-tile__bar strong::text").get().strip()
            hours = location.css(".location-tile__date .range::text").get().strip()
            self.open_dining_halls.append({"name": name, "hours": hours})

            yield scrapy.Request(
                link, callback=self.parse_dining_hall, cb_kwargs={"dining_hall": name}
            )

    def parse_dining_hall(self, response, dining_hall):
        categories = response.css(".dining-menu-category")
        menu_data = defaultdict(list)

        for category in categories:
            category_name = category.css("h4::text").get()
            items = category.css(".location__meal-category-list li")

            for item in items:
                item_rel = item.css("a::attr(rel)").get()
                food_item = item.css("a::text").get().strip()
                dietary_info = [
                    icon.attrib["data-diet"]
                    for icon in item.css(".dining-menu-dietary-icon")
                ]

                temp_item = {
                    "item": food_item,
                    "dietary_info": dietary_info,
                    "nutrition": {},
                }

                nutrition_url = f"{self.base_url}?action=ncdining_ajax_get_item_nutrition&item_id={item_rel}"
                yield scrapy.Request(
                    nutrition_url,
                    callback=self.parse_nutrition,
                    cb_kwargs={
                        "dining_hall": dining_hall,
                        "category": category_name,
                        "temp_item": temp_item,
                    },
                )

    def parse_nutrition(self, response, dining_hall, category, temp_item):
        if dining_hall not in self.all_dining_data:
            self.all_dining_data[dining_hall] = defaultdict(list)

        nutrition_rows = response.css(".menu-nutrition-row")
        nutrition_data = {}

        for row in nutrition_rows:
            label = row.css("strong::text").get().strip(":")
            value = row.css(".menu-nutrition-row-value::text").get()
            try:
                value = float(value)
            except (ValueError, TypeError):
                pass
            nutrition_data[label] = value

        ingredients = response.css(".menu-dining-menu-modal-ingredients::text").getall()
        if ingredients:
            ingredients = " ".join(ingredients).strip()
            nutrition_data["ingredients"] = ingredients

        temp_item["nutrition"] = nutrition_data
        self.all_dining_data[dining_hall][category].append(temp_item)
