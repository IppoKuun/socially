---
name: task-brief
description: Use this skill only when the user explicitly asks for help preparing an implementation brief before starting a coding task. Use it to help the user fill a structured task template by asking targeted questions, proposing options, clarifying scope, and producing a ready-to-copy brief. Do not use it for direct implementation, PR review, or debugging.
---

# Task Brief

## Purpose

This skill is for preparing a strong implementation brief before coding starts.

The goal is to help the user turn an initial idea into a clear, constrained, ready-to-use task template for a separate implementation conversation.

This skill helps the user think better.
It does not replace the implementation step.

---

## Activation rule

Activate this skill only when the user explicitly asks for:

- help filling a task template
- help preparing a coding brief
- help clarifying scope before implementation
- MODE TASK BRIEF

Once this mode has been explicitly activated in a conversation, keep following it until the user explicitly switches mode or exits it.

Do not activate this skill:

- for direct implementation
- for explanation-first coding help
- for PR review
- for debugging

If the user already wants the code to be written, another mode is more appropriate.

---

## Core behavior

When this skill is active:

- help the user clarify their intent before coding starts
- ask targeted questions only when they improve the brief materially
- propose options when the user's request is still vague
- make missing constraints visible
- help the user choose, not choose everything in their place
- produce a brief that can be copied into a new implementation conversation

This is a framing workflow, not a coding workflow.

---

## Collaboration style

The skill must help, not take over.

Therefore:

- do not silently invent major scope decisions
- do not fill the whole brief blindly if important information is still ambiguous
- do not ask endless open-ended questions
- ask the minimum useful questions to remove ambiguity
- when helpful, propose 2 or 3 concrete options with tradeoffs

If the user already gave enough information for some fields:

- draft those fields directly
- only question the missing or risky parts

---

## Brief template target

The skill should help the user produce a brief shaped like this:

- `Objectif`
- `Contexte`
- `Fichiers à lire en priorité`
- `Exemple existant à suivre`
- `Contraintes`
- `Non-objectifs`
- `Done when`
- `Checks à exécuter`
- `Risques à surveiller`
- `Niveau d’autonomie`
- `Si la tâche est ambiguë: plan d’abord, pas de code`

Do not force every field to be long.
A short precise field is better than vague filler.

Unless the user explicitly wants a broader architecture, the brief should implicitly or explicitly reinforce:

- a simple implementation
- minimal necessary abstraction
- easy rereading
- no helper explosion
- no overkill syntax or file splitting without clear payoff

---

## Question strategy

When information is missing, prefer questions in this order:

1. what exactly should change for the user or the codebase
2. what existing files, flows, or examples should constrain the work
3. what must not be changed
4. how the task will be considered finished
5. what verification is expected
6. how much autonomy the implementation agent should have

Good questions are:

- specific
- short
- decision-oriented
- useful for narrowing scope

Avoid questions that the repository already answers clearly.

---

## Option proposal rule

When the user's initial request could lead to multiple reasonable interpretations:

- say so clearly
- propose a short list of possible directions
- explain the tradeoff of each direction
- ask the user to choose or adjust

Examples of useful option dimensions:

- narrow fix vs representative workflow
- local patch vs broader integration
- implementation now vs planning first
- tests only vs full feature slice

Do not proceed as if one option were chosen if the choice still matters.

---

## Output behavior

The skill should usually move toward a ready-to-copy final brief.

That final brief should:

- be concise
- reflect the user's actual decisions
- avoid invented details unless they were clearly marked as assumptions
- be suitable for a new implementation conversation
- make it easy for the implementation agent to explain the created files afterward in a logical study order when relevant
- remind the implementation agent to prefer the simplest understandable solution when the user did not ask for a broader architecture

When assumptions are still necessary:

- label them explicitly
- keep them minimal

If the user's brief is missing a proportionality constraint and nothing suggests a large design is needed:

- add a concise reminder such as "prefer a simple readable implementation; avoid unnecessary helpers or abstractions"

---

## Boundaries

Do not silently switch to implementation mode.

Do not start editing code from this skill.

If the user changes intent and now wants the code written, say that the brief is ready and that the next step is a new implementation conversation.
