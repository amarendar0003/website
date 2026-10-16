import logging

from flask import jsonify, request

from backend.database import get_connection
from backend.validation.enquiry import validate_enquiry


def create_enquiry():
    payload = request.get_json(silent=True) or {}
    value, error = validate_enquiry(payload)
    if error:
        return jsonify(error=error), 400

    try:
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO enquires
                    (name, organisation, email, mobile, nature_of_enquiry, message)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    value["name"],
                    value["organisation"] or None,
                    value["email"],
                    value["mobile"],
                    value["enquiry"],
                    value["message"],
                ),
            )
        return jsonify(message="Enquiry received."), 201
    except Exception:
        logging.getLogger(__name__).exception("Failed to save enquiry")
        return jsonify(error="Unable to send your enquiry. Please try again later."), 500
