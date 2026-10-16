import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

from backend.database import initialize_database
from backend.routes.enquiries import enquiries_blueprint

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(Path(__file__).resolve().parent / ".env")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024
app.register_blueprint(enquiries_blueprint, url_prefix="/api/enquiries")


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.get("/<path:filename>")
def website_file(filename):
    # Keep backend source and configuration out of the public static file tree.
    if filename == "backend" or filename.startswith("backend/"):
        return "Not found", 404
    requested_path = (PROJECT_ROOT / filename).resolve()
    if PROJECT_ROOT not in requested_path.parents:
        return "Not found", 404
    return send_from_directory(PROJECT_ROOT, filename)


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify(error="The submitted form is too large."), 413


if __name__ == "__main__":
    if not os.getenv("DATABASE_URL"):
        raise RuntimeError("DATABASE_URL is required. Set it in backend/.env.")
    initialize_database()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "3000")))
