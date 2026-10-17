import time

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash

from backend.database import get_connection

admin_blueprint = Blueprint("admin", __name__)
LOGIN_WINDOW_SECONDS = 900
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPTS = {}


def rate_limited(client_ip):
    now = time.time()
    attempts = LOGIN_ATTEMPTS.setdefault(client_ip, [])
    attempts[:] = [stamp for stamp in attempts if now - stamp < LOGIN_WINDOW_SECONDS]
    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        return True
    return False


def log_activity(action, publication_id=None, actor=None, metadata=None):
    try:
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO research_activity_log (action, publication_id, actor, metadata)
                VALUES (%s, %s, %s, %s)
                """,
                (action, publication_id, actor, metadata or {}),
            )
    except Exception:
        pass


@admin_blueprint.route("/login", methods=["POST"])
def admin_login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    client_ip = request.remote_addr or "unknown"

    if not username or not password:
        return jsonify(error="Username and password are required."), 400

    if rate_limited(client_ip):
        return jsonify(error="Too many failed login attempts. Please try again later."), 429

    try:
        with get_connection() as connection:
            user = connection.execute(
                "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
                (username,),
            ).fetchone()
    except Exception:
        return jsonify(error="Admin authentication is unavailable right now."), 503

    if user is None or not check_password_hash(user[2], password):
        LOGIN_ATTEMPTS.setdefault(client_ip, []).append(time.time())
        return jsonify(error="Invalid username or password."), 401

    LOGIN_ATTEMPTS.pop(client_ip, None)
    session.clear()
    session["admin_authenticated"] = True
    session["admin_username"] = user[1]
    log_activity("login", actor=user[1], metadata={"ip": client_ip})
    return jsonify(message="Signed in successfully."), 200


@admin_blueprint.route("/logout", methods=["POST"])
def admin_logout():
    session.clear()
    return jsonify(message="Signed out."), 200


@admin_blueprint.route("/me", methods=["GET"])
def admin_me():
    if not session.get("admin_authenticated"):
        return jsonify(error="Authentication required."), 401
    return jsonify({"username": session.get("admin_username")})


@admin_blueprint.route("/summary", methods=["GET"])
def admin_summary():
    if not session.get("admin_authenticated"):
        return jsonify(error="Authentication required."), 401

    try:
        with get_connection() as connection:
            total = connection.execute("SELECT COUNT(*) FROM research_publications").fetchone()[0]
            published = connection.execute(
                "SELECT COUNT(*) FROM research_publications WHERE is_published = TRUE AND is_archived = FALSE"
            ).fetchone()[0]
            draft = connection.execute(
                "SELECT COUNT(*) FROM research_publications WHERE is_published = FALSE AND is_archived = FALSE"
            ).fetchone()[0]
            archived = connection.execute(
                "SELECT COUNT(*) FROM research_publications WHERE is_archived = TRUE"
            ).fetchone()[0]
            categories = connection.execute(
                "SELECT COUNT(DISTINCT category) FROM research_publications"
            ).fetchone()[0]
            recent = connection.execute(
                "SELECT id, title, category, publication_date, is_published, is_archived, updated_at FROM research_publications ORDER BY updated_at DESC LIMIT 5"
            ).fetchall()
            activity = connection.execute(
                "SELECT action, publication_id, actor, metadata, created_at FROM research_activity_log ORDER BY created_at DESC LIMIT 12"
            ).fetchall()
    except Exception:
        return jsonify(error="Unable to load dashboard data."), 500

    return jsonify({
        "totals": {
            "total_publications": total,
            "published_publications": published,
            "draft_publications": draft,
            "archived_publications": archived,
            "total_categories": categories,
        },
        "recent_publications": [
            {
                "id": row[0],
                "title": row[1],
                "category": row[2],
                "publication_date": row[3].isoformat() if row[3] else None,
                "is_published": row[4],
                "is_archived": row[5],
                "updated_at": row[6].isoformat() if row[6] else None,
            }
            for row in recent
        ],
        "recent_activity": [
            {
                "action": row[0],
                "publication_id": row[1],
                "actor": row[2],
                "metadata": row[3],
                "created_at": row[4].isoformat() if row[4] else None,
            }
            for row in activity
        ],
    })


@admin_blueprint.route("/publications", methods=["GET", "POST"])
def admin_publications():
    if not session.get("admin_authenticated"):
        return jsonify(error="Authentication required."), 401

    if request.method == "POST":
        payload = request.get_json(silent=True) or {}
        title = (payload.get("title") or "").strip()
        if not title:
            return jsonify(error="Title is required."), 400

        category = (payload.get("category") or "").strip()
        document_type = (payload.get("document_type") or "").strip()
        if not category or not document_type:
            return jsonify(error="Category and document type are required."), 400

        authors = (payload.get("authors") or "").strip()
        description = (payload.get("description") or "").strip()
        abstract = (payload.get("abstract") or "").strip()
        content = (payload.get("content") or "").strip()
        status = (payload.get("status") or "draft").strip().lower()
        publication_year = payload.get("publication_year")
        publication_date = payload.get("publication_date") or None
        document_format = (payload.get("document_format") or "PDF").strip() or "PDF"
        pdf_url = (payload.get("pdf_url") or "").strip() or None
        file_url = (payload.get("file_url") or "").strip() or None
        file_size = (payload.get("file_size") or "").strip() or None
        keywords = (payload.get("keywords") or "").strip()
        slug_base = title.lower().replace("&", "and").replace("/", "-")
        slug = "-".join([token for token in slug_base.replace(" ", "-").replace("--", "-").split("-") if token])

        try:
            with get_connection() as connection:
                candidate_slug = slug
                suffix = 1
                while True:
                    existing = connection.execute(
                        "SELECT id FROM research_publications WHERE slug = %s",
                        (candidate_slug,),
                    ).fetchone()
                    if existing is None:
                        slug = candidate_slug
                        break
                    candidate_slug = f"{slug}-{suffix}"
                    suffix += 1
                connection.execute(
                    """
                    INSERT INTO research_publications (
                        title, slug, description, abstract, content, authors, category, document_type,
                        publication_year, publication_date, document_format, pdf_url, file_url, file_size,
                        is_published, is_archived, admin_only, keywords
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        title,
                        slug,
                        description,
                        abstract,
                        content,
                        authors,
                        category,
                        document_type,
                        publication_year,
                        publication_date,
                        document_format,
                        pdf_url,
                        file_url,
                        file_size,
                        status == "published",
                        status == "archived",
                        False,
                        keywords,
                    ),
                )
                publication_id = connection.execute(
                    "SELECT id FROM research_publications WHERE slug = %s ORDER BY id DESC LIMIT 1",
                    (slug,),
                ).fetchone()[0]
                log_activity("created_publication", publication_id, session.get("admin_username"), payload)
            return jsonify(message="Publication saved.", id=publication_id), 201
        except Exception:
            return jsonify(error="Unable to save publication."), 500

    try:
        with get_connection() as connection:
            rows = connection.execute(
                "SELECT * FROM research_publications ORDER BY updated_at DESC LIMIT 200"
            ).fetchall()
    except Exception:
        return jsonify(error="Unable to load publications."), 500

    return jsonify({
        "publications": [{
            "id": row[0],
            "title": row[1],
            "slug": row[2],
            "description": row[3],
            "abstract": row[4],
            "content": row[5],
            "authors": row[6],
            "category": row[7],
            "document_type": row[8],
            "publication_year": row[9],
            "publication_date": row[10].isoformat() if row[10] else None,
            "document_format": row[11],
            "pdf_url": row[12],
            "file_url": row[13],
            "file_size": row[14],
            "is_published": row[15],
            "is_archived": row[16],
            "keywords": (row[18].split(",") if row[18] else []),
            "created_at": row[19].isoformat() if row[19] else None,
            "updated_at": row[20].isoformat() if row[20] else None,
        } for row in rows]
    })


