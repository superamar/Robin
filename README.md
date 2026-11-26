# Penny – a 1Password writing style assistant

Penny helps the people who write 1Password's product copy (content designers, designers, product managers and engineers) follow the 1Password writing style guide. Ask Penny how to write something, or paste copy for a review: Penny quotes the words, explains the rule in one sentence, and suggests a rewrite.

Penny is adapted from Robin, a teaching chatbot with guardrails, traces and evals. The architecture is the same:

- **A chat widget** on a simple landing page, built with [assistant-ui](https://www.assistant-ui.com).
- **System prompt:** Penny's role and behavior, written upfront (starting text in `prompts.py`, live text in Langfuse).
- **Input guardrails:** bank account numbers are removed by a pattern check (no LLM), and prompt injection is caught by a small model. The injection check knows that pasted copy often contains commands ("Delete all items") and lets those through.
- **The LLM call:** GPT-6 Sol, with a switch to GPT-4.1 mini for comparison, and a reasoning effort setting.
- **Output guardrail:** a small model checks that every rule Penny states is in the style guide. If not, Penny tries once more, and otherwise says the guide may not cover it.
- **Look-up (RAG):** Penny can search the full style guide in a content database instead of using the short style essentials.
- **Observability:** every message becomes a readable trace in Langfuse.
- **Evals:** LLM-as-a-Judge prompts in `EVALUATORS.md`, and a 41-item test set in `experiments/`.

## Status

- **Content:** starter content condensed from the public 1Password writing style guide (support.1password.com/style-guide), in `content/style-guide.md`. It covers voice and tone, mechanics and terminology for UX copy. Replace it with the team's own chunked documents when they're ready (see "Swapping in your own content" below).
- **Hosting:** runs on Render or Vercel today, with OpenAI and Postgres. A move to AWS Bedrock is being discussed with engineering (see "Moving to AWS Bedrock" below).

## What you need

- An **OpenAI API key** with access to GPT-6 Sol, GPT-6 Luna and GPT-4.1 mini. Set a monthly spending limit in your OpenAI account.
- A **Langfuse project** and its API keys (Settings > API Keys).
- For look-up: a **Postgres database with pgvector** (Render's Postgres works).

## Run Penny on your own computer

You need Python 3.11 or newer.

```bash
python -m venv .venv
source .venv/bin/activate          # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then fill in your keys in .env
python app.py
```

Open http://127.0.0.1:3000 in your browser. In Claude Code, `/penny-start` does all of this for you.

## Deploying

**Render:** create a new Blueprint from this repository. `render.yaml` fills in the settings; Render asks for your OpenAI key, your Langfuse keys and URL, and an access passcode. Render doesn't pick up changes on GitHub automatically: use **Manual Deploy > Deploy latest commit**.

**Vercel:** import this repository as a new project and add the same values as environment variables. `vercel.json` has the rest. Every push is deployed automatically.

The passcode (`ACCESS_PASSCODE`) keeps Penny, and your OpenAI budget, to the people you invite. Leave it empty to switch it off.

## Using Penny

Open the page and select **Ask Penny**, or the chat bubble (bottom right). Try one of the suggestions, or paste your own copy.

The **Settings** panel (bottom left) holds your name (shown in Langfuse, so you can find your own chats), the passcode, the model and reasoning effort, a prompt label, the guardrail switches and the look-up switch. It sits outside the chat widget on purpose, so the widget looks like the real thing.

### Guardrails

All three guardrails are on by default. You can switch each one off in the settings panel: bank account numbers, the prompt injection check and the facts check. With all three off, Penny runs on the system prompt alone, which is useful for comparing answers and traces.

- A switched-off guardrail doesn't appear in the trace tree and gets no score. The turn's metadata lists it under `guardrails_switched_off`.
- Each trace gets one of the tags `guardrails: all on`, `guardrails: some off` or `guardrails: all off`.
- With bank account numbers off, a bank account number goes to OpenAI and Langfuse exactly as typed.

### Your own version of the system prompt (prompt labels)

1. In Langfuse, open `penny/system-prompt` (or `penny/system-prompt-lookup` when look-up is on), change it, and save it as a new version with your own label, for example `draft-2`. Don't move the `production` label.
2. In Penny's settings panel, type the same label under **Prompt label**.

Your chats now use your version; everyone else still gets `production`. The turn's metadata shows which version was used (`system_prompt_used`). Only the system prompt follows the label: the guardrails always use `production`.

### Look-up (RAG)

Switch on **Look things up in the full style guide** in the settings panel. Instead of the short style essentials in its system prompt, Penny then searches the full style guide in a **content database** and answers from the sections it finds. **Max results** sets how many sections Penny gets: 1, 3 or 5. It's off by default, because it needs the database.

**The ingestion pipeline** (`ingestion/ingest_style_guide.py`) puts the style guide into the database. It runs separately from Penny, whenever the guide changes:

1. **Get the style guide:** the `production` version of the prompt `penny/style-guide` in Langfuse (the starting version is `content/style-guide.md`).
2. **Preprocess:** tidy the text.
3. **Chunk:** one chunk per `##` section. Each rule in the starter content is its own section, so each rule is one chunk.
4. **Embed:** turn every chunk into an embedding (OpenAI `text-embedding-3-small`).
5. **Store:** replace the old chunks in the table `style_guide_chunks` (Postgres with pgvector).

Each run shows up in Langfuse as the trace "Ingestion – style guide", in the environment `ingestion`.

With look-up on, a turn shows two extra steps before `3. Penny writes the answer`: `Look-up 1 – rewrite the question into a search query` and `Look-up 2 – search the content database`. To see every chunk in the database, open `/chunks` on Penny's site.

**Setting up the content database (once):**

1. In Render, create a **Postgres** database in the same region as Penny.
2. In Penny's web service, add `DATABASE_URL` with the database's **Internal Database URL**.
3. In GitHub, under **Settings > Secrets and variables > Actions**, add the secret `DATABASE_URL` with the **External Database URL**.
4. Under **Actions > Ingest the style guide**, select **Run workflow**.

Repeat step 4 after every change to the style guide: Penny only knows the version that was last ingested.

### Swapping in your own content

The starter content is one Markdown file with one `##` section per rule. To use the team's own documents:

- **Same pipeline:** replace `content/style-guide.md` (or the `penny/style-guide` prompt in Langfuse) with your own Markdown, keeping one `##` heading per chunk and the metadata table at the top (`Document code` and `Version`). Then run the ingestion again.
- **Already chunked elsewhere:** if the chunks live in another store (such as a Bedrock Knowledge Base), skip the ingestion and point `lookup.search()` at that store instead. See below.
- **Update the style essentials too.** `penny/style-essentials` is the short summary Penny uses when look-up is off, and the facts check uses it too. Keep it in line with the real guide.
- **Update the test set.** `experiments/penny-dataset.json` uses rules from the public guide. `/penny-test-case-generator` in Claude Code can generate new items from your own content.

### Moving to AWS Bedrock

Nothing in Penny is tied to Render or Vercel beyond the hosting files, and the provider-specific code sits in two places:

| What | Where | What changes for Bedrock |
| --- | --- | --- |
| Chunks and search | `lookup.py`: `embed()` and `search()` | Call a Bedrock embedding model, and query a Bedrock Knowledge Base (Retrieve API) or your own vector store. Keep returning `Hit` objects, and `penny.py` doesn't change. |
| Ingestion | `ingestion/ingest_style_guide.py` | With a Bedrock Knowledge Base, Bedrock does the chunking and embedding: this script becomes a sync of the Knowledge Base's data source. |
| Model calls | `penny.py`: `_chat()` | Swap the OpenAI client for Bedrock's (for example the Converse API). Model names are set in `PENNY_MODELS` and the environment variables. |

Langfuse works the same whatever the model provider: the tracing in `penny.py` records each call itself. Langfuse can also be self-hosted on AWS if engineering prefers.

## Reading a trace in Langfuse

Every message becomes **one trace**, named `Penny – chat turn`:

```
Penny – chat turn                                      input: the person's message · output: Penny's final answer
├── 1. Input guardrail – bank account numbers          no LLM: a pattern check
├── 2. Input guardrail – prompt injection               small model
│   └── Injection check (small model)
├── 3. Penny writes the answer                          Penny's model, with the system prompt
├── 4. Output guardrail – facts check                   small model
│   └── Facts check (small model)
├── 5. Penny rewrites the answer                        only if step 4 blocked the answer
└── 6. Output guardrail – facts check on the rewrite    only if step 4 blocked the answer
```

**Every step explains itself.** Click a step and look at its metadata: `layer`, `uses_llm`, `what_it_does`, `if_it_fails`, and for guardrails `result` and `explanation`. The turn itself carries a summary, starting with `outcome` and `what_happened`.

**Seeing when a guardrail hits:**

1. **Warnings.** Every guardrail that blocks, masks or fails is marked as a warning. Filter the traces table on level = WARNING.
2. **Scores.** `guardrail: bank account`, `guardrail: prompt injection` and `guardrail: facts check` sit on their guardrail steps. `outcome` and `user feedback` sit on the turn.
3. **Dashboards.** Chart each guardrail score by value over time in Langfuse.

All traces are sent with the environment `pilot` (`LANGFUSE_TRACING_ENVIRONMENT`), so they stay apart from experiments and ingestion runs.

## Prompts in Langfuse

Penny's prompts live in Langfuse's **Prompt Management**, in the folder `penny/`:

| Prompt | Used by | Variables |
| --- | --- | --- |
| `penny/system-prompt` | Penny's answer (look-up off) | `{{style_essentials}}` |
| `penny/style-essentials` | Filled into the system prompt and the facts check | none |
| `penny/injection-check` | The input guardrail | none |
| `penny/facts-check` | The output guardrail (look-up off) | `{{style_essentials}}` |
| `penny/retry-note` | Tells Penny what to fix | `{{unsupported}}` |
| `penny/style-guide` | The full style guide: the source for ingestion | none |
| `penny/query-rewrite` | Look-up step 1 | none |
| `penny/system-prompt-lookup` | Penny's answer (look-up on) | `{{sources}}` |
| `penny/facts-check-lookup` | The output guardrail (look-up on) | `{{sources}}` |
| `penny/retry-note-lookup` | Retry note (look-up on) | `{{unsupported}}` |

- **The first time Penny runs, it creates these prompts in your Langfuse project** from `prompts.py`, with the label `production`. It never overwrites prompts that already exist.
- **To change a prompt, edit it in Langfuse** and give the new version the label `production`. Penny picks it up within a minute.
- **If Langfuse can't be reached,** Penny falls back to the texts in `prompts.py`.

## Privacy and costs

- Bank account numbers are removed **before** anything is sent to OpenAI or Langfuse. Other personal data and secrets are not: the chat window asks people not to paste passwords, secrets or personal details. Unreleased product copy pasted into Penny is sent to OpenAI and Langfuse, so check with legal and security what's OK to paste before a wider rollout.
- The name typed in the settings panel is stored in Langfuse as the user.
- Each chat is limited to 40 messages (`MAX_MESSAGES_PER_CHAT`) and 2000 characters per message. Set spending limits at OpenAI too.

## Design choices to revisit

- **Starter content.** The style guide is a condensed version of the public guide, not the team's full guide. Expect "the guide doesn't cover that" for anything outside voice, mechanics and terminology.
- **The bank account guardrail** comes from Robin. For 1Password copy, a guardrail that catches real secrets (passwords, Secret Keys, API tokens) in pasted copy may fit better. See `BACKLOG.md`.
- **Fail open vs fail closed.** If the injection check fails, the message is let through. If the facts check fails, the answer is not sent.
- **No citations yet.** With look-up on, Penny knows which sections it used, but doesn't link to them in its answer. Each section has its own link at `/help/style-guide#<section>`, so this is a small next step.

## Changing Penny

- **Prompts:** edit them in Langfuse. The fixed fallback messages and the starting versions of the prompts are in `prompts.py`.
- **Models:** the environment variables `PENNY_MODEL`, `COMPARE_MODEL`, `GUARDRAIL_MODEL` and `GUARDRAIL_EFFORT`.
- **The page and chat widget:** the source is in `widget/`. After changing it, run `npm install` and `npm run build` inside `widget/` to rebuild `public/index.html`. `npm run build:preview` makes a version with scripted answers, for showing the design without keys.
- **Logic and tracing:** `penny.py`.

## Files

New to the code? [`REPO_GUIDE.md`](REPO_GUIDE.md) is a fuller map of the repo, written for content and conversation designers.

| File | What it does |
| --- | --- |
| `app.py` | Penny's API: `/api/chat`, `/api/feedback`, `/help` (the style guide as a page), `/chunks`. Also serves the chat page |
| `penny.py` | One chat turn: guardrails, look-up, the LLM call, and the Langfuse trace |
| `prompts.py` | All the text: system prompts, guardrail prompts, fallback messages |
| `lookup.py` | Look-up (RAG): chunking, embeddings, the content database |
| `content/style-guide.md` | The starter style guide content |
| `ingestion/ingest_style_guide.py` | The ingestion pipeline |
| `help_pages.py` | Shows the style guide as a web page, one link per section |
| `public/index.html` | The landing page with the chat widget (built from `widget/`) |
| `widget/` | Source of the chat widget and the landing page |
| `EVALUATORS.md` | Eval prompts for Langfuse |
| `experiments/` | A 41-item test set and a script that runs Penny on it. See `experiments/README.md` |
| `dashboard-kit/` | A conversation-log dashboard that reads from Langfuse |
| `render.yaml`, `vercel.json` | Hosting settings |
| `tests/` | Offline tests with a fake model (`python -m pytest tests`) |
