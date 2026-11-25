"""Optional operator-owned SQLite consent evidence store. No HTTP endpoint."""
import hashlib
import hmac
import json
import re
import secrets
import sqlite3
from contextlib import closing
from datetime import datetime, timedelta, timezone

CATEGORIES = ("necessary", "preferences", "analytics", "marketing")
IDENTIFIER = re.compile(r"[A-Za-z0-9._:-]{1,120}")
SERVICE = re.compile(r"[A-Za-z0-9._-]{1,64}")
REQUEST = re.compile(r"[0-9a-f]{32}")


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True,
                      allow_nan=False).encode("ascii")


class ConsentLedger:
    """Trusted backend must handle authentication, origin/CSRF and authorization.

    Use an operator-private directory, a stable secret and explicit retention.
    One scope and key per database; rotation requires a separate migration.
    HMAC authenticates records, not the visitor identity or legal consent.
    """

    def __init__(self, path, *, key, key_id, scope, revision, retention_days,
                 service_categories):
        if not isinstance(key, bytes) or len(key) < 32:
            raise ValueError("A server-owned key of at least 32 bytes is required")
        if not all(isinstance(x, str) and IDENTIFIER.fullmatch(x)
                   for x in (key_id, scope)):
            raise ValueError("Invalid key ID or scope")
        if not isinstance(revision, str) or not 1 <= len(revision) <= 160:
            raise ValueError("Invalid policy revision")
        if type(retention_days) is not int or not 1 <= retention_days <= 3650:
            raise ValueError("Explicit retention days required")
        if not isinstance(service_categories, dict) or len(service_categories) > 24:
            raise ValueError("Invalid service catalog")
        if any(not isinstance(k, str) or not SERVICE.fullmatch(k) or
               v not in CATEGORIES[1:] for k, v in service_categories.items()):
            raise ValueError("Invalid service catalog")
        self.path, self.key = path, key
        self.key_id, self.scope, self.revision = key_id, scope, revision
        self.retention_days = retention_days
        self.service_categories = dict(service_categories)
        with closing(self._connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("CREATE TABLE IF NOT EXISTS metadata (id INTEGER PRIMARY KEY CHECK(id=1), binding TEXT NOT NULL)")
            binding = self._mac(b"binding", canonical([scope, key_id]))
            db.execute("INSERT OR IGNORE INTO metadata VALUES (1, ?)", (binding,))
            if not hmac.compare_digest(db.execute("SELECT binding FROM metadata WHERE id=1").fetchone()[0], binding):
                raise ValueError("Ledger scope or key does not match")
            db.execute("""CREATE TABLE IF NOT EXISTS events (
                event_id TEXT PRIMARY KEY, subject TEXT NOT NULL, request_id TEXT NOT NULL,
                expires_at TEXT NOT NULL, payload TEXT NOT NULL, tag TEXT NOT NULL,
                UNIQUE(subject, request_id))""")
            db.execute("CREATE INDEX IF NOT EXISTS expiry_index ON events(expires_at)")

    def _connect(self):
        db = sqlite3.connect(self.path, timeout=5)
        db.execute("PRAGMA secure_delete=ON")
        return db

    def _mac(self, domain, value):
        return hmac.new(self.key, domain + b"\x00" + value, hashlib.sha256).hexdigest()

    def _subject(self, token):
        if not isinstance(token, bytes) or len(token) != 32:
            raise ValueError("An operator-issued 32-byte random subject token is required")
        return self._mac(b"subject", canonical(self.scope) + b"\x00" + token)

    def _decision(self, kind, categories, services, gpc):
        if kind not in ("decision", "withdrawal", "gpc_optout") or type(gpc) is not bool:
            raise ValueError("Invalid event type or signal")
        if not isinstance(categories, dict) or set(categories) != set(CATEGORIES):
            raise ValueError("Invalid categories")
        if any(type(v) is not bool for v in categories.values()) or not categories["necessary"]:
            raise ValueError("Invalid category choice")
        if (gpc or kind == "gpc_optout") and categories["marketing"]:
            raise ValueError("Marketing must be denied")
        if kind == "gpc_optout" and not gpc:
            raise ValueError("Missing GPC signal")
        if kind == "withdrawal" and any(categories[k] for k in CATEGORIES[1:]):
            raise ValueError("Withdrawal must deny all optional categories")
        if not isinstance(services, dict) or set(services) - set(self.service_categories):
            raise ValueError("Unknown services")
        for sid, value in services.items():
            if type(value) is not bool or (value and not categories[self.service_categories[sid]]):
                raise ValueError("Invalid service choice")
        return {"kind": kind, "categories": dict(categories), "gpc": gpc,
                "services": {sid: services.get(sid, False) for sid in self.service_categories},
                "revision": self.revision}

    def _verified(self, row):
        event_id, subject, request_id, expiry, payload, tag = row
        if not hmac.compare_digest(self._mac(b"event", payload.encode("ascii")), tag):
            raise ValueError("Ledger record integrity failure")
        record = json.loads(payload)
        if (record["event_id"], record["subject"], record["request_id"], record["expires_at"],
                record["scope"], record["key_id"]) != (
                event_id, subject, request_id, expiry, self.scope, self.key_id):
            raise ValueError("Ledger index integrity failure")
        return record

    def record(self, token, *, request_id, kind, categories, services, gpc):
        """Persist a validated event; replay of identical request is idempotent."""
        if not isinstance(request_id, str) or not REQUEST.fullmatch(request_id):
            raise ValueError("Use a random 32-character hexadecimal request ID")
        subject = self._subject(token)
        decision = self._decision(kind, categories, services, gpc)
        now = datetime.now(timezone.utc)
        with closing(self._connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT * FROM events WHERE subject=? AND request_id=?",
                             (subject, request_id)).fetchone()
            if row:
                old = self._verified(row)
                if old["expires_at"] <= now.isoformat():
                    raise ValueError("Expired request replay")
                if old["decision"] != decision:
                    raise ValueError("Conflicting request replay")
                return old["event_id"]
            event_id = secrets.token_hex(16)
            record = {"schema": 1, "event_id": event_id, "subject": subject,
                      "request_id": request_id, "scope": self.scope, "key_id": self.key_id,
                      "recorded_at": now.isoformat(),
                      "expires_at": (now + timedelta(days=self.retention_days)).isoformat(),
                      "decision": decision}
            payload = canonical(record)
            db.execute("INSERT INTO events VALUES (?,?,?,?,?,?)",
                       (event_id, subject, request_id, record["expires_at"],
                        payload.decode("ascii"), self._mac(b"event", payload)))
            return event_id

    def history(self, token):
        """Verify and return non-expired evidence for one authorized subject."""
        subject = self._subject(token)
        now = datetime.now(timezone.utc).isoformat()
        with closing(self._connect()) as db:
            rows = db.execute("SELECT * FROM events WHERE subject=? ORDER BY rowid",
                              (subject,)).fetchall()
        return [r for r in map(self._verified, rows) if r["expires_at"] > now]

    def purge_expired(self):
        """Operator-scheduled retention job; backups need separate retention."""
        now = datetime.now(timezone.utc).isoformat()
        with closing(self._connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            rows = db.execute("SELECT * FROM events").fetchall()
            ids = [(r["event_id"],) for r in map(self._verified, rows)
                   if r["expires_at"] <= now]
            db.executemany("DELETE FROM events WHERE event_id=?", ids)
            return len(ids)

    def erase_subject(self, token):
        """Authorized rights workflow only; operator determines legal retention."""
        subject = self._subject(token)
        with closing(self._connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            for row in db.execute("SELECT * FROM events WHERE subject=?", (subject,)):
                self._verified(row)
            return db.execute("DELETE FROM events WHERE subject=?", (subject,)).rowcount

    def checkpoint(self, *, anchor_key):
        """Export an authenticated snapshot digest for independent custody.

        The caller must retain the newest checkpoint outside this database.
        This does not establish freshness or automatically guard subsequent writes.
        """
        if not isinstance(anchor_key, bytes) or len(anchor_key) < 32 or hmac.compare_digest(anchor_key, self.key):
            raise ValueError("A separate independent anchor key is required")
        with closing(self._connect()) as db:
            db.execute("BEGIN")
            binding = db.execute("SELECT binding FROM metadata WHERE id=1").fetchone()
            if not binding or not hmac.compare_digest(binding[0], self._mac(b"binding", canonical([self.scope, self.key_id]))):
                raise ValueError("Ledger binding integrity failure")
            digest = hashlib.sha256()
            count = 0
            for row in db.execute("SELECT rowid, * FROM events ORDER BY rowid"):
                self._verified(row[1:])
                digest.update(canonical(list(row)) + b"\n")
                count += 1
            payload = {"schema": 1, "scope": self.scope, "key_id": self.key_id,
                       "count": count, "digest": digest.hexdigest()}
            tag = hmac.new(anchor_key, b"bcc-anchor-v1\x00" + canonical(payload), hashlib.sha256).hexdigest()
            return {"payload": payload, "tag": tag}

    def verify_checkpoint(self, expected, *, anchor_key):
        """Reject deletion, reordering, addition or rollback against trusted snapshot."""
        try:
            actual = self.checkpoint(anchor_key=anchor_key)
            return hmac.compare_digest(canonical(actual), canonical(expected))
        except (ValueError, TypeError, sqlite3.Error, KeyError, UnicodeError):
            return False
