import frappe

@frappe.whitelist(allow_guest=True)
def get_order_details_for_invoice(order_name):
    print("order_name:", order_name)
    order = frappe.get_doc("Orders", order_name)
    items = []
    for item in order.order_items:
        items.append({
            "product": item.product,
            "quantity": item.qty,
            "rate": item.price,
            "total": item.total_amount
        })

    return {
        "items": items,
        "total_amount": order.total_amount
    }
