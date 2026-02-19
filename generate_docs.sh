#!/usr/bin/env bash

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pdoc "$SCRIPT_DIR/src/run.py" --output-dir "$SCRIPT_DIR/docs/api"
echo "Documentation generated in docs/api/"
