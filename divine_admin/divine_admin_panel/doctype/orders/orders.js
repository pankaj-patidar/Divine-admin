// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

frappe.ui.form.on("Orders", {
    refresh(frm) {
        calculate_order_total(frm);
    },

    validate(frm) {
        calculate_order_total(frm);
    }
});

frappe.ui.form.on("Order Items", {
    product(frm, cdt, cdn) {
        // Recalculate total when product is selected (price may be auto-fetched)
        update_line_total(frm, cdt, cdn);
    },

    price(frm, cdt, cdn) {
        // Recalculate when price is manually changed
        update_line_total(frm, cdt, cdn);
    },

    qty(frm, cdt, cdn) {
        // Recalculate when quantity is changed
        update_line_total(frm, cdt, cdn);
    },

    order_items_add(frm) {
        calculate_order_total(frm);
    },

    order_items_remove(frm) {
        calculate_order_total(frm);
    }
});

function update_line_total(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const qty = row.qty || 0;
    const price = row.price || 0;
    const total = qty * price;

    // Proper way to update child row field
    frappe.model.set_value(cdt, cdn, "total_amount", total);

    // After individual row update, update the grand total
    calculate_order_total(frm);
}

function calculate_order_total(frm) {
    let total = 0;

    if (frm.doc.order_items && frm.doc.order_items.length > 0) {
        frm.doc.order_items.forEach(row => {
            total += row.total_amount || 0;
        });
    }

    frm.set_value("total_amount", total);
}

