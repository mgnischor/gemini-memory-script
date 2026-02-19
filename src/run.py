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
    """Load the Gemini API key from the environment.

    Reads the .env file located at the project root using python-dotenv,
    then retrieves the value of the GEMINI_API_KEY environment variable.

    Returns:
        The API key string read from the environment.

    Raises:
        EnvironmentError: If GEMINI_API_KEY is not set or is empty.
    """
    load_dotenv(ENV_PATH)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY not found. Set it in the .env file.")
    return api_key


def ensure_database_directory() -> None:
    """Create the database directory if it does not already exist.

    Uses pathlib.Path.mkdir with parents=True and exist_ok=True so the call
    is safe to make multiple times and works even when intermediate parent
    directories are missing.
    """
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    """Open and return a connection to the SQLite database.

    The connection uses sqlite3.Row as the row factory so that query results
    can be accessed both by column index and by column name.

    Returns:
        An open sqlite3.Connection pointed at DATABASE_PATH.
    """
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    """Ensure the database schema exists, creating tables when necessary.

    Calls ensure_database_directory() before attempting to open the database
    so the parent directory is always present.  Both CREATE TABLE statements
    use IF NOT EXISTS, making this function idempotent — safe to call on
    every application startup without data loss.

    Tables created:
        sessions: One row per chat session, identified by a UUID primary key.
        messages: One row per user or model message, linked to a session via
            a foreign key on session_id.
    """
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
    """Create a new chat session record in the database.

    Generates a UUID v4 to uniquely identify the session and records the
    creation time as a UTC ISO 8601 timestamp.

    Returns:
        The UUID string of the newly created session.
    """
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
    """Persist a single chat message to the database.

    Inserts a new row into the messages table with the current UTC time as
    the creation timestamp.  This function is called twice per exchange: once
    before sending the user input to the API, and once after receiving the
    model response.

    Args:
        session_id: The UUID of the session this message belongs to.
        role: The author of the message. Must be either ``"user"`` or
            ``"model"`` to match the values expected by the Gemini SDK.
        content: The full text content of the message.
    """
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            "INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (session_id, role, content, created_at),
        )
        connection.commit()


def get_session_history(session_id: str) -> list[dict]:
    """Retrieve all messages for a given session ordered by insertion time.

    Queries the messages table for every row whose session_id matches the
    supplied argument, returning results in ascending order of the auto-
    incremented primary key so the conversation sequence is preserved.

    Args:
        session_id: The UUID of the session whose history is requested.

    Returns:
        A list of dictionaries, each containing the keys ``role``,
        ``content``, and ``created_at`` for one message.
    """
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def build_gemini_history(session_id: str) -> list[dict]:
    """Convert stored messages into the history format required by the Gemini SDK.

    The Gemini SDK expects history as a list of content objects where each
    object has a ``role`` key and a ``parts`` list whose elements are
    dictionaries with a ``text`` key.  This function translates the flat
    database records into that nested structure.

    Args:
        session_id: The UUID of the session whose history should be converted.

    Returns:
        A list of dicts formatted as Gemini SDK content objects, ready to be
        passed to ``client.chats.create(history=...)``.
    """
    messages = get_session_history(session_id)
    return [{"role": msg["role"], "parts": [{"text": msg["content"]}]} for msg in messages]


def start_chat_session(client: genai.Client, session_id: str) -> genai.chats.Chat:
    """Create a Gemini chat session pre-loaded with the stored conversation history.

    Fetches the persisted history from the database, converts it to the SDK
    format, and passes it to the Gemini client so the model has full context
    of prior exchanges when generating new responses.

    Args:
        client: An authenticated ``genai.Client`` instance.
        session_id: The UUID of the session whose history should be injected
            into the new chat.

    Returns:
        A ``genai.chats.Chat`` object ready to send and receive messages.
    """
    history = build_gemini_history(session_id)
    return client.chats.create(model="gemini-2.0-flash", history=history)


def print_banner() -> None:
    """Print the application welcome banner and list of available commands."""
    print("=" * 60)
    print("          Gemini Chat - Powered by Google Gemini AI")
    print("=" * 60)
    print("Type your message and press Enter to chat.")
    print("Type 'exit' or 'quit' to end the session.")
    print("Type 'history' to view the current session history.")
    print("=" * 60)


def print_history(session_id: str) -> None:
    """Print the full message history of the current session to stdout.

    Retrieves all stored messages for the given session and prints each one
    with its UTC timestamp and a human-readable author label (``You`` for
    user messages, ``Gemini`` for model responses).  If no messages exist
    yet a short notice is printed instead.

    Args:
        session_id: The UUID of the session whose history should be displayed.
    """
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
    """Run the interactive chat loop until the user exits.

    Reads user input from stdin in a continuous loop, handles built-in
    commands (``exit``, ``quit``, ``history``), persists every user message
    before sending it to the Gemini API, persists every model reply after
    receiving it, and prints the reply to stdout.

    Error handling per message:
        - HTTP 429 (ResourceExhausted / quota exceeded): prints a friendly
          rate-limit message and allows the user to retry.
        - Other ``ClientError`` subclasses: prints the raw error and continues.
        - Any unexpected exception: prints the error and continues so a single
          failure does not terminate the entire session.

    The loop terminates when the user types ``exit`` or ``quit``, or when a
    ``KeyboardInterrupt`` / ``EOFError`` is raised (e.g. Ctrl+C or Ctrl+D).

    Args:
        chat: An active ``genai.chats.Chat`` session.
        session_id: The UUID of the current session, used to persist messages.
    """
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
    """Application entry point.

    Orchestrates the full startup sequence:

    1. Load the Gemini API key from the .env file.
    2. Initialise the SQLite database and ensure the schema exists.
    3. Configure and instantiate the Gemini client.
    4. Create a new session record in the database.
    5. Print the welcome banner.
    6. Start a Gemini chat session pre-loaded with any existing history.
    7. Enter the interactive chat loop.
    """
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
