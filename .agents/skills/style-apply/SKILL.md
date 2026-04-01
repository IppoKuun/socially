---
name: style-apply
description: Use this skill only when the user explicitly asks for MODE STYLE APPLY or clearly asks for direct local styling edits. Use it to implement UI styling changes directly in the codebase with Tailwind, minimal markup adjustments, and focused global.css updates when justified. Do not use it for business logic changes, feature work, debugging, or review.
---

# Style Apply

## Purpose

This skill is for direct UI styling implementation.

The goal is to modify the code locally to style the requested page or component while preserving existing logic.

---

## Activation rule

Activate this skill only when the user explicitly asks for:

- MODE STYLE APPLY
- direct local styling edits
- Tailwind-first visual implementation

Do not activate this skill:

- for explanation-first guidance
- for PR review
- for debugging a failing feature
- for feature logic changes

---

## Scope

Only edit files directly involved in the requested UI surface.

In those files, only change:

- Tailwind classes
- className composition related to styling
- minimal markup needed for layout or styling, only when class-only edits are not enough
- `global.css` when reuse or consistency justifies it

Do not change:

- function behavior
- hooks
- data fetching
- auth
- routing
- business logic
- translations unless the user explicitly asks
- unrelated files

If the requested design cannot be implemented without logic changes, say so clearly and stop before crossing that boundary.

---

## Patch-in-place rule

This skill must preserve the existing page and component structure by default.

Priority order:

1. edit existing classes on existing elements
2. add or adjust non-functional styling attributes on existing elements
3. make the smallest possible markup change only if styling is impossible otherwise

Never:

- replace the whole page with a new layout
- delete existing sections just to restyle them
- rewrite a component from scratch for visual reasons alone
- remove existing content, copy, or structure unless the user explicitly asks
- introduce a different design direction than the one already present without explicit instruction

If the current structure is imperfect but still stylable, continue from the existing code instead of starting over.

If a larger structural change would genuinely be required, stop and explain why instead of doing it silently.

---

## Styling policy

Prefer this order:

1. existing Tailwind utilities
2. existing patterns already used in the repo
3. existing `global.css`
4. a small new utility or class in `global.css` if repetition or clarity justifies it

Do not add custom CSS when Tailwind already solves the problem cleanly.

Do not introduce a new library unless the user explicitly asks or the current stack clearly cannot support the requested effect reasonably.

---

## Markup policy

Markup changes are allowed only when needed to:

- fix layout structure
- add wrappers for spacing or positioning
- improve semantic grouping used by the styling

Markup changes must stay local and minimal.

Allowed examples:

- add a wrapper div for spacing, width, or positioning
- add or reorder non-functional classes
- swap a tag when semantics improve and behavior stays identical

Disallowed examples:

- remove major sections
- rebuild the page tree
- move business content across unrelated containers
- change component responsibilities

Do not refactor component structure beyond what the styling actually requires.

---

## Existing codebase respect

Before editing, inspect:

- current UI primitives
- current Tailwind conventions
- existing `global.css`
- existing page structure

Prefer consistency with the current project over inventing a new visual system for one page.

---

## Execution behavior

When this skill is active:

- implement the styling directly
- keep user updates concise and clear
- explain any non-obvious styling choice briefly
- call out tradeoffs if the requested visual conflicts with the existing UI structure
- prefer patching the existing JSX/HTML in place over generating a replacement version

---

## Boundaries

Do not silently expand the task into feature work.

If the user wants a broader redesign, a component refactor, or business behavior changes, say that the request is outside this skill's scope.
