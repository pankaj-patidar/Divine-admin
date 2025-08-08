// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

frappe.ui.form.on("Invoice", {

    validate(frm) {
        calculate_invoice_totals(frm);
    },

    order: function (frm) {
        console.log("Order changed in Invoice", frm.doc.order);

        if (frm.doc.order) {
            frappe.call({
                method: "divine_admin.api.order_to_invoice.get_order_details_for_invoice",
                args: {
                    order_name: frm.doc.order
                },
                callback: function (r) {
                    if (r.message) {
                        // Set customer
                        // frm.set_value("customer_name", r.message.customer);

                        // Clear existing invoice items
                        frm.clear_table("items");

                        // Add each item from order
                        (r.message.items || []).forEach(item => {
                            console.log("Adding item to invoice:", item);
                            frm.add_child("items", {
                                product: item.product,
                                qty: item.quantity,
                                price: item.rate,
                                total: item.total
                            });
                        });

                        // Set total amount
                        frm.set_value("total_amount", r.message.total_amount || 0);

                        // Refresh the table field
                        frm.refresh_field("items");
                    }
                }
            });
        }
    }

});

frappe.ui.form.on("Invoice Item", {
    qty(frm, cdt, cdn) {
        console.log("Quantity changed in Invoice Item");
        update_invoice_item_totals(frm, cdt, cdn);
    },
    price(frm, cdt, cdn) {
        console.log("Price changed in Invoice Item");
        update_invoice_item_totals(frm, cdt, cdn);
    },
    gst_percent(frm, cdt, cdn) {
        console.log("GST Percent changed in Invoice Item");
        update_invoice_item_totals(frm, cdt, cdn);
    },
    items_add(frm) {
        console.log("Invoice Item added");
        calculate_invoice_totals(frm);
    },
    items_remove(frm) {
        console.log("Invoice Item removed");
        calculate_invoice_totals(frm);
    }
});

function update_invoice_item_totals(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const qty = row.qty || 0;
    const price = row.price || 0;
    const gst_percent = row.gst_percent || 0;

    const base_amount = qty * price;
    const gst_amount = (base_amount * gst_percent) / 100;
    const total = base_amount + gst_amount;

    frappe.model.set_value(cdt, cdn, "gst_amount", gst_amount);
    frappe.model.set_value(cdt, cdn, "total", total);

    // After updating individual row, update invoice totals
    calculate_invoice_totals(frm);
}

function calculate_invoice_totals(frm) {
    let subtotal = 0;
    let gst_amount = 0;
    let total_amount = 0;

    if (frm.doc.items && frm.doc.items.length > 0) {
        frm.doc.items.forEach(row => {
            const qty = row.qty || 0;
            const price = row.price || 0;
            const base = qty * price;
            const gst = row.gst_amount || 0;
            const total = base + gst;

            subtotal += base;
            gst_amount += gst;
            total_amount += total;
        });
    }

    frm.set_value("subtotal", subtotal);
    frm.set_value("gst_amount", gst_amount);
    frm.set_value("total_amount", total_amount);
}

