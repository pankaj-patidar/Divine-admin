import frappe

def create_product_categories():
    categories = [
        {"category_name": "Smartphones", "slug": "smartphones", "description": "Latest smartphones & mobiles", "is_active": 1},
        {"category_name": "Accessories", "slug": "accessories", "description": "Phone accessories and add-ons", "is_active": 1},
        {"category_name": "Smartwatches", "slug": "smartwatches", "description": "Wearable smart devices", "is_active": 1},
        {"category_name": "Tablets", "slug": "tablets", "description": "Android & iOS tablets", "is_active": 1},
        {"category_name": "Audio Devices", "slug": "audio-devices", "description": "Headphones, earbuds, speakers", "is_active": 1},
        {"category_name": "Power & Charging", "slug": "power-charging", "description": "Power banks, chargers, cables", "is_active": 1},
        {"category_name": "Screen Protectors", "slug": "screen-protectors", "description": "Tempered glass, screen guards", "is_active": 1},
        {"category_name": "Cases & Covers", "slug": "cases-covers", "description": "Phone back covers and flip cases", "is_active": 1},
    ]

    for cat in categories:
        if not frappe.db.exists("Product Category", cat["category_name"]):
            doc = frappe.get_doc({
                "doctype": "Product Category",
                **cat
            })
            doc.insert()
            frappe.db.commit()
            print(f"Inserted category: {cat['category_name']}")

create_product_categories()
