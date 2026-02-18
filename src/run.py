import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

import google.genai as genai
from dotenv import load_dotenv
from google.genai.errors import ClientError

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"
DATABASE_PATH = DATABASE_DIR / "chat_history.db"
ENV_PATH = BASE_DIR / ".env"


def load_api_key() -> str:
    load_dotenv(ENV_PATH)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY not found. Set it in the .env file.")
    return api_key


def ensure_database_directory() -> None:
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    ensure_database_directory()
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)
        connection.commit()


def create_session() -> str:
    session_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            "INSERT INTO sessions (id, created_at) VALUES (?, ?)",
            (session_id, created_at),
        )
        connection.commit()
    return session_id


def save_message(session_id: str, role: str, content: str) -> None:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (session_id, role, content, created_at),
        )
        connection.commit()


def get_session_history(session_id: str) -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def build_gemini_history(session_id: str) -> list[dict]:
    messages = get_session_history(session_id)
    return [{"role": msg["role"], "parts": [{"text": msg["content"]}]} for msg in messages]


def start_chat_session(client: genai.Client, session_id: str) -> genai.chats.Chat:
    history = build_gemini_history(session_id)
    return client.chats.create(model="gemini-2.0-flash", history=history)


def print_banner() -> None:
    print("=" * 60)
    print("          Gemini Chat - Powered by Google Gemini AI")
    print("=" * 60)
    print("Type your message and press Enter to chat.")
    print("Type 'exit' or 'quit' to end the session.")
    print("Type 'history' to view the current session history.")
    print("=" * 60)


def print_history(session_id: str) -> None:
    messages = get_session_history(session_id)
    if not messages:
        print("\nNo messages in this session yet.\n")
        return
    print("\n--- Session History ---")
    for msg in messages:
        label = "You" if msg["role"] == "user" else "Gemini"
        print(f"[{msg['created_at']}] {label}: {msg['content']}")
    print("-----------------------\n")


def run_chat(chat: genai.chats.Chat, session_id: str) -> None:
    while True:
        try:
            user_input = input("\nYou: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\nSession interrupted. Goodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("exit", "quit"):
            print("\nGoodbye! Session saved.")
            break

        if user_input.lower() == "history":
            print_history(session_id)
            continue

        save_message(session_id, "user", user_input)

        try:
            response = chat.send_message(user_input)
            reply = response.text
        except ClientError as error:
            if error.code == 429:
                print("\nAPI quota exceeded. Please wait a moment before sending another message.")
            else:
                print(f"\nError communicating with Gemini API: {error}")
            continue
        except Exception as error:
            print(f"\nError communicating with Gemini API: {error}")
            continue

        save_message(session_id, "model", reply)
        print(f"\nGemini: {reply}")


def main() -> None:
    api_key = load_api_key()
    initialize_database()

    client = genai.Client(api_key=api_key)

    session_id = create_session()

    print_banner()
    print(f"Session ID: {session_id}\n")

    chat = start_chat_session(client, session_id)
    run_chat(chat, session_id)


if __name__ == "__main__":
    main()
