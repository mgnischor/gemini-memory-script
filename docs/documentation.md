# Gemini Memory Script - Technical Documentation

## Overview

Gemini Memory Script is a command-line chat application that connects to the Google Gemini API and persists all conversation history in a local SQLite database. Each session is uniquely identified and all messages (user and model) are stored with timestamps for future reference.

---

## Architecture

```
gemini-memory-script/
├── src/
│   └── run.py          # Main application entry point
├── database/           # Auto-created at runtime
│   └── chat_history.db # SQLite database file
├── docs/
│   └── documentation.md
├── .env                # API key configuration (not tracked by git)
├── run.cmd             # Windows launcher
├── run.sh              # Linux/macOS launcher
└── README.md
```

---

## Components

### `src/run.py`

The entire application lives in this single module. It is organized into the following logical layers:

#### Configuration & Environment
| Function | Description |
|---|---|
| `load_api_key()` | Loads the `GEMINI_API_KEY` from the `.env` file using `python-dotenv`. Raises `EnvironmentError` if the key is missing. |

#### Database Layer
| Function | Description |
|---|---|
| `ensure_database_directory()` | Creates the `database/` directory if it does not exist. |
| `get_connection()` | Returns a `sqlite3.Connection` with `Row` factory enabled. |
| `initialize_database()` | Creates the `sessions` and `messages` tables if they do not already exist. |
| `create_session()` | Inserts a new session record and returns its UUID. |
| `save_message(session_id, role, content)` | Persists a single message to the `messages` table. |
| `get_session_history(session_id)` | Returns all messages for a session ordered by insertion. |
| `build_gemini_history(session_id)` | Converts stored messages to the format required by the Gemini SDK. |

#### Chat Layer
| Function | Description |
|---|---|
| `start_chat_session(model, session_id)` | Creates a `genai.ChatSession` pre-loaded with persisted history. |
| `run_chat(chat, session_id)` | Main interactive loop that reads user input, calls the API, and persists responses. |

#### UI Helpers
| Function | Description |
|---|---|
| `print_banner()` | Displays the welcome header and list of available commands. |
| `print_history(session_id)` | Prints all messages for the active session to stdout. |

#### Entry Point
| Function | Description |
|---|---|
| `main()` | Orchestrates startup: loads API key, initializes database, configures Gemini, creates session, and starts the chat loop. |

---

## Database Schema

### `sessions`
| Column | Type | Description |
|---|---|---|
| `id` | TEXT (PK) | UUID v4 session identifier |
| `created_at` | TEXT | UTC timestamp in ISO 8601 format |

### `messages`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER (PK) | Auto-incremented row ID |
| `session_id` | TEXT (FK) | Reference to `sessions.id` |
| `role` | TEXT | Either `user` or `model` |
| `content` | TEXT | Message text |
| `created_at` | TEXT | UTC timestamp in ISO 8601 format |

---

## Session Lifecycle

1. The application starts and calls `initialize_database()` to ensure schema exists.
2. `create_session()` inserts a new row in `sessions` and returns its UUID.
3. `start_chat_session()` loads prior messages (if any) from the database and passes them to the Gemini SDK as history context.
4. Each user message is saved before being sent to the API.
5. Each model response is saved immediately after receipt.
6. The session ends when the user types `exit`, `quit`, or sends an interrupt signal (Ctrl+C).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `google-genai` | Official Google Gen AI Python SDK |
| `python-dotenv` | Loads environment variables from `.env` files |
| `pdoc` | Generates HTML API documentation from docstrings |

Install with:

```bash
pip install google-genai python-dotenv pdoc
```

---

## API Documentation Generation

The project uses [pdoc](https://pdoc.dev) to produce HTML documentation automatically
from the Google-style docstrings written in `src/run.py`.  pdoc requires zero
configuration files and renders a clean, searchable HTML page for each module.

### Generate docs — Windows

```cmd
generate_docs.cmd
```

### Generate docs — Linux / macOS

```bash
chmod +x generate_docs.sh
./generate_docs.sh
```

Output is written to `docs/api/`.  Open `docs/api/run.html` in any browser to
browse the full API reference including parameter descriptions, return types, and
error conditions for every function.

---

## In-Session Commands

| Command | Action |
|---|---|
| `exit` / `quit` | Ends the session gracefully |
| `history` | Prints all messages in the current session |
| Ctrl+C | Interrupts the session safely |

---

## Error Handling

- **Missing API key**: Raises `EnvironmentError` immediately at startup with a descriptive message.
- **API communication errors**: Caught per-message inside `run_chat()` so a single failure does not terminate the session.
- **Database errors**: Propagate naturally as `sqlite3` exceptions; the database directory is created automatically if missing.

---

## Extending the Project

- **Multiple models**: Pass an environment variable or CLI argument to override `model_name` in `main()`.
- **Export history**: Query the `messages` table with a session UUID to export conversations to JSON or CSV.
- **Web interface**: Replace `run_chat()` with a FastAPI route that calls `save_message()` and proxies requests to `genai.chats.Chat`.
