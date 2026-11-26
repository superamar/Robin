import { useState } from "react";
import PennyWidget, { MOCK } from "./PennyWidget.jsx";

const MODELS = ["GPT-6 Sol", "GPT-4.1 mini"];
const EFFORTS = ["none", "low", "medium", "high"];
const MAX_RESULTS = ["1", "3", "5"];

// The guardrails you can switch off, to see what Penny does with the system prompt alone.
const GUARDRAILS = [
  { key: "bank_account", label: "Bank account numbers", off: "Your message goes to the model and Langfuse as typed." },
  { key: "injection", label: "Prompt injection check", off: "Attempts to override Penny's instructions reach Penny." },
  { key: "facts", label: "Facts check", off: "Penny's answer is sent without checking it against the style guide." },
];
// On by default. Switch them off in the settings panel to see what Penny does with the system prompt alone.
const DEFAULT_GUARDRAILS = { bank_account: true, injection: true, facts: true };

function loadGuardrails() {
  try {
    return { ...DEFAULT_GUARDRAILS, ...JSON.parse(load("guardrails", "{}")) };
  } catch {
    return DEFAULT_GUARDRAILS;
  }
}

function load(key, fallback) {
  try {
    return localStorage.getItem(`penny.${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(`penny.${key}`, value);
  } catch {
    /* storage unavailable: settings just aren't remembered */
  }
}

function SettingsPanel({ settings, setSettings }) {
  const [expanded, setExpanded] = useState(false); // collapsed until someone opens it
  const update = (key) => (event) => {
    const value = event.target.value;
    if (key !== "passcode") save(key, value);
    setSettings((current) => ({ ...current, [key]: value }));
  };
  const toggleGuardrail = (key) => (event) => {
    const checked = event.target.checked;
    setSettings((current) => {
      const guardrails = { ...current.guardrails, [key]: checked };
      save("guardrails", JSON.stringify(guardrails));
      return { ...current, guardrails };
    });
  };
  const toggleLookUp = (event) => {
    const checked = event.target.checked;
    save("lookUp", String(checked));
    setSettings((current) => ({ ...current, lookUp: checked }));
  };
  const allOff = GUARDRAILS.every((g) => !settings.guardrails[g.key]);
  return (
    <aside className={`settings ${expanded ? "" : "settings--collapsed"}`} aria-label="Settings">
      <button type="button" className="settings__toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        Settings <span aria-hidden="true">{expanded ? "–" : "+"}</span>
      </button>
      {expanded && (
        <div className="settings__body">
          <label>
            First name or nickname
            <input id="penny-name" value={settings.name} onChange={update("name")} autoComplete="off" />
            <small>Shown in Langfuse, so you can find your own chats.</small>
          </label>
          {!MOCK && (
            <label>
              Passcode
              <input id="penny-passcode" type="password" value={settings.passcode} onChange={update("passcode")} />
            </label>
          )}
          <div className="settings__row">
            <label>
              Penny's model
              <select id="penny-model" value={settings.model} onChange={update("model")}>
                {MODELS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Reasoning effort
              <select id="penny-effort" value={settings.effort} onChange={update("effort")} disabled={settings.model !== "GPT-6 Sol"}>
                {EFFORTS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Prompt label <small>(optional)</small>
            <input id="penny-label" value={settings.promptLabel} onChange={update("promptLabel")} autoComplete="off" placeholder="production" />
            <small>
              Try your own version of Penny's system prompt: save it in Langfuse with this label. Empty means production.
            </small>
          </label>
          <fieldset className="settings__guards">
            <legend>Guardrails</legend>
            {GUARDRAILS.map((g) => (
              <label key={g.key} className="settings__check">
                <input type="checkbox" checked={settings.guardrails[g.key]} onChange={toggleGuardrail(g.key)} />
                <span>
                  {g.label}
                  {!settings.guardrails[g.key] && <small>Off: {g.off}</small>}
                </span>
              </label>
            ))}
            <p className="settings__hint">
              {allOff
                ? "All off: Penny runs on the system prompt alone."
                : "Switch guardrails on and off to compare the answers and the traces."}
            </p>
          </fieldset>
          <fieldset className="settings__guards">
            <legend>Look-up (RAG)</legend>
            <label className="settings__check">
              <input type="checkbox" checked={settings.lookUp} onChange={toggleLookUp} />
              <span>Look things up in the full style guide</span>
            </label>
            <p className="settings__hint">
              {settings.lookUp
                ? "On: Penny searches the full style guide and answers from the sections it finds."
                : "Off: Penny only knows the style essentials in its system prompt."}
            </p>
            <label>
              Max results
              <select id="penny-max-results" value={settings.maxResults} onChange={update("maxResults")} disabled={!settings.lookUp}>
                {MAX_RESULTS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <small>How many style guide sections Penny gets for each message.</small>
            </label>
            <p className="settings__hint">
              <a href="/chunks.html" target="_blank" rel="noopener">
                See the chunks in the content database ↗
              </a>
            </p>
          </fieldset>
          {MOCK && <p className="settings__mock">Preview: Penny's answers are scripted, and these settings have no effect yet.</p>}
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const [settings, setSettings] = useState(() => ({
    name: load("name", ""),
    passcode: "",
    model: load("model", "GPT-6 Sol"),
    effort: load("effort", "medium"),
    guardrails: loadGuardrails(),
    lookUp: load("lookUp", "false") === "true", // off by default: Penny as it was, until you switch it on
    maxResults: load("maxResults", "3"),
    promptLabel: load("promptLabel", ""),
  }));
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="demo-bar" role="note">
        Penny's starter content is condensed from the public 1Password writing style guide.
      </div>

      <header className="site-header">
        <a className="logo" href="#top" aria-label="Penny home">
          Penny
        </a>
        <nav className="site-nav" aria-label="Main">
          <a href="/help/style-guide">Style guide</a>
          <a href="/chunks.html">Content database</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero hero--penny">
          <div className="hero__text">
            <p className="eyebrow">Writing style assistant</p>
            <h1>Write it the 1Password way.</h1>
            <p className="hero__lead">
              Ask Penny how to write something, or paste copy to review against the 1Password writing style guide. Penny quotes the
              words, explains the rule, and suggests a rewrite.
            </p>
            <button type="button" className="btn" onClick={() => setOpen(true)}>
              Ask Penny
            </button>
          </div>
        </section>

        <section className="help" aria-labelledby="help-title">
          <h2 id="help-title">What Penny can do</h2>
          <ul className="help__list">
            <li>
              <b>Answer</b>
              <span>style questions, such as "sign in" or "log in"</span>
            </li>
            <li>
              <b>Review</b>
              <span>buttons, errors, empty states, and onboarding copy</span>
            </li>
            <li>
              <b>Rewrite</b>
              <span>copy so it follows voice, mechanics, and terminology rules</span>
            </li>
            <li>
              <b>Explain</b>
              <span>the reason behind each rule, so it sticks</span>
            </li>
          </ul>
          <p className="help__more">
            Penny can make mistakes. For a definite answer, check the <a href="/help/style-guide">style guide</a> or ask the content
            design team.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <span className="logo logo--small">Penny</span>
        <span>A writing style assistant for 1Password product copy.</span>
      </footer>

      <SettingsPanel settings={settings} setSettings={setSettings} />
      <PennyWidget
        key={sessionId}
        open={open}
        onOpenChange={setOpen}
        onNewConversation={() => setSessionId(crypto.randomUUID())}
        settings={{ ...settings, sessionId }}
      />
    </>
  );
}
