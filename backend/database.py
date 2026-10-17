import logging
import os

import psycopg
from werkzeug.security import generate_password_hash


logger = logging.getLogger(__name__)


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required. Set it in backend/.env.")
    return psycopg.connect(database_url)


def initialize_database():
    try:
        with get_connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS enquires (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    organisation VARCHAR(200),
                    email VARCHAR(200) NOT NULL,
                    mobile VARCHAR(30) NOT NULL,
                    nature_of_enquiry VARCHAR(100) NOT NULL,
                    message VARCHAR(3000) NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS admin_users (
                    id BIGSERIAL PRIMARY KEY,
                    username VARCHAR(80) NOT NULL UNIQUE,
                    email VARCHAR(200),
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    last_login_at TIMESTAMPTZ
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS research_publications (
                    id BIGSERIAL PRIMARY KEY,
                    title VARCHAR(250) NOT NULL,
                    slug VARCHAR(250) NOT NULL UNIQUE,
                    description TEXT,
                    abstract TEXT,
                    content TEXT,
                    authors TEXT NOT NULL DEFAULT '',
                    category VARCHAR(150) NOT NULL,
                    document_type VARCHAR(80) NOT NULL,
                    publication_year INTEGER,
                    publication_date DATE,
                    document_format VARCHAR(50) NOT NULL DEFAULT 'PDF',
                    pdf_url TEXT,
                    file_url TEXT,
                    file_size VARCHAR(30),
                    is_published BOOLEAN NOT NULL DEFAULT TRUE,
                    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
                    admin_only BOOLEAN NOT NULL DEFAULT FALSE,
                    keywords TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS research_activity_log (
                    id BIGSERIAL PRIMARY KEY,
                    action VARCHAR(80) NOT NULL,
                    publication_id BIGINT,
                    actor VARCHAR(150),
                    metadata JSONB,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_research_publications_filters
                ON research_publications (is_published, is_archived, category, publication_year, document_type)
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_research_publications_title
                ON research_publications (title)
                """
            )
            ensure_default_admin(connection)
    except Exception:
        logger.exception("Database initialization failed; continuing without persisted research/admin data.")


def ensure_default_admin(connection=None):
    username = (os.getenv("ADMIN_USERNAME") or "").strip()
    password = os.getenv("ADMIN_PASSWORD") or ""
    if not username or not password:
        return

    if connection is None:
        with get_connection() as connection:
            return ensure_default_admin(connection)

    password_hash = generate_password_hash(password)
    result = connection.execute(
        "SELECT 1 FROM admin_users WHERE username = %s",
        (username,),
    ).fetchone()
    if result is None:
        connection.execute(
            """
            INSERT INTO admin_users (username, email, password_hash)
            VALUES (%s, %s, %s)
            """,
            (username, os.getenv("ADMIN_EMAIL"), password_hash),
        )
    else:
        connection.execute(
            "UPDATE admin_users SET password_hash = %s, email = %s WHERE username = %s",
            (password_hash, os.getenv("ADMIN_EMAIL"), username),
        )


def seed_research_publications():
    try:
        with get_connection() as connection:
            count = connection.execute(
                "SELECT COUNT(*) FROM research_publications"
            ).fetchone()[0]
            if count > 0:
                return

            rows = [
                (
                    "Cybersecurity Resilience in Critical Infrastructure",
                    "cybersecurity-resilience-critical-infrastructure",
                    "A comparative analysis of resilience frameworks for essential services and digital public infrastructure.",
                    "Examines the legal and operational resilience requirements for critical systems, utility networks, and public digital infrastructure under escalating cyber threats.",
                    "This report evaluates policy and operational responses for strengthening resilience across critical infrastructure sectors, with a focus on monitoring, governance, and incident preparedness. It highlights the governance gaps between sectoral standards and evolving cyber threats, and recommends institutional capacity-building measures for continuity planning and incident response.",
                    "Dr. Arjun Mehta, Dr. Priya Sharma",
                    "Cybersecurity Law & Policy",
                    "Research Report",
                    2026,
                    "2026-03-06",
                    "PDF",
                    "/assets/research-report.svg",
                    None,
                    "1.8 MB",
                    True,
                    False,
                    False,
                    "critical infrastructure, cyber resilience, public utilities",
                ),
                (
                    "Data Protection in the DPDP Era",
                    "data-protection-dpdp-era",
                    "A policy assessment of rights, obligations, and accountability under the digital personal data protection framework.",
                    "Studies the practical design of notice, consent, and accountability obligations for institutions processing personal data.",
                    "The publication examines how the Indian data protection framework aligns with emerging accountability and governance practices. It analyses obligations for data fiduciaries, data principal rights, and institutional governance and flags the need for interoperable compliance mechanisms.",
                    "Dr. Priya Sharma, Neha Kapoor",
                    "Data Protection & Privacy",
                    "Policy Brief",
                    2026,
                    "2026-02-17",
                    "PDF",
                    "/assets/data-privacy.svg",
                    None,
                    "0.9 MB",
                    True,
                    False,
                    False,
                    "DPDP Act, data protection, privacy governance",
                ),
                (
                    "Digital Sovereignty and Cross-Border Data Flows",
                    "digital-sovereignty-cross-border-data-flows",
                    "Framework conditions for data localisation, transfer controls, and strategic governance in a connected economy.",
                    "Assesses the impact of sovereign data controls on business compliance, technology trade, and digital infrastructure strategy.",
                    "This paper reviews the legal, commercial, and strategic considerations surrounding cross-border data transfers. It evaluates how data governance frameworks interact with national security priorities, public trust, and international digital trade obligations.",
                    "Dr. Rahul Verma, Aditi Nair",
                    "Data Governance & National Security",
                    "Research Paper",
                    2025,
                    "2025-11-08",
                    "PDF",
                    None,
                    None,
                    "2.4 MB",
                    True,
                    False,
                    False,
                    "data sovereignty, cross-border transfers, digital governance",
                ),
                (
                    "Responsible AI Governance for Public Institutions",
                    "responsible-ai-governance-public-institutions",
                    "Institutional design principles for AI accountability, transparency, and safeguards in governance systems.",
                    "Maps the operational governance arrangements that public and quasi-public bodies need to adopt when deploying AI-enabled decision systems.",
                    "This working paper identifies governance tools for responsible AI use in public institutions, including risk classification, procurement safeguards, and human oversight. It connects technical controls to legal accountability and administrative fairness.",
                    "Dr. Ananya Rao, Mehul lyer",
                    "AI & Emerging Technologies",
                    "Working Paper",
                    2025,
                    "2025-06-12",
                    "PDF",
                    "/assets/ai-trust.svg",
                    None,
                    "1.4 MB",
                    True,
                    False,
                    False,
                    "AI governance, accountability, public institutions",
                ),
                (
                    "Digital Evidence Integrity and Chain of Custody",
                    "digital-evidence-integrity-chain-of-custody",
                    "Procedural safeguards for digital evidence collection, preservation, and admissibility in legal proceedings.",
                    "Offers a practical assessment of chain-of-custody protocols for digital forensic evidence under legal scrutiny.",
                    "The paper discusses best practices in evidence preservation, forensic integrity, and procedural accountability. It also identifies recurrent challenges in cross-jurisdictional cases where digital evidence requires demonstrable authenticity and provenance.",
                    "Ritika Sen, Dr. Arjun Mehta",
                    "Digital Forensics & Evidence",
                    "Case Study",
                    2024,
                    "2024-09-26",
                    "PDF",
                    "/assets/cyber-security-ops.jpg",
                    None,
                    "1.1 MB",
                    True,
                    False,
                    False,
                    "digital evidence, forensic integrity, admissibility",
                ),
                (
                    "Technology Regulation and the Public Interest",
                    "technology-regulation-public-interest",
                    "An analysis of digital platform regulation, competition, and rights-based governance across jurisdictions.",
                    "Explores regulatory trade-offs between innovation, freedom of expression, and public safeguards in technology policy.",
                    "This article examines how jurisdictions are balancing platform accountability, market structure, and public-interest safeguards. It discusses institutional responses required to align digital innovation with rights, competition, and democratic governance.",
                    "Dr. Rahul Verma, Kabir Singh",
                    "Technology Regulation",
                    "Journal Article",
                    2024,
                    "2024-06-03",
                    "PDF",
                    None,
                    None,
                    "2.1 MB",
                    True,
                    False,
                    False,
                    "technology regulation, public interest, digital platforms",
                ),
            ]
            with connection.cursor() as cursor:
                cursor.executemany(
                    """
                    INSERT INTO research_publications (
                        title, slug, description, abstract, content, authors, category, document_type,
                        publication_year, publication_date, document_format, pdf_url, file_url, file_size,
                        is_published, is_archived, admin_only, keywords
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    rows,
                )
    except Exception:
        logger.exception("Failed to seed research publications.")
