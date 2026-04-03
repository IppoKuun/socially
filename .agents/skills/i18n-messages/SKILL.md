---
name: i18n-messages
description: Use this skill when a task adds, changes, or depends on next-intl translation keys and the messages files must be updated. Use it to detect new or renamed translation keys from useTranslations and t(...) calls, then keep the locale files in the messages folder in sync. Do not use it for feature planning, PR review, or debugging unless the main task is specifically translation-key maintenance.
---

# i18n Messages

## Purpose

This skill handles translation-key maintenance for a project using `next-intl`.

The goal is to:

- detect new or changed translation keys introduced in the code
- update the locale files in the `messages/` folder
- keep locale structures synchronized
- reduce manual translation-file maintenance for the user

This skill is for message-file maintenance, not for teaching i18n theory.

---

## Activation rule

Activate this skill when a task:

- adds new `useTranslations(...)` usage
- adds new `t(...)` calls
- renames translation keys
- introduces new UI text that should live in `messages/`
- requires syncing locale files after UI/content changes

Once this workflow has been explicitly activated in a conversation, keep following it until the user explicitly switches mode or exits it.

Do not activate this skill:

- for general feature planning
- for debugging unrelated runtime issues
- for formal PR review
- when the task has nothing to do with translation keys or locale files

---

## Core behavior

When this skill is active:

- inspect the changed components and files for new or updated translation usage
- identify new keys introduced through `useTranslations(...)` and `t(...)`
- update the relevant files in `messages/`
- keep the locale structure aligned across `fr.json`, `en.json`, and any other existing locale files
- prefer fixing the message files directly instead of only warning about missing keys

Do not make the user manage routine `messages/` updates manually when the intent is clear.

---

## Key detection behavior

Look for translation usage patterns such as:

- `const t = useTranslations(...)`
- `t("...")`
- nested keys such as `t("title.signup")`
- renamed keys
- moved wording that now belongs under a different namespace

When possible:

- infer the intended namespace from the component or feature context
- keep naming consistent with the surrounding translation structure
- preserve existing organization if it is already coherent

---

## Messages folder policy

When updating locale files:

- keep all locale files structurally aligned
- do not add a key in one locale and forget the others
- preserve existing unrelated keys
- avoid unnecessary reordering unless the file is already being reorganized for clarity
- keep nesting coherent and readable
- avoid duplicate semantic keys with slightly different names

If multiple locale files exist, update all relevant ones, not just one.

---

## Translation policy

For `fr.json` and `en.json`:

- write natural, clear UI copy
- prefer concise wording that fits product UI
- keep the tone consistent with the surrounding product text
- preserve placeholders and interpolation variables exactly when present
- preserve semantic meaning, not just literal wording

If the intended text is slightly ambiguous:

- choose the clearest neutral wording supported by the UI context

Do not over-explain the translation choices unless needed.

---

## Naming policy for keys

If the user's proposed key naming is weak, unclear, inconsistent, or misleading:

- you may create a better key name
- keep it consistent with the project structure
- briefly tell the user what key name you used and why it is better

Examples of acceptable reasons:

- clearer meaning
- better namespace consistency
- less ambiguity
- more scalable structure

Do not silently invent a confusing naming scheme.

---

## Noise reduction policy

Do not interrupt the user with routine message-file warnings if the problem can be fixed directly by updating `messages/`.

Do not treat normal missing translation keys as a major discussion topic when the real task is straightforward synchronization.

If there is a larger risk beyond translation maintenance, do not turn this skill into a full debugging or review workflow.

Instead, you may briefly say:

- "N'hésite pas à appeler MODE DEBUG pour vérifier ce flow."
- "N'hésite pas à appeler SELF-REVIEW pour challenger ce flow."

Use that only when the issue goes beyond routine i18n maintenance.

---

## Safety and correctness checks

When updating messages, verify:

- the key path matches the code usage
- placeholders are preserved consistently across locales
- pluralization or variable structure is not broken
- renamed keys are updated coherently
- old keys are not left behind when they clearly became obsolete

Do not create translations that break interpolation syntax.

---

## Scope control

This skill should stay focused on translation-key maintenance.

Do:

- inspect related UI files
- inspect translation usage
- sync locale files
- improve poor key naming if justified

Do not:

- drift into unrelated refactors
- redesign the whole i18n architecture unnecessarily
- start a full code review because of a missing key
- force the user into a debugging workflow for routine i18n updates

Stay practical and efficient.

---

## Preferred behavior when working on code

If the task changes UI copy and introduces new translation usage:

1. inspect the code changes
2. identify the new or changed keys
3. update `messages/` locale files
4. keep locales aligned
5. mention any deliberate key rename briefly if one was made

Prefer direct maintenance over repetitive warnings.

---

## Boundaries

Do not silently switch to:

- guide mode
- debug mode
- self-review mode
- PR review mode

If a broader issue is detected, mention the appropriate mode briefly, but keep this skill focused on i18n messages maintenance.
