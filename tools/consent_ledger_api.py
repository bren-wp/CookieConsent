"""Private server-to-server WSGI ingestion adapter; not a public visitor API.

Deploy behind an authenticated HTTPS reverse proxy with request/time limits.
The calling application owns visitor authorization, CSRF, policy and token issuance.
No default server, public CORS, automatic runtime transmission or read endpoint.
"""
import hmac
import json
import re

MAX_BODY = 8192
TOKEN = re.compile(r"[0-9a-f]{64}")
FIELDS = {"subject_token", "request_id", "kind", "categories", "services", "gpc", "revision"}


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON key")
        result[key] = value
    return result


def make_app(ledger, *, api_key, previous_api_key=None):
    # Explicit two-key overlap permits a bounded deployment rotation. The
    # operator must remove the previous credential after callers migrate.
    if not isinstance(api_key, str) or not TOKEN.fullmatch(api_key):
        raise ValueError("A random 32-byte hexadecimal API key is required")
    if previous_api_key is not None and (
        not isinstance(previous_api_key, str) or not TOKEN.fullmatch(previous_api_key)
        or hmac.compare_digest(api_key, previous_api_key)
    ):
        raise ValueError("Invalid previous API key")
    expected = tuple(("Bearer " + key).encode("ascii")
                     for key in (api_key, previous_api_key) if key is not None)

    def app(environ, start_response):
        def response(status, body):
            data = json.dumps(body, separators=(",", ":")).encode("utf-8")
            start_response(status, [("Content-Type", "application/json"),
                                   ("Cache-Control", "no-store"),
                                   ("X-Content-Type-Options", "nosniff"),
                                   ("Content-Length", str(len(data)))])
            return [data]

        if environ.get("PATH_INFO") != "/v1/events":
            return response("404 Not Found", {"error": "not_found"})
        if environ.get("REQUEST_METHOD") != "POST":
            return response("405 Method Not Allowed", {"error": "method_not_allowed"})
        # Browser requests must not reach this service; no CORS support.
        if environ.get("HTTP_ORIGIN"):
            return response("403 Forbidden", {"error": "server_only"})
        supplied = environ.get("HTTP_AUTHORIZATION", "")
        try:
            supplied_bytes = supplied.encode("ascii") if isinstance(supplied, str) else b""
        except UnicodeError:
            supplied_bytes = b""
        valid = False
        for candidate in expected:
            valid |= hmac.compare_digest(supplied_bytes, candidate)
        if not valid:
            return response("401 Unauthorized", {"error": "unauthorized"})
        if environ.get("CONTENT_TYPE", "").split(";", 1)[0].strip().lower() != "application/json":
            return response("415 Unsupported Media Type", {"error": "content_type"})
        try:
            length = int(environ.get("CONTENT_LENGTH", ""))
        except (TypeError, ValueError):
            return response("400 Bad Request", {"error": "content_length"})
        if not 1 <= length <= MAX_BODY:
            return response("413 Payload Too Large", {"error": "body_size"})
        try:
            raw = environ["wsgi.input"].read(length)
            if len(raw) != length:
                raise ValueError("Incomplete body")
            payload = json.loads(raw.decode("utf-8"), object_pairs_hook=unique_object)
            if not isinstance(payload, dict) or set(payload) != FIELDS:
                raise ValueError("Invalid fields")
            subject = payload.pop("subject_token")
            revision = payload.pop("revision")
            if revision != ledger.revision or not isinstance(subject, str) or not TOKEN.fullmatch(subject):
                raise ValueError("Invalid revision or token")
            # The trusted caller must forward the visitor's GPC decision;
            # this internal endpoint is not itself the visitor-facing origin.
            if environ.get("HTTP_SEC_GPC") == "1":
                payload["gpc"] = True
            event = ledger.record(bytes.fromhex(subject), **payload)
        except (ValueError, TypeError, KeyError, RecursionError):
            return response("400 Bad Request", {"error": "invalid_or_conflicting_event"})
        except Exception:
            # Never disclose database paths, subject tokens or exception text.
            return response("503 Service Unavailable", {"error": "ledger_unavailable"})
        return response("200 OK", {"event_id": event})

    return app
