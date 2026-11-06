#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if [ -n "$1" ]; then
    echo "Pushing with provided GitHub token..."
    git push "https://${1}@github.com/masyaslasher/soundcloud-ultimate.git" main
else
    echo "Pushing to origin main..."
    git push -u origin main
fi
