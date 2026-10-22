#!/usr/bin/env python3
"""Check relative links in Markdown files without third-party dependencies."""

from pathlib import Path
import re
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
LINK = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")


def broken_links(root: Path = ROOT) -> list[str]:
    broken = []
    for markdown in root.rglob("*.md"):
        # ORIGINAL (preserved, not deleted — disabled by comment):
        # if any(part.startswith(".") for part in markdown.relative_to(root).parts):
        #     continue
        if ".git" in markdown.relative_to(root).parts:
            continue
        for target in LINK.findall(markdown.read_text(encoding="utf-8")):
            target = target.strip().split(maxsplit=1)[0].strip("<>")
            if not target or target.startswith(("https://", "http://", "mailto:", "#")):
                continue
            path = unquote(target.split("#", 1)[0].split("?", 1)[0])
            if path and not (markdown.parent / path).exists():
                broken.append(f"{markdown.relative_to(root)}: {target}")
    return broken


if __name__ == "__main__":
    failures = broken_links()
    if failures:
        print("Broken relative Markdown links:", *failures, sep="\n- ", file=sys.stderr)
        raise SystemExit(1)
    print("Relative Markdown links are valid.")
