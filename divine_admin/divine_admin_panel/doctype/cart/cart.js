// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cart", {
    refresh(frm) {
        calculate_totals(frm);
    },

    validate(frm) {
        calculate_totals(frm);
    }
});

frappe.ui.form.on("Cart Item", {
    quantity(frm, cdt, cdn) {
        console.log("Product changed in Cart Items");
        update_item_amount(frm, cdt, cdn);
    },
    product(frm, cdt, cdn) {
        console.log("Product changed in Cart Items");
        update_item_amount(frm, cdt, cdn);
    },
    rate(frm, cdt, cdn) {
        console.log("Rate changed in Cart Items");
        update_item_amount(frm, cdt, cdn);
    },

    cart_items_remove(frm) {
        console.log("Cart item removed");
        calculate_totals(frm);
    },

    cart_items_add(frm) {
        console.log("Cart item added");
        calculate_totals(frm);
    }
});

// Helper to calculate line total and update
function update_item_amount(frm, cdt, cdn) {
    const item = frappe.get_doc(cdt, cdn);
    const quantity = item.quantity || 0;
    const rate = item.price || 0;
    item.total_price = quantity * rate;
    console.log("Updated item total price:", item.total_price);
    console.log("Item q * r:", quantity * rate);
    frm.refresh_field("cart_items");
    calculate_totals(frm);
}

// Helper to calculate subtotal & total
function calculate_totals(frm) {
    let subtotal = 0;
    let totalPrice = 0;
    if (frm.doc.cart_items && frm.doc.cart_items.length) {
        frm.doc.cart_items.forEach(item => {
            const amt = item.price || 0;
            subtotal += amt;

            total_price = item.total_price || 0;
            totalPrice += total_price
        });
    }
    frm.set_value("sub_total", subtotal);
    frm.set_value("total", totalPrice); // Modify later to include taxes/coupons
}

