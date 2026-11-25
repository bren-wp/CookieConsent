import io
import json
import secrets
import tempfile
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
from consent_ledger import ConsentLedger
from consent_ledger_api import make_app


class ApiTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.ledger = ConsentLedger(Path(temp.name) / "ledger.db", key=secrets.token_bytes(32),
                                    key_id="test", scope="example.org", revision="v1",
                                    retention_days=30, service_categories={})
        self.key = secrets.token_hex(32)
        self.app = make_app(self.ledger, api_key=self.key)
        self.token = secrets.token_hex(32)
        self.data = dict(subject_token=self.token, request_id=secrets.token_hex(16),
                         revision="v1", kind="decision", gpc=False, services={},
                         categories=dict(necessary=True, preferences=False,
                                         analytics=False, marketing=False))

    def call(self, data=None, **overrides):
        raw = json.dumps(self.data if data is None else data).encode()
        env = dict(PATH_INFO="/v1/events", REQUEST_METHOD="POST",
                   HTTP_AUTHORIZATION="Bearer " + self.key,
                   CONTENT_TYPE="application/json", CONTENT_LENGTH=str(len(raw)))
        env["wsgi.input"] = io.BytesIO(raw)
        env.update(overrides)
        status = []
        body = b"".join(self.app(env, lambda s, h: status.append(s)))
        return status[0], json.loads(body)

    def test_authenticated_idempotent_ingestion(self):
        first = self.call()
        self.assertEqual(first[0], "200 OK")
        self.assertEqual(self.call(), first)
        self.assertEqual(len(self.ledger.history(bytes.fromhex(self.token))), 1)
        self.assertEqual(self.call(HTTP_AUTHORIZATION="Bearer wrong")[0], "401 Unauthorized")
        self.assertEqual(self.call(HTTP_ORIGIN="https://example.org")[0], "403 Forbidden")
        self.assertEqual(self.call(CONTENT_LENGTH="100000")[0], "413 Payload Too Large")
        self.assertEqual(self.call(REQUEST_METHOD="GET")[0], "405 Method Not Allowed")

    def test_reject_unknown_fields_revision_and_gpc_conflict(self):
        self.assertEqual(self.call({**self.data, "ip": "192.0.2.1"})[0], "400 Bad Request")
        self.assertEqual(self.call({**self.data, "revision": "old"})[0], "400 Bad Request")
        choice = {**self.data["categories"], "marketing": True}
        self.assertEqual(self.call({**self.data, "categories": choice}, HTTP_SEC_GPC="1")[0], "400 Bad Request")
        self.assertEqual(self.ledger.history(bytes.fromhex(self.token)), [])

    def test_api_key_rotation_overlap_and_retirement(self):
        previous = secrets.token_hex(32)
        self.app = make_app(self.ledger, api_key=self.key, previous_api_key=previous)
        self.assertEqual(self.call(HTTP_AUTHORIZATION="Bearer " + previous)[0], "200 OK")
        self.assertEqual(self.call()[0], "200 OK")
        self.app = make_app(self.ledger, api_key=self.key)
        self.assertEqual(self.call(HTTP_AUTHORIZATION="Bearer " + previous)[0], "401 Unauthorized")
        self.assertEqual(self.call()[0], "200 OK")


if __name__ == "__main__":
    unittest.main()
