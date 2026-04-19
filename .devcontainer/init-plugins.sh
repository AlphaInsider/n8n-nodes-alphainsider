#!/bin/bash
set -euo pipefail

if ! command -v claude >/dev/null 2>&1; then
  echo "Error: 'claude' command not found in PATH: $PATH"
  exit 127
fi

if ! command -v agent >/dev/null 2>&1; then
  echo "Warning: 'agent' (Cursor CLI) command not found in PATH: $PATH"
fi

# Always ensure we have the newest Claude Code + plugins
echo "Updating to latest Claude Code version..."
claude update || true

# Update Cursor CLI if available
if command -v agent >/dev/null 2>&1; then
  echo "Updating Cursor CLI (agent)..."
  agent update || true
fi

# Claude Code + Cursor CLI Plugin Installer
# Runs once via postCreateCommand after volumes are mounted.
# Sets up Claude Code with plugins and verifies Cursor CLI ('agent') is available.
# To add a plugin: add its marketplace and install entry below.

# ── Clean slate ──────────────────────────────────────────────
# The config volume may carry paths from a previous build/user.
# Wipe plugin state so installs register with correct paths.
PLUGIN_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/plugins"
rm -f "$PLUGIN_DIR/known_marketplaces.json" \
      "$PLUGIN_DIR/installed_plugins.json"
rm -rf "$PLUGIN_DIR/marketplaces" \
       "$PLUGIN_DIR/cache"

# ── Marketplaces ──────────────────────────────────────────────
claude plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode.git

# ── Plugins (format: plugin@marketplace --scope user) ────────
claude plugin install oh-my-claudecode@omc --scope user

echo "Plugin installation complete."