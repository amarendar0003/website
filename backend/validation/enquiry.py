import re

NATURES = {
    "Research collaboration",
    "Cybersecurity and resilience",
    "Data protection readiness",
    "Training or workshops",
    "Policy research",
    "Academic engagement",
    "Other",
}


def clean_string(value, limit):
    if not isinstance(value, str):
        return ""
    return re.sub(r"[\x00-\x1f\x7f-\x9f]", "", value.strip())[:limit]


def validate_enquiry(payload):
    value = {
        "name": clean_string(payload.get("name"), 150),
        "organisation": clean_string(payload.get("organisation"), 200),
        "email": clean_string(payload.get("email"), 200),
        "mobile": clean_string(payload.get("mobile"), 30),
        "enquiry": clean_string(payload.get("enquiry"), 100),
        "message": clean_string(payload.get("message"), 3000),
    }

    if not all(value[field] for field in ("name", "email", "mobile", "enquiry", "message")):
        return None, "Please complete all required fields."
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value["email"]):
        return None, "Please enter a valid email address."
    if not re.fullmatch(r"\+?[0-9().\s-]{7,30}", value["mobile"]):
        return None, "Please enter a valid mobile number."
    if value["enquiry"] not in NATURES:
        return None, "Please choose a valid nature of enquiry."

    return value, None
