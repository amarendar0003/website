import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory

from backend.database import initialize_database, seed_research_publications
from backend.routes.admin import admin_blueprint
from backend.routes.enquiries import enquiries_blueprint
from backend.routes.publications import publications_blueprint

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(Path(__file__).resolve().parent / ".env")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "cs-dpcru-dev-secret")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("FLASK_ENV") == "production"
app.register_blueprint(enquiries_blueprint, url_prefix="/api/enquiries")
app.register_blueprint(publications_blueprint, url_prefix="/api/publications")
app.register_blueprint(admin_blueprint, url_prefix="/api/admin")


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.get("/admin")
@app.get("/admin/")
def admin_root():
    return send_from_directory(PROJECT_ROOT / "admin", "login.html")


@app.get("/admin/<path:filename>")
def admin_file(filename):
    requested_path = (PROJECT_ROOT / "admin" / filename).resolve()
    if PROJECT_ROOT not in requested_path.parents:
        return "Not found", 404
    return send_from_directory(PROJECT_ROOT / "admin", filename)


@app.get("/publications/<int:publication_id>")
def publication_view(publication_id):
    return send_from_directory(PROJECT_ROOT, "publication-view.html")


@app.get("/<path:filename>")
def website_file(filename):
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
    initialize_database()
    seed_research_publications()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "3000")))
