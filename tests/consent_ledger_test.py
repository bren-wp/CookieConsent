import importlib.util
import secrets
import sqlite3
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("ledger", Path(__file__).resolve().parent.parent / "tools/consent_ledger.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class LedgerTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "ledger.sqlite3"
        self.options = dict(key=secrets.token_bytes(32), key_id="test", scope="example.org",
                            revision="policy-1", retention_days=30,
                            service_categories={"stats": "analytics"})
        self.ledger = module.ConsentLedger(self.path, **self.options)
        self.token = secrets.token_bytes(32)
        self.choice = dict(necessary=True, preferences=False, analytics=True, marketing=False)

    def record(self, **changes):
        data = dict(request_id=secrets.token_hex(16), kind="decision", categories=self.choice,
                    services={"stats": True}, gpc=False)
        data.update(changes)
        return self.ledger.record(self.token, **data)

    def test_persistence_replay_withdrawal_and_erasure(self):
        request = secrets.token_hex(16)
        event = self.record(request_id=request)
        self.assertEqual(self.record(request_id=request), event)
        with self.assertRaises(ValueError):
            self.record(request_id=request, services={"stats": False})
        reopened = module.ConsentLedger(self.path, **self.options)
        self.assertEqual(reopened.history(self.token)[0]["event_id"], event)
        self.record(kind="withdrawal", categories={**self.choice, "analytics": False}, services={})
        self.assertEqual(len(reopened.history(self.token)), 2)
        self.assertEqual(reopened.history(secrets.token_bytes(32)), [])
        self.assertEqual(reopened.erase_subject(self.token), 2)
        self.assertEqual(reopened.history(self.token), [])

    def test_tamper_and_wrong_key(self):
        self.record()
        with self.assertRaises(ValueError):
            module.ConsentLedger(self.path, **{**self.options, "key": secrets.token_bytes(32)})
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE events SET payload=replace(payload, 'policy-1', 'policy-2')")
        with self.assertRaises(ValueError):
            self.ledger.history(self.token)

    def test_gpc_and_service_validation(self):
        with self.assertRaises(ValueError):
            self.record(gpc=True, categories={**self.choice, "marketing": True})
        with self.assertRaises(ValueError):
            self.record(services={"unknown": True})
        with self.assertRaises(ValueError):
            self.record(categories={**self.choice, "analytics": False})
        self.record(kind="gpc_optout", gpc=True)
        self.assertTrue(self.ledger.history(self.token)[0]["decision"]["gpc"])
        self.assertEqual(self.ledger.purge_expired(), 0)


if __name__ == "__main__":
    unittest.main()
