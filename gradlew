#!/usr/bin/env sh
set -eu

GRADLE_VERSION="${GRADLE_VERSION:-8.7}"
GRADLE_DIST="${GRADLE_DIST:-bin}"
CACHE_DIR="${GRADLE_INSTALL_DIR:-$PWD/.gradle-dist}"
DIST_NAME="gradle-${GRADLE_VERSION}"
INSTALL_DIR="${CACHE_DIR}/${DIST_NAME}"
GRADLE_BIN="${INSTALL_DIR}/bin/gradle"
ARCHIVE_NAME="${DIST_NAME}-${GRADLE_DIST}.zip"
ARCHIVE_PATH="${CACHE_DIR}/${ARCHIVE_NAME}"
GRADLE_URL="https://services.gradle.org/distributions/${ARCHIVE_NAME}"

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: '$1' is required but was not found in PATH." >&2
    exit 1
  fi
}

prepare_gradle() {
  mkdir -p "$CACHE_DIR"

  if [ ! -x "$GRADLE_BIN" ]; then
    echo "Gradle ${GRADLE_VERSION} not found locally; downloading..." >&2

    if [ ! -f "$ARCHIVE_PATH" ]; then
      if command -v curl >/dev/null 2>&1; then
        curl -fL "$GRADLE_URL" -o "$ARCHIVE_PATH"
      elif command -v wget >/dev/null 2>&1; then
        wget -O "$ARCHIVE_PATH" "$GRADLE_URL"
      else
        echo "Error: either 'curl' or 'wget' is required to download Gradle." >&2
        exit 1
      fi
    fi

    ensure_command unzip
    rm -rf "$INSTALL_DIR"
    unzip -q "$ARCHIVE_PATH" -d "$CACHE_DIR"
    chmod +x "$GRADLE_BIN"
  fi
}

prepare_gradle
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-$PWD/.gradle}"
exec "$GRADLE_BIN" "$@"
