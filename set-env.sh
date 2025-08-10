#!/bin/bash

# Set Claude Code environment variables to avoid API token limits
export CLAUDE_MAX_TOKENS=8192
export ANTHROPIC_MAX_TOKENS=8192

echo "✅ Claude Code environment variables set:"
echo "   CLAUDE_MAX_TOKENS=$CLAUDE_MAX_TOKENS"
echo "   ANTHROPIC_MAX_TOKENS=$ANTHROPIC_MAX_TOKENS"

echo ""
echo "To make these permanent, add the following to your shell profile:"
echo "  export CLAUDE_MAX_TOKENS=8192"
echo "  export ANTHROPIC_MAX_TOKENS=8192"
echo ""
echo "For bash: echo 'export CLAUDE_MAX_TOKENS=8192' >> ~/.bashrc"
echo "For zsh:  echo 'export CLAUDE_MAX_TOKENS=8192' >> ~/.zshrc"