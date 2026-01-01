#!/bin/bash
# Interactive Todo CLI Launcher
# Task-ID: Helper Script

echo "Starting Interactive Todo CLI..."
echo ""

# Check if colorama is installed
if ! python3 -c "import colorama" 2>/dev/null; then
    echo "Installing colorama..."
    pip3 install colorama
    echo ""
fi

# Run the application
PYTHONPATH=src python3 -m todo_cli.main
