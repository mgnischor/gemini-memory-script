# Gemini Memory Script

A command-line chat application that connects to the Google Gemini API and stores the full conversation history in a local SQLite database.

---

## Features

- Real-time interactive chat powered by Google Gemini
- Persistent chat history stored in a local SQLite database
- Each conversation is tracked as a unique session with a UUID
- Cross-platform launchers for Windows (`run.cmd`) and Linux/macOS (`run.sh`)
- Minimal dependencies, no external database server required

---

## Requirements

- Python 3.10 or higher
- A valid [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mgnischor/gemini-memory-script.git
cd gemini-memory-script
```

2. Install the required Python packages:

```bash
pip install google-genai python-dotenv pdoc
```

3. Create a `.env` file in the project root with your API key:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## Usage

### Windows

```cmd
run.cmd
```

### Linux / macOS

```bash
chmod +x run.sh
./run.sh
```

### Direct Python execution

```bash
python src/run.py
```

---

## In-Session Commands

| Command | Description |
|---|---|
| Any text | Sends a message to Gemini and prints the response |
| `history` | Displays all messages in the current session |
| `exit` or `quit` | Ends the session and saves all data |
| Ctrl+C | Safely interrupts the session |

---

## Project Structure

```
gemini-memory-script/
├── src/
│   └── run.py              # Main application
├── database/               # Created automatically at runtime
│   └── chat_history.db     # SQLite database
├── docs/
│   ├── api/                # Generated HTML docs (pdoc)
│   └── documentation.md    # Technical documentation
├── .env                    # API key (not committed to git)
├── generate_docs.cmd       # Windows docs generator
├── generate_docs.sh        # Linux/macOS docs generator
├── run.cmd                 # Windows launcher
├── run.sh                  # Linux/macOS launcher
└── README.md
```

---

## Generating API Documentation

This project uses [pdoc](https://pdoc.dev) to generate HTML documentation directly from the source code docstrings.

### Windows

```cmd
generate_docs.cmd
```

### Linux / macOS

```bash
chmod +x generate_docs.sh
./generate_docs.sh
```

The output will be written to `docs/api/`. Open `docs/api/run.html` in a browser to browse the full API reference.

---

## Database

All sessions and messages are stored in `database/chat_history.db`, which is created automatically on first run.

**`sessions` table** — one row per application run, identified by a UUID.

**`messages` table** — one row per user or model message, linked to a session, with role and UTC timestamp.

See [docs/documentation.md](docs/documentation.md) for the full schema and architecture details.

---

## License

This project is open source and available under the [MIT License](LICENSE).
