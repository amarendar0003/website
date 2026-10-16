from flask import Blueprint

from backend.controllers.enquiries import create_enquiry

enquiries_blueprint = Blueprint("enquiries", __name__)
enquiries_blueprint.add_url_rule("", view_func=create_enquiry, methods=["POST"])
