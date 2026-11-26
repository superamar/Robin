# 1Password writing style guide

| | |
|---|---|
| **Document code** | 1P-SG-PUBLIC |
| **Version** | 0.1 |
| **Status** | Starter content |
| **Source** | The public 1Password writing style guide, support.1password.com/style-guide |
| **Scope** | UX and product copy: in-app strings, tooltips, empty states, errors, onboarding |
| **Defers to** | Apple Style Guide, then the New Oxford American Dictionary. This guide wins on conflicts. |
| **Owner** | Content design |
| **Language** | U.S. English |

*Starter content for Penny, condensed from the public guide. Replace it with the team's own chunked documents when they're ready.*

---

## Voice: don't imply a task is easy

Don't imply a task is easy or trivial. Avoid "just" and "simply".

Exception: "just" or "simply" is OK outside task steps, to promote a beneficial option.

- Don't: "Simply sign up on 1Password.com."
- Do: "Sign up on 1Password.com."

## Voice: emotionally neutral language

Use emotionally neutral language. Don't try to make people feel an emotion: let them decide how they feel. Don't use emotional language to mask friction.

- Don't: "Select the Yes, I'd love to subscribe button."
- Do: "Select Subscribe."

## Voice: exclamation points

Don't use exclamation points. If the content is exciting, it will speak for itself.

## Voice: first person plural (we, our, ours)

Don't use "we", "our" or "ours" in UI copy. They imply a person is present. Use them only in personal communications, such as email or community replies, never in the app.

- Don't: "We didn't find this password in the database."
- Do: "The password isn't in the database."

## Voice: negative and condescending language

Avoid negative and condescending framing. Avoid "unfortunately", "sadly", "negligent", "of course", "obviously" and "clearly".

## Voice: placing blame

Don't blame people for errors or negative outcomes. Passive voice is preferred for error states.

- Don't: "You created over 50 conflicts in the file."
- Do: "Over 50 conflicts were found in the file."

## Voice: please

Leave out "please" in instructions. Clear writing is more respectful than adding "please" to every line.

## Voice: preemptive apologies

Don't apologize for problems that haven't happened, and don't mention limitations preemptively.

- Don't: "For security reasons, 1Password doesn't support every Markdown feature, but we hope you'll like what's supported."
- Do: "The supported Markdown syntax makes it easy to add style and structure to your notes."

## Voice: wants and needs (should, could, you'll want to)

Don't tell people what they want, should or could do. State the fact. Avoid "you'll want to", "you should" and "you could".

Exception: use "need" only when someone factually must do something to proceed.

- Don't: "You'll want to sign in to your account on 1Password.com."
- Do: "Sign in to your account on 1Password.com."

## Voice: contractions

Use contractions.

Exception: don't use negative contractions (can't, won't) when warning about destructive or irreversible actions.

- Don't (destructive context): "You can't undo this action."
- Do (destructive context): "You cannot undo this action."

## Mechanics: abbreviations

Don't use internal or Latin abbreviations in product copy.

- Internal abbreviations to avoid: 1P, AG, AGK, B5, MAS, NM, OP, OPA, XAM.
- Latin abbreviations to avoid: e.g., i.e., etc.
- Use instead: "for example", "as in", "and more".

## Mechanics: UI verbs for buttons and controls (select, choose)

Use "select" when telling someone to interact with a specific element. Use "choose" when they pick from multiple options. Avoid "click" and "tap": "select" works on every device.

- Don't: "Click Settings."
- Do: "Select Settings."
- Do: "Select All Vaults, then choose a vault."

## Mechanics: capitalization

Don't use capitalization for emphasis. Most common nouns are lowercase, such as vault, team and item. Proper product names are capitalized, such as Emergency Kit, Secret Key and Watchtower.

## Mechanics: serial comma

Use a serial (Oxford) comma in lists of three or more items.

- Don't: "Save passwords, fill addresses and more."
- Do: "Save passwords, fill addresses, and more."

## Mechanics: dashes

Use a spaced en dash ( – ) to separate phrases. Don't use em dashes or hyphens as separators.

- Don't: "Encrypted at rest and in transit—just like the other apps."
- Do: "Encrypted at rest and in transit – just like the other apps."

