# Penny — backlog

Simple backlog for this repo: Open → In progress → Done. Edit by hand or via the
`penny-backlog` skill (`/penny-backlog`).

## Open

- **Swap in the team's own chunked style guide.** `content/style-guide.md` is a condensed version
  of the public guide (voice, mechanics, terminology). Replace it with the real chunked documents,
  update `penny/style-essentials` to match, and regenerate the test set
  (`/penny-test-case-generator`).
- **Fetch the full public style guide.** support.1password.com is blocked in the cloud session
  where Penny was adapted, so the starter content came from a condensed reference. Either allow
  the host, or paste the guide in, to fill the gaps.
- **Decide hosting with engineering: AWS Bedrock or not.** The seams are `lookup.py`
  (`embed()`, `search()`), `ingestion/ingest_style_guide.py`, and `penny.py` (`_chat()`). See
  README → "Moving to AWS Bedrock". Also decide Langfuse Cloud vs self-hosted.
- **Replace the bank account guardrail with a secrets guardrail.** Inherited from Robin. People
  pasting 1Password copy are more likely to paste a real password, Secret Key or API token than
  an IBAN. Keep it a deterministic pattern check, before anything is traced.
- **Let Penny cite its sources.** With look-up on, Penny knows which sections it used. Each
  section has a link (`/help/style-guide#<section>`): add it to the answer.
- **Make the facts-check judge eval look-up aware.** `eval: only rules from the style guide` only
  knows the style essentials, so it can mark correct look-up answers as wrong.
- **Check with legal and security what copy can be pasted** (unreleased features, customer data)
  before a wider rollout: everything goes to OpenAI and Langfuse.
- **Add English language to the PO/CxD dashboard** (`dashboard-kit/`, currently Dutch-only UI).
- **Migrate `dashboard-kit/penny_adapter.py` off the deprecated Langfuse endpoints**
  (`/api/public/traces`, `/api/public/scores`) to `/api/public/v2/observations` and
  `/api/public/v3/scores` before Langfuse removes the old ones.
- **Move to the work repo** when the content and hosting decisions are made.

## In progress

- *(nothing right now)*

## Done

- Adapted Robin (the Nest & Co customer service teaching bot) into Penny, a 1Password writing
  style assistant: new prompts, starter style guide content, landing page and chat widget,
  41-item test set, judge prompts, dashboard topics, docs and skills.
