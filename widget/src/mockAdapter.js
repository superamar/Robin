// Scripted answers for the mockup. Later, this adapter is replaced by one that calls Penny's API.
// The answers follow Penny's system prompt and the style guide, so the mockup behaves like the real bot.

const IBAN = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,4})?\b/i;

const SCRIPT = [
  {
    test: (t) => /ignore|forget your|instructions|system prompt|vergeet je regels|negeer/i.test(t),
    en: "I can't help with that. I can answer questions about the 1Password writing style guide, or review copy against it. What are you working on?",
    nl: "Daarmee kan ik je niet helpen. Ik beantwoord vragen over de schrijfstijlgids van 1Password, of controleer teksten ermee. Waar werk je aan?",
  },
  {
    test: (t) => /oops|couldn't save|please try/i.test(t),
    en: "Three things to fix. \"We couldn't save\" uses \"we\", which implies a person is present – the guide doesn't allow first person plural in UI copy. \"Oops!\" adds emotion and an exclamation point, and \"Please\" isn't needed in instructions. Try: \"The item couldn't be saved. Try again.\"",
    nl: "Drie dingen om aan te passen: \"we\" hoort niet in UI-teksten, \"Oops!\" voegt emotie en een uitroepteken toe, en \"please\" is niet nodig in instructies. Probeer: \"The item couldn't be saved. Try again.\"",
  },
  {
    test: (t) => /log ?in|sign ?in|inloggen/i.test(t),
    en: "Use \"sign in\". \"Sign in to\" a website or service, and \"sign in on\" a device. The guide reserves \"log in\" for Mac and Windows system accounts.",
    nl: "Gebruik \"sign in\": \"sign in to\" een website of dienst, en \"sign in on\" een apparaat. \"Log in\" is alleen voor Mac- en Windows-systeemaccounts.",
  },
  {
    test: (t) => /dash|streepje/i.test(t),
    en: "Use a spaced en dash ( – ) to separate phrases, not an em dash or a hyphen. Try: \"Encrypted at rest and in transit – just like the other apps.\"",
    nl: "Gebruik een en dash met spaties ( – ) om zinsdelen te scheiden, geen em dash of koppelteken.",
  },
  {
    test: (t) => /passkey/i.test(t),
    en: "\"Passkey\" is one word, lowercase. People save a passkey or sign in with a passkey. Don't use \"fill\" with passkeys.",
    nl: "\"Passkey\" is één woord, met een kleine letter. Mensen bewaren een passkey of loggen ermee in. Gebruik \"fill\" niet bij passkeys.",
  },
  {
    test: (t) => /click|tap|klik/i.test(t),
    en: "Use \"select\" instead of \"click\" or \"tap\" – it works on every device. Use \"choose\" when someone picks from several options. Try: \"Select Settings.\"",
    nl: "Gebruik \"select\" in plaats van \"click\" of \"tap\": dat werkt op elk apparaat. Probeer: \"Select Settings.\"",
  },
  {
    test: (t) => /weather|weer|recipe|recept|homework|huiswerk/i.test(t),
    en: "I can only help with writing for 1Password. Is there copy you're working on?",
    nl: "Ik help alleen met schrijven voor 1Password. Werk je aan een tekst?",
  },
];

const DEFAULT = {
  en: "I can answer style questions or review copy. Paste the copy, and tell me where it appears, such as a button, an error, or onboarding.",
  nl: "Ik beantwoord stijlvragen of controleer teksten. Plak de tekst, en vertel waar hij staat, bijvoorbeeld een knop, een foutmelding of onboarding.",
};

const DUTCH = /\b(ik|je|jij|mijn|het|een|niet|wil|kan|tekst|graag|dank|hoe|wat|waarom)\b/i;

function pickAnswer(text) {
  const lang = DUTCH.test(text) ? "nl" : "en";
  const match = SCRIPT.find((entry) => entry.test(text)) ?? DEFAULT;
  return match[lang];
}

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

export const mockPennyAdapter = {
  async *run({ messages, abortSignal }) {
    const last = messages.at(-1);
    const text = (last?.content ?? [])
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ");
    const answer = pickAnswer(text);
    const masked = IBAN.test(text);

    await wait(700, abortSignal); // Penny "thinks" (in the real bot: guardrails + the model)
    const words = answer.split(" ");
    let shown = "";
    for (const word of words) {
      shown = shown ? `${shown} ${word}` : word;
      yield { content: [{ type: "text", text: shown }], metadata: { custom: { masked } } };
      await wait(28, abortSignal);
    }
  },
};
