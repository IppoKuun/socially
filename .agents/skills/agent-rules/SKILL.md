---
name: agent-rules
description: Use this skill when the user wants to create, modify, review, move, simplify, or remove agent instructions for this repository. Use it to decide whether a rule belongs in the root AGENTS.md, a local AGENTS.md, an existing skill, a new skill, MCP usage policy, or nowhere. When the request depends on recent Codex, AGENTS.md, skills, MCP, IDE, or configuration behavior, consult Docs MCP first if available; otherwise consult official OpenAI documentation before deciding.
---

# Agent Rules

## Purpose

This skill governs the repository's agent instructions.

Its job is to help maintain a clean, scalable, and correct instruction system for:

- `AGENTS.md`
- local `AGENTS.md` files
- existing skills
- new skills
- MCP usage policy
- related Codex instruction structure

The goal is not to code product features.
The goal is to keep agent rules well placed, non-contradictory, and easy to maintain.

---

## Activation rule

Activate this skill when the user wants to:

- add a new rule
- change an existing rule
- decide where a rule should live
- review the current instruction structure
- remove redundant rules
- split a large instruction file
- decide whether something belongs in `AGENTS.md`, a skill, MCP policy, or nowhere
- verify how Codex instructions should be structured

Once this mode has been explicitly activated in a conversation, keep following it until the user explicitly switches mode or exits it.

Do not activate this skill for:

- normal feature implementation
- normal debugging
- PR review of product code
- routine i18n maintenance
- unrelated coding tasks

---

## Source of truth priority

When making decisions, use this priority order:

1. the current repository files
2. the current agent instruction files
3. the task context from the user
4. recent official OpenAI documentation, only when needed for product behavior or new features

Always inspect the current repository state before proposing structural changes.

Do not assume the instruction structure from memory if the files can be checked directly.

---

## Required inspection behavior

Before recommending a placement for a rule, inspect the current relevant files when available:

- `./AGENTS.md`
- any local `AGENTS.md` files
- `./.agents/skills/**/SKILL.md`
- `./.codex/config.toml` if relevant
- any nearby docs that already define repository conventions

If the repository state is available, do not answer as if the structure were unknown.

---

## Placement decision policy

For every new or changed rule, decide between exactly one of these destinations:

1. root `AGENTS.md`
2. local `AGENTS.md`
3. existing skill
4. new skill
5. MCP usage policy
6. task-specific chat context only
7. do not add it

Choose the narrowest correct scope.

### Root `AGENTS.md`

Use this when the rule is:

- global
- stable
- relevant most of the time
- applicable across the repository

### Local `AGENTS.md`

Use this when the rule is:

- tied to a specific folder, subsystem, or domain
- not useful for the whole repo
- clearer when kept close to the code it governs

### Existing skill

Use this when the rule:

- belongs to an already existing workflow
- should activate only in a specific mode
- naturally extends a current skill without overloading it

### New skill

Use this when the rule:

- defines a distinct repeated workflow
- has a clear trigger
- should not be active all the time
- would bloat `AGENTS.md` if kept there

### MCP usage policy

Use this when the rule is mainly about:

- when to use Notion, Linear, Figma, docs, browser, or other tools
- what to consult first
- when not to use external tools

### Chat context only

Use this when the rule is:

- temporary
- specific to one task
- not worth storing durably in the repository

### Do not add it

Use this when the rule is:

- redundant
- contradictory
- too vague
- too situational
- harmful to clarity

---

## Anti-bloat policy

Protect the repository from instruction sprawl.

- Keep `AGENTS.md` short and durable.
- Do not move workflow-heavy behavior into `AGENTS.md` unless it truly belongs there.
- Do not create a new skill for a one-off preference.
- Do not duplicate the same rule across multiple places unless a short routing reference is justified.
- Prefer one source of truth per behavior.

If a rule already exists in substance, recommend improving or relocating it instead of duplicating it.

---

## Conflict detection policy

Always check for:

- duplicate rules
- contradictory instructions
- inconsistent triggers
- scope mismatch
- rules that belong closer to a subfolder
- skills that overlap too heavily
- rules that are too vague to execute reliably

If there is a conflict, say so clearly.
Do not silently merge contradictory logic.

---

## Clarification policy

If the user's rule is ambiguous, ask only the minimum necessary clarifying questions.

Ask for clarification when the missing detail changes:

- the scope
- the trigger
- the durability
- the target file
- the interaction with an existing skill

If the best placement is still reasonably inferable, state the assumption and proceed.

Do not ask unnecessary questions when a strong default is available.

---

## Official documentation policy

When the request depends on recent or possibly changing Codex behavior, verify it.

This includes topics such as:

- `AGENTS.md` behavior
- skills format or loading behavior
- MCP behavior
- Docs MCP
- IDE extension behavior
- Codex configuration
- new Codex features or terminology

Use this order:

1. Docs MCP, if available
2. official OpenAI documentation
3. otherwise, state uncertainty clearly

Do not rely on unofficial sources for OpenAI product behavior unless the user explicitly asks for that.

---

## Output format

When handling a rule request, answer in this order:

1. **What I understood**
2. **What is missing**, only if needed
3. **Where it should go**
4. **Why**
5. **Exact path**
6. **Ready-to-paste text**
7. **Any conflict or cleanup warning**, if relevant

Be decisive.
Do not stay vague if the best destination is clear.

---

## Editing policy

When proposing new instruction text:

- preserve the user's overall system and conventions
- improve clarity and execution reliability
- reduce ambiguity
- keep wording concise
- avoid unnecessary verbosity
- keep technical identifiers stable when possible

If renaming a skill, section, or rule would significantly improve clarity, recommend it explicitly.

---

## Repository-aware behavior

Because this skill may run inside Codex with access to the current repository:

- prefer decisions grounded in the actual files
- reason from the current structure, not from past conversations alone
- adapt recommendations to what already exists
- treat the repo state as the primary source of context

If the repo structure already supports the new rule cleanly, extend it instead of redesigning everything.

---

## Boundaries

Do not silently switch to:

- guide mode
- debug mode
- self-review mode
- PR review mode
- implementation mode

If the user asks for an agent-rule decision, stay focused on instruction governance.

If the user also wants the change written, provide the exact file path and the text to paste.
