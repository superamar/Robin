"""The ingestion pipeline: put the 1Password writing style guide into Penny's content database.

This is the ingestion half of a classic RAG pipeline:

    1. Get the style guide    the 'production' version of the prompt penny/style-guide in Langfuse
                              (or content/style-guide.md if Langfuse can't be reached)
    2. Preprocess             tidy the text: line endings, trailing spaces, extra blank lines
    3. Chunk                  cut it into chunks: one per section (## heading)
    4. Embed                  turn every chunk into an embedding with OpenAI
    5. Store                  replace the old chunks in the content database (Postgres with pgvector)

It runs separately from Penny: start it under Actions > "Ingest the style guide" whenever the style guide
changes. Penny itself only searches the database. The run shows up in Langfuse as one trace,
"Ingestion – style guide", in the environment "ingestion".

Run it locally with:  python ingestion/ingest_style_guide.py
It needs OPENAI_API_KEY and DATABASE_URL, and the Langfuse keys to read the style guide from Langfuse.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv  # noqa: E402

load_dotenv()
os.environ.setdefault("LANGFUSE_TRACING_ENVIRONMENT", "ingestion")

from langfuse import get_client  # noqa: E402
from openai import OpenAI  # noqa: E402

import lookup  # noqa: E402
import prompts  # noqa: E402
import penny  # noqa: E402


def get_style_guide() -> tuple[str, str]:
    """The style guide text and where it came from."""
    if os.getenv("LANGFUSE_PUBLIC_KEY"):
        penny.seed_prompts()  # creates penny/style-guide from content/style-guide.md if it isn't in Langfuse yet
        try:
            prompt = get_client().get_prompt("penny/style-guide", label="production", cache_ttl_seconds=0)
            return prompt.prompt, f"Langfuse prompt penny/style-guide, version {prompt.version}"
        except Exception as error:
            print(f"Could not read penny/style-guide from Langfuse ({error}); using content/style-guide.md")
    return prompts.STYLE_GUIDE, "content/style-guide.md in the repository"


def preprocess(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"


def main(client=None) -> int:
    client = client or OpenAI()
    langfuse = get_client()
    with langfuse.start_as_current_observation(as_type="chain", name="Ingestion – style guide") as run:
        with langfuse.start_as_current_observation(as_type="span", name="1. Get the style guide") as step:
            guide, source = get_style_guide()
            step.update(output=f"{len(guide)} characters", metadata={"source": source})
        print(f"1. Got the style guide from {source}.")

        with langfuse.start_as_current_observation(as_type="span", name="2. Preprocess", input=guide) as step:
            guide = preprocess(guide)
            code, version = lookup.document_info(guide)
            step.update(output=guide, metadata={"document_code": code, "document_version": version})
        print(f"2. Preprocessed {code}, version {version}.")

        with langfuse.start_as_current_observation(as_type="span", name="3. Chunk") as step:
            chunks = lookup.split_into_chunks(guide)
            step.update(output=[{"chunk": n, "section": c.section, "characters": len(c.text), "text": c.text}
                                for n, c in enumerate(chunks, start=1)],
                        metadata={"rule": "one chunk per section (## heading)", "chunks": len(chunks)})
        print(f"3. Cut it into {len(chunks)} chunks: " + ", ".join(c.section for c in chunks) + ".")

        with langfuse.start_as_current_observation(as_type="embedding", name="4. Embed",
                                                   model=lookup.EMBEDDING_MODEL,
                                                   input=[c.section for c in chunks]) as step:
            embeddings, tokens = lookup.embed(client, [c.text for c in chunks])
            step.update(output=f"{len(embeddings)} embeddings of {len(embeddings[0])} numbers each",
                        usage_details={"input_tokens": tokens})
        print(f"4. Made {len(embeddings)} embeddings with {lookup.EMBEDDING_MODEL} ({tokens} tokens).")

        with langfuse.start_as_current_observation(as_type="span", name="5. Store in the content database") as step:
            stored = lookup.store(chunks, embeddings, code, version)
            step.update(output=f"{stored} chunks stored in the table {lookup.TABLE}",
                        metadata={"table": lookup.TABLE, "document_code": code, "document_version": version})
        print(f"5. Stored {stored} chunks in the table {lookup.TABLE}, replacing the previous version.")
        run.update(output=f"{code} version {version}: {stored} chunks in the content database")
    langfuse.flush()
    return stored


if __name__ == "__main__":
    main()