## Mechanics: headers

Use sentence-style capitalization for all headers and section titles.

## Mechanics: words ending in -ing

Avoid words ending in -ing wherever a strong verb or descriptive phrase works instead. "-ing" forms are ambiguous and harder to localize.

- Don't: "Signing in on a new device"
- Do: "Sign in on a new device"

## Mechanics: links

Use descriptive link text. Never use "click here", "here" or "learn more" as the full link text.

## Mechanics: numbered lists

Use numbered lists only for steps that must be followed in order.

## Mechanics: bulleted lists

Use bulleted lists for parallel information, or for steps that can be done in any order. Introduce the list with a sentence and a colon. Capitalize the first word of each item.

## Mechanics: quotation marks

Place punctuation outside quotation marks, unless you're quoting a person directly.

## Mechanics: spelling

Use U.S. English in all product copy.

## Terminology: preferred terms

| Use this | Instead of | Notes |
|---|---|---|
| select | click, tap, press | Device-agnostic. For interacting with a specific UI element. |
| choose | select | Only when picking from multiple options. |
| enter | type | Covers all input methods. Use "type" only for physical keyboard input. |
| turn on, turn off | enable, disable | |
| make sure | ensure | "Ensure" is overly formal. |
| to | in order to | |
| after | once | "Once" implies conditionality. Don't: "Once you open 1Password…" Do: "After you open…" |
| about | around | When referring to a topic. |
| because | since | Use "since" only for time relationships, not causation. |
| appear, show, see | display, load | |
| open | launch, run | For apps, files and folders. |

## Terminology: sign in and sign out

Use "sign in" instead of "log in" or "login" (as a verb), and "sign out" instead of "log out".

- "Sign in to" websites and services. "Sign in on" devices.
- Reserve "log in" and "log out" for Mac and Windows system accounts only.

## Terminology: passkey

"Passkey" is one word, lowercase. People "save" a passkey or "sign in with" a passkey. Don't use "fill" with passkeys.

## Terminology: two-factor authentication and one-time password

- Use "two-factor authentication", lowercase and hyphenated, instead of 2FA or MFA.
- Use "one-time password", lowercase and hyphenated, instead of TOTP.

## Terminology: generate

Avoid "generate". Use "create" or "suggest" instead.

- Don't: "Generate a password."
- Do: "Create a strong password."

## Terminology: add and remove

"Add" and "remove" are ambiguous. Use the specific verb:

- Account: sign in, sign out
- Team member: invite, remove
- Vault access: share a vault, stop sharing
- Item: create, delete, move to Archive
- Device: set up another device, deauthorize

## Terminology: user

Avoid "user" as a noun or adjective. Use "person", "team member" or "family member" instead. Don't say "user account".

## Terminology: fill and autofill

- "Fill" is what 1Password does with information on pages. For what a person puts in, use "enter".
- "autofill" (verb) is lowercase.
- "Autofill" (noun) is the capitalized 1Password feature.

## Terminology: vault, lock and unlock

- Don't use "your vault" generically.
- Capitalize specific vault names, such as Finance vault or Shared vault.
- People lock 1Password, and 1Password can lock itself. Don't say "lock your vault".
- People unlock 1Password. 1Password doesn't unlock itself. Don't say "unlock your vault".

## Terminology: 1Password as a name

- Use "in 1Password" for the app, and "on 1Password.com" for the web.
- Don't use "1Password's", except when referring to 1Password as a company.
- Don't use "AgileBits" in product copy. Use "1Password".

## Terminology: product names (Secret Key, Watchtower, Emergency Kit, Travel Mode)

Always capitalize proper product names:

- Secret Key: always "your Secret Key", never shortened to "key".
- Watchtower: not "Watchtower service" or "1Password Watchtower".
- Emergency Kit: two words.
- Travel Mode: two words.

## Terminology: item type capitalization

Capitalize an item type only when you mean that specific item type, not when you use the word generically:

- Login (item type), but username and password (when filling)
- Password (item type), but password (generic)
- Secure Note (item type), but secure note (generic)
- Credit Card (item type), but credit card details (when filling)