@admin_blueprint.route("/publications/<int:publication_id>", methods=["GET", "PUT", "DELETE"])
def admin_single_publication(publication_id):
    if not session.get("admin_authenticated"):
        return jsonify(error="Authentication required."), 401

    try:
        with get_connection() as connection:
            if request.method == "GET":
                row = connection.execute(
                    "SELECT * FROM research_publications WHERE id = %s",
                    (publication_id,),
                ).fetchone()
                if row is None:
                    return jsonify(error="Publication not found."), 404
                return jsonify({
                    "id": row[0],
                    "title": row[1],
                    "slug": row[2],
                    "description": row[3],
                    "abstract": row[4],
                    "content": row[5],
                    "authors": row[6],
                    "category": row[7],
                    "document_type": row[8],
                    "publication_year": row[9],
                    "publication_date": row[10].isoformat() if row[10] else None,
                    "document_format": row[11],
                    "pdf_url": row[12],
                    "file_url": row[13],
                    "file_size": row[14],
                    "is_published": row[15],
                    "is_archived": row[16],
                    "admin_only": row[17],
                    "keywords": (row[18].split(",") if row[18] else []),
                    "created_at": row[19].isoformat() if row[19] else None,
                    "updated_at": row[20].isoformat() if row[20] else None,
                })

            if request.method == "PUT":
                payload = request.get_json(silent=True) or {}
                title = (payload.get("title") or "").strip()
                if not title:
                    return jsonify(error="Title is required."), 400
                status = (payload.get("status") or "draft").strip().lower()
                publication_year = payload.get("publication_year")
                publication_date = payload.get("publication_date") or None
                document_format = (payload.get("document_format") or "PDF").strip() or "PDF"
                pdf_url = (payload.get("pdf_url") or "").strip() or None
                file_url = (payload.get("file_url") or "").strip() or None
                file_size = (payload.get("file_size") or "").strip() or None
                keywords = (payload.get("keywords") or "").strip()
                connection.execute(
                    """
                    UPDATE research_publications
                    SET title = %s,
                        description = %s,
                        abstract = %s,
                        content = %s,
                        authors = %s,
                        category = %s,
                        document_type = %s,
                        publication_year = %s,
                        publication_date = %s,
                        document_format = %s,
                        pdf_url = %s,
                        file_url = %s,
                        file_size = %s,
                        keywords = %s,
                        is_published = %s,
                        is_archived = %s,
                        updated_at = NOW()
                    WHERE id = %s
                    """,
                    (
                        title,
                        (payload.get("description") or "").strip(),
                        (payload.get("abstract") or "").strip(),
                        (payload.get("content") or "").strip(),
                        (payload.get("authors") or "").strip(),
                        (payload.get("category") or "").strip(),
                        (payload.get("document_type") or "").strip(),
                        publication_year,
                        publication_date,
                        document_format,
                        pdf_url,
                        file_url,
                        file_size,
                        keywords,
                        status == "published",
                        status == "archived",
                        publication_id,
                    ),
                )
                log_activity("updated_publication", publication_id, session.get("admin_username"), payload)
                return jsonify(message="Publication updated."), 200

            if request.method == "DELETE":
                connection.execute("DELETE FROM research_publications WHERE id = %s", (publication_id,))
                log_activity("deleted_publication", publication_id, session.get("admin_username"), {"deleted": True})
                return jsonify(message="Publication deleted."), 200
    except Exception:
        return jsonify(error="Unable to process publication."), 500

    return jsonify(error="Unsupported operation."), 400
