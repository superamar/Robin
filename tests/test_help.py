import os, sys
from pathlib import Path

os.environ["LANGFUSE_TRACING_ENABLED"] = "false"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import help_pages  # noqa: E402


def test_every_section_has_its_own_link():
    page = help_pages.render("style-guide")
    for anchor in ("mechanics-dashes", "voice-exclamation-points", "terminology-sign-in-and-sign-out"):
        assert f'id="{anchor}"' in page and f'href="#{anchor}"' in page


def test_only_known_documents_are_published():
    assert help_pages.render("internal-notes") is None
    assert "/help/style-guide" in help_pages.index()
