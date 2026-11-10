#!/usr/bin/env python3
"""Deterministic stdlib-only ZIP packager for CookieConsent by Brendigo.

For identical source bytes and compatible Python/zlib, entry order, timestamps,
permissions, path layout, and ZIP metadata stay stable across builds.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
FIXED_TIME = (2020, 1, 1, 0, 0, 0)


def normalized_zip(destination: Path, members: dict[str, bytes]) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED,
                         compresslevel=9, allowZip64=False) as archive:
        for entry in sorted(members):
            if entry.startswith("/") or ".." in Path(entry).parts or "\\" in entry:
                raise ValueError(f"Unsafe archive member: {entry}")
            info = zipfile.ZipInfo(entry, FIXED_TIME)
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, members[entry],
                             compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def directory_members(source: Path, prefix: str) -> dict[str, bytes]:
    return {
        f"{prefix}/{p.relative_to(source).as_posix()}": p.read_bytes()
        for p in source.rglob("*") if p.is_file() and not p.is_symlink()
    }


def planned_archives() -> dict[str, dict[str, bytes]]:
    standalone = {
        f"standalone/{name}": (ROOT / "packages/core" / name).read_bytes()
        for name in ("brendigo-cookieconsent.js", "brendigo-cookieconsent.css")
    }
    for name, source in {
        "README.md": ROOT / "README.md",
        "INSTALL.hr.md": ROOT / "docs/INSTALL.hr.md",
        "LICENSE": ROOT / "LICENSE",
    }.items():
        standalone[f"standalone/{name}"] = source.read_bytes()
    plugin = directory_members(
        ROOT / "wordpress/brendigo-cookieconsent", "brendigo-cookieconsent"
    )
    plugin["brendigo-cookieconsent/LICENSE"] = (ROOT / "LICENSE").read_bytes()
    wporg = directory_members(DIST / "wporg/brendigo-cookieconsent", "brendigo-cookieconsent")
    if not wporg:
        raise RuntimeError("Build WordPress.org candidate with npm run build:wporg")
    wporg["brendigo-cookieconsent/LICENSE"] = (ROOT / "LICENSE").read_bytes()
    cdn = directory_members(DIST / "cdn" / ("v" + VERSION), "v" + VERSION)
    if not cdn:
        raise RuntimeError("Build the CDN directory with npm run build:cdn first")
    website = {
        p.relative_to(ROOT / "website").as_posix(): p.read_bytes()
        for p in (ROOT / "website").rglob("*")
        if p.is_file() and not p.is_symlink()
    }
    website.update(directory_members(ROOT / "packages/core", "packages/core"))
    website.update(directory_members(ROOT / "demo", "demo"))
    website.update(directory_members(ROOT / "assets/brand", "assets/brand"))
    website.update(cdn)
    website["LICENSE"] = (ROOT / "LICENSE").read_bytes()
    if not website:
        raise RuntimeError("Website source is missing")
    return {
        "cookieconsent-brendigo-standalone.zip": standalone,
        "brendigo-cookieconsent-wordpress.zip": plugin,
        "brendigo-cookieconsent-wordpress-org.zip": wporg,
        "brendigo-cookieconsent-cdn.zip": cdn,
        "cookieconsent-brendigo-website.zip": website,
    }


def verify(destination: Path, members: dict[str, bytes]) -> None:
    with zipfile.ZipFile(destination, "r") as archive:
        actual = {n: archive.read(n) for n in archive.namelist()}
        assert archive.testzip() is None, f"CRC failure: {destination}"
        assert archive.namelist() == sorted(members), "Unsorted ZIP entries"
        assert actual == members, f"ZIP content mismatch: {destination}"
        for info in archive.infolist():
            assert info.date_time == FIXED_TIME, "Nondeterministic timestamp"
    before = hashlib.sha256(destination.read_bytes()).hexdigest()
    normalized_zip(destination, members)
    after = hashlib.sha256(destination.read_bytes()).hexdigest()
    assert before == after, f"Nondeterministic rebuild: {destination}"
    print(destination.name, "SHA-256:", after)


def main() -> None:
    members_by_archive = planned_archives()
    verify_only = len(sys.argv) > 1 and sys.argv[1] == "--verify"
    website_dir = DIST / "website"
    for name, data in members_by_archive["cookieconsent-brendigo-website.zip"].items():
        output = website_dir / name
        output.parent.mkdir(parents=True, exist_ok=True)
        if not output.exists() or output.read_bytes() != data:
            output.write_bytes(data)
    for filename, members in members_by_archive.items():
        destination = DIST / filename
        if not verify_only:
            normalized_zip(destination, members)
        verify(destination, members)


if __name__ == "__main__":
    main()
