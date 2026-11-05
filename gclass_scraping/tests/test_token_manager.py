import json
import sys
import tempfile
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.token_manager import TokenManager


class TestTokenManager(unittest.TestCase):
    def test_direct_bearer_token(self):
        token = "ya29.a0ARrdaM-mock_token_12345"
        tm = TokenManager(token_str=token)
        self.assertTrue(tm.has_bearer_token())
        self.assertEqual(tm.get_bearer_token(), token)

    def test_load_from_json(self):
        payload = {
            "oauth_bearer_token": "ya29.a0ARrdaM-file_token_xyz",
            "cookies": "SID=abc; HSID=def",
            "wiz_global_data": {
                "snlm0e": "mock_xsrf",
                "f_sid": "123456",
                "authuser": "0"
            },
            "cookie_items": [
                {"name": "SID", "value": "abc", "domain": ".google.com", "path": "/", "secure": True}
            ]
        }
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            json.dump(payload, tmp)
            tmp_path = tmp.name

        try:
            tm = TokenManager(token_file=tmp_path)
            self.assertTrue(tm.has_bearer_token())
            self.assertEqual(tm.get_bearer_token(), "ya29.a0ARrdaM-file_token_xyz")
            self.assertEqual(tm.get_cookie_header(), "SID=abc; HSID=def")
            self.assertEqual(tm.get_wiz_data().get("snlm0e"), "mock_xsrf")
            self.assertEqual(len(tm.cookie_items), 1)

            # Test storage state conversion
            state_tmp = Path(tmp_path).parent / "test_state.json"
            out = tm.sync_to_storage_state(state_tmp)
            self.assertIsNotNone(out)
            self.assertTrue(state_tmp.exists())
            with open(state_tmp, "r", encoding="utf-8") as f:
                state_data = json.load(f)
            self.assertEqual(state_data["cookies"][0]["name"], "SID")
            state_tmp.unlink(missing_ok=True)
        finally:
            Path(tmp_path).unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
