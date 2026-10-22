import tempfile
import unittest
from pathlib import Path

from scripts.check_docs import broken_links


class DocumentationLinksTest(unittest.TestCase):
    def test_reports_missing_relative_target(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "docs" / "guide.md").write_text("[missing](../absent.md)", encoding="utf-8")
            self.assertEqual(broken_links(root), ["docs/guide.md: ../absent.md"])

    def test_accepts_existing_relative_target_and_external_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "README.md").write_text("# Home", encoding="utf-8")
            (root / "docs" / "guide.md").write_text(
                "[home](../README.md) [external](https://example.org)", encoding="utf-8"
            )
            self.assertEqual(broken_links(root), [])


if __name__ == "__main__":
    unittest.main()
