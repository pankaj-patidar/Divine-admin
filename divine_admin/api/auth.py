import frappe
from frappe.utils.password import update_password
from frappe import _
from frappe.auth import LoginManager

@frappe.whitelist(allow_guest=True)
def signup(**kwargs):
    data = frappe._dict(kwargs)

    required_fields = ["user_type", "full_name", "email", "password"]

    for field in required_fields:
        if not data.get(field):
            frappe.throw(_(f"{field} is required"))

    if frappe.db.exists("User", data.email):
        frappe.throw(_("Email already registered"))

    # Create User
    user = frappe.get_doc({
        "doctype": "User",
        "email": data.email,
        "first_name": data.full_name,
        "enabled": 1,
        "send_welcome_email": 0
    })
    user.insert(ignore_permissions=True)
    update_password(data.email, data.password)

    if data.user_type == "buyer":
        user.add_roles("Customer")

    elif data.user_type == "seller":
        user.add_roles("Seller")

        # Split name
        name_parts = data.full_name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Create Address (if provided)
        address_link = None
        if data.get("address"):
            address = frappe.get_doc({
                "doctype": "Address",
                "address_title": data.full_name,
                "address_type": "Billing",
                "address_line1": data.address,
                "city": data.get("city", ""),
                "state": data.get("state", ""),
                "pincode": data.get("pincode", ""),
                "country": data.get("country", "India"),
                "email_id": data.email,
                "phone": data.get("phone"),
                "links": [
                    {
                        "link_doctype": "User",
                        "link_name": data.email
                    }
                ]
            })
            address.insert(ignore_permissions=True)
            address_link = address.name

        # Create Seller
        seller = frappe.get_doc({
            "doctype": "Seller",
            "first_name": first_name,
            "last_name": last_name,
            "seller_type": data.get("seller_type", "Individual"),
            "company_name": data.get("company_name") if data.get("seller_type") == "Company" else "",
            "email_id": data.email,
            "mobile_no": data.get("phone"),
            "gst_number": data.get("gstin"),
            "status": "Active",
            "address": address_link
        })
        seller.insert(ignore_permissions=True)

    else:
        frappe.throw(_("Invalid user_type. Must be 'seller' or 'buyer'"))

    return {
        "status": "success",
        "message": "Account created",
        "user": data.email
    }


@frappe.whitelist(allow_guest=True)
def login(email=None, password=None):
    if not email or not password:
        return {
            "status": "error",
            "message": "Email and password are required"
        }

    try:
        # Use Frappe's built-in login manager
        frappe.local.login_manager = LoginManager()
        frappe.local.login_manager.authenticate(email, password)
        frappe.local.login_manager.post_login()

        user = frappe.get_doc("User", email)

        return {
            "status": "success",
            "message": "Logged in",
            "sid": frappe.session.sid,
            "user": user.name,
            "roles": [role.role for role in user.roles],
            "full_name": user.full_name or user.first_name
        }

    except frappe.AuthenticationError:
        return {
            "status": "error",
            "message": "Invalid email or password"
        }
