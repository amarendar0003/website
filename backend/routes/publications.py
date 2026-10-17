from flask import Blueprint, jsonify, request

from backend.database import get_connection

publications_blueprint = Blueprint("publications", __name__)


RESEARCH_CATEGORIES = [
    "Cybersecurity Law & Policy",
    "Data Protection & Privacy",
    "Data Governance & National Security",
    "AI & Emerging Technologies",
    "Digital Forensics & Evidence",
    "Technology Regulation",
]

DOCUMENT_TYPES = [
    "Research Paper",
    "Journal Article",
    "Policy Brief",
    "Research Report",
    "Working Paper",
    "Case Study",
    "White Paper",
    "Other",
]


@publications_blueprint.route("", methods=["GET"])
def list_publications():
    params = request.args
    search = (params.get("search") or "").strip()
    category = (params.get("category") or "all").strip()
    selected_year = (params.get("year") or "all").strip()
    doc_type = (params.get("document_type") or "all").strip()
    author = (params.get("author") or "all").strip()
    sort = (params.get("sort") or "newest").strip()
    page = max(1, int(params.get("page") or 1))
    limit = min(50, max(1, int(params.get("limit") or 9)))

    try:
        with get_connection() as connection:
            filters = [
                "is_published = TRUE",
                "is_archived = FALSE",
                "admin_only = FALSE",
            ]
            values = []

            if search:
                filters.append(
                    "(LOWER(title) LIKE %s OR LOWER(description) LIKE %s OR LOWER(abstract) LIKE %s OR LOWER(authors) LIKE %s OR LOWER(content) LIKE %s)"
                )
                term = f"%{search.lower()}%"
                values.extend([term] * 5)

            if category != "all":
                filters.append("category = %s")
                values.append(category)

            if selected_year != "all":
                filters.append("publication_year = %s")
                values.append(int(selected_year))

            if doc_type != "all":
                filters.append("document_type = %s")
                values.append(doc_type)

            if author != "all":
                filters.append("authors ILIKE %s")
                values.append(f"%{author}%")

            where_clause = " AND ".join(filters)
            count_sql = f"SELECT COUNT(*) FROM research_publications WHERE {where_clause}"
            total = connection.execute(count_sql, values).fetchone()[0]

            order_sql = "ORDER BY publication_date DESC, created_at DESC"
            if sort == "oldest":
                order_sql = "ORDER BY publication_date ASC, created_at ASC"
            elif sort == "title":
                order_sql = "ORDER BY title ASC"

            sql = f"SELECT * FROM research_publications WHERE {where_clause} {order_sql} LIMIT %s OFFSET %s"
            offset = (page - 1) * limit
            rows = connection.execute(sql, values + [limit, offset]).fetchall()

            years = connection.execute(
                "SELECT DISTINCT publication_year FROM research_publications WHERE is_published = TRUE AND is_archived = FALSE AND admin_only = FALSE AND publication_year IS NOT NULL ORDER BY publication_year DESC"
            ).fetchall()
            author_rows = connection.execute(
                "SELECT DISTINCT authors FROM research_publications WHERE is_published = TRUE AND is_archived = FALSE AND admin_only = FALSE ORDER BY authors ASC"
            ).fetchall()

            publications = []
            for row in rows:
                publications.append({
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
                    "keywords": (row[18].split(",") if row[18] else []),
                })

            return jsonify({
                "publications": publications,
                "total": total,
                "page": page,
                "per_page": limit,
                "pages": max(1, (total + limit - 1) // limit) if total else 1,
                "years": [year[0] for year in years],
                "authors": [author[0] for author in author_rows if author[0]],
                "categories": RESEARCH_CATEGORIES,
            })
    except Exception as exc:  # pragma: no cover - defensive fallback for missing database
        return jsonify({
            "publications": [],
            "total": 0,
            "page": page,
            "per_page": limit,
            "pages": 1,
            "years": [],
            "authors": [],
            "categories": RESEARCH_CATEGORIES,
            "error": str(exc),
        })


@publications_blueprint.route("/<int:publication_id>", methods=["GET"])
def get_publication(publication_id):
    try:
        with get_connection() as connection:
            row = connection.execute(
                "SELECT * FROM research_publications WHERE id = %s AND is_published = TRUE AND is_archived = FALSE AND admin_only = FALSE",
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
                "keywords": (row[18].split(",") if row[18] else []),
            })
    except Exception:
        return jsonify(error="Publication could not be loaded."), 500
