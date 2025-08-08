// Copyright (c) 2025, Pankaj Patidar and contributors
// For license information, please see license.txt

frappe.ui.form.on("Products", {
    refresh(frm) {
        // Optional: Set field read-only if calculated
        frm.set_df_property("selling_price", "read_only", 1);
    },

    // When MRP or Discount % is changed
    // mrp(frm) {
    // 	calculate_selling_price(frm);
    // },

    // discount_per(frm) {
    // 	calculate_selling_price(frm);
    // },

    validate(frm) {
        // Ensure calculation happens before save
        calculate_selling_price(frm);
    }
});

function calculate_selling_price(frm) {
    const mrp = frm.doc.mrp || 0;
    const discount = frm.doc.discount_per || 0;

    if (mrp > 0 && discount >= 0) {
        const discount_amount = (mrp * discount) / 100;
        const selling_price = mrp - discount_amount;
        frm.set_value("selling_price", selling_price.toFixed(2));
    }
}
