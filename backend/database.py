import os

import psycopg


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is required. Set it in backend/.env.")
    return psycopg.connect(database_url)


def initialize_database():
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
