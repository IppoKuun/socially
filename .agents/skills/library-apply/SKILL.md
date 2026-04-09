---
name: library-apply
description: Use this skill only when the user explicitly asks for a real in-project implementation of a library they are discovering, with the goal of studying reliable production-minded code afterward. Use it to install, configure, and integrate the library directly in the repository with real files, then support the user's later understanding of that implementation. Do not use it for explanation-first teaching, PR review, or debugging an already failing integration unless the user explicitly switches modes.
---

# Library Apply

## Purpose

This skill is for implementation-first learning of a new library.

The goal is to produce a real, clean, reliable example directly in the project so the user can study real code afterward, add their own comments, and reuse the implementation later as a trustworthy reference.

This is not an exercise-first workflow.
This is not a code-dump without explanation either.

---

## Activation rule

Activate this skill only when the user explicitly asks for:

- a real implementation of a library in the current project
- an in-project example they can study afterward
- a production-minded reference implementation for a new library
- MODE LIB APPLY

Once this mode has been explicitly activated in a conversation, keep following it until the user explicitly switches mode or exits it.

Do not activate this skill:

- for explanation-first implementation help
- for exercise-first learning
- for PR review
- for debugging an already failing integration unless the user explicitly wants debugging

If the user wants to write the code themselves with guidance, MODE GUIDE is more appropriate.

---

## Core behavior

When this skill is active:

- do not implement immediately without first proposing implementation options
- implement the library directly in the real codebase only after the user has chosen the target implementation path
- use real project files, folders, and conventions
- prefer a small but production-minded implementation
- keep the code reliable enough to become a future reference for the user
- avoid speculative architecture or overbuilding

The implementation should be good enough that the user can copy the pattern later with confidence.

---

## Implementation-first workflow

Default sequence:

1. inspect the project and identify the most relevant implementation targets
2. present a short list of possible real implementations the user could choose from
3. explain briefly what each option would cover, where it would live, and why it may be a good first reference
4. wait for the user's choice
5. only then install the dependency and any required peer dependencies when needed
6. add any required configuration, initialization, or setup
7. implement the chosen real example in the correct project files
8. verify the result as far as the environment allows
9. explain what was added and which files the user should study first

Do not turn this workflow into a vague abstract tutorial when the user explicitly asked for a real example in the codebase.

---

## Reference marking rule

Files created or substantially introduced as AI learning references for a library should be marked clearly at the top when the file format supports comments.

Preferred marker format:

- `// IA: <library name>` for single-line-comment files such as `ts`, `tsx`, `js`, or `jsx`
- the closest equivalent comment syntax for other comment-friendly file types, such as `/* IA: <library name> */`

Rules:

- keep the marker on the first meaningful line of the file
- use the library or dependency name consistently
- do not break the file format to force the marker
- if the file type does not support comments safely, do not inject an invalid comment; instead mention the file explicitly in the post-implementation explanation as an AI-generated reference

The marker exists so future guidance can quickly point the user toward the right reference file.

---

## Option selection rule

Before any insertion or code modification, the agent must propose implementation options instead of choosing silently.

Each option should briefly state:

- what will be implemented
- which files or area of the project will likely be touched
- why it is a good or limited first example
- how broad or narrow the scope is
- how much of the real library workflow it will expose in the project

Prefer a short actionable list of real project options, for example:

- smallest safe first example
- most realistic production entry point
- narrow test-only or feature-only slice
- representative end-to-end workflow

Do not start editing before the user chooses one of the proposed directions.

If there is only one realistic option, still state that clearly before proceeding rather than silently deciding.

When possible, prefer options that let the user see several real library-specific concerns in one coherent flow, such as:

- setup or configuration
- the main runtime or usage entry point
- one or more real usage sites in the app
- testing, validation, or surrounding integration when relevant

---

## Scope and quality bar

The example must be:

- real
- clean
- proportional
- maintainable
- aligned with the repository structure
- safe to keep as a reference

Prefer:

- the minimal correct setup
- the real file locations the project would actually use
- naming and patterns that will still make sense later
- a representative workflow that exposes the important library-specific moving parts without becoming too broad

Avoid:

- throwaway demo code that does not belong in the repository
- fake examples disconnected from the actual app structure
- broad refactors unrelated to getting the library integrated correctly
- examples so narrow that they hide most of the real library workflow the user needs to understand

---

## Explanation after implementation

After implementing, help the user study the result.

When explaining the generated code:

- point to the exact files that matter most
- explain the role of each file in plain French
- explain the key methods, functions, or config entries the library introduced
- explain why the implementation is structured that way
- explain how the files connect together as one real workflow in the app
- give the user a logical study order for the files rather than only listing them
- explain why that reading order makes sense
- identify which files were created or established as AI-generated reference examples for this library
- tell the user what to comment or annotate to prove understanding when useful

Do not assume that implementation alone is enough.
The explanation phase still matters, but it happens after the real code exists.

The study order should usually move from:

1. setup or configuration
2. main entry point
3. first concrete usage site
4. surrounding helpers, tests, or supporting files

Adapt that order when another sequence would be easier to understand.

After giving the study order:

- accept either of these two validation paths:
- a French explanation of the code line by line or block by block
- technical comments written by the user block by block in the code
- validate whether the chosen explanation format is correct
- point out misunderstandings precisely when the user's explanation or comments are weak or incomplete
- accept both formats as valid ways to prove understanding

Do not treat passive reading as enough.
Require an active proof of understanding before considering the learning step complete.

When the user later comes back to implement a similar case themselves:

- direct them first to the closest AI-generated reference file for that library when one exists
- explain why that file is the right starting point for comparison

---

## Future reuse goal

The produced code should serve as a reusable learning reference.

Therefore:

- prefer stable patterns over clever shortcuts
- keep the implementation readable enough to revisit later
- avoid burying the important library usage behind unnecessary abstraction
- make the first integration a trustworthy model for future similar work

---

## Comments and understanding

If the implementation introduces important patterns, non-obvious setup, or library-specific behavior:

- remind the user that they may either explain the code back in French or add technical comments by block to prove understanding
- encourage the user to ask for a walkthrough of any file they do not fully understand

The objective is not just to have working code.
The objective is to have working code that the user can later read, explain, comment, and reuse.

---

## Notion usage

Use the Notion MCP only when it genuinely helps the user's learning workflow.

If the user explicitly asks to save the learning:

- you may store a reusable note in the `Programmation` knowledge base
- keep the note generic enough to be useful beyond the current file
- summarize the library primitives, setup, and key usage pattern

Do not store the raw project file in Notion.

---

## Boundaries

Do not silently switch to:

- MODE GUIDE
- MODE DEBUG
- PR review mode

If the user changes intent, adapt explicitly.

If a real bug appears after the implementation and the user wants to investigate it, MODE DEBUG may become more appropriate.
