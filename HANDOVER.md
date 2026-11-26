# Penny — session handover

*Written by the `penny-backlog` skill. Each run replaces this file — it's a snapshot of where
things stand, not a log. For history, see `BACKLOG.md`'s Done section or `git log`.*

## Where things stand (2026-11-26)

Penny was adapted from Robin in this session. Everything that was about the Nest & Co shop is now
about the 1Password writing style guide:

- Prompts (`prompts.py`): Penny's role, the style essentials, guardrails and fallbacks. Langfuse
  prompt names moved from `robin/…` to `penny/…`, so a Langfuse project that ran Robin gets a fresh
  set of `penny/…` prompts on Penny's first run.
- Content: `content/style-guide.md`, starter content condensed from the public guide, one `##`
  section per rule. The shop's handbook, product guide and FAQ are gone.
- Look-up: table `style_guide_chunks`, workflow "Ingest the style guide".
- Page and widget rebuilt (`public/index.html`). Guardrails are now on by default.
- Test set: 41 new items in `experiments/penny-dataset.json`. Judge prompts in `EVALUATORS.md`.
- Settings renamed: `ROBIN_MODEL` → `PENNY_MODEL`, `COURSE_PASSCODE` → `ACCESS_PASSCODE`, tracing
  environment `course` → `pilot`.

The offline tests pass (`python -m pytest tests`). Penny hasn't run against real OpenAI and
Langfuse keys yet: no keys in the cloud session where it was adapted.

## What's not done

See `BACKLOG.md` → Open. The first two: the team's own chunked content, and the hosting decision
(AWS Bedrock) with engineering.

## Handy facts for whoever picks this up

- `.env` holds the real keys. Never commit it. Copy `.env.example` and fill it in; note the
  renamed settings above.
- `dashboard-kit/dashboard-data.json` is generated from Langfuse and gitignored on purpose: it holds
  real people's messages.
