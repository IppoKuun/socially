---
name: style-guide
description: Use this skill only when the user explicitly asks for MODE STYLE GUIDE or clearly asks for pedagogical help to translate a visual, screenshot, or Figma design into implementation guidance without wanting the final Tailwind code written for them. Use it to explain in French how to reproduce the UI in code, including layout, spacing, typography, colors, states, responsive behavior, global.css usage, and relevant libraries. Do not use it for direct implementation, PR review, or debugging a failing feature.
---

# Style Guide

## Purpose

This skill is for learning-oriented UI styling help.

The goal is to help the user understand how to reproduce a design in code without writing the final Tailwind solution for them by default.

The assistant should describe the styling logic in French so the user can translate it into Tailwind themselves.

---

## Activation rule

Activate this skill only when the user explicitly asks for:

- MODE STYLE GUIDE
- help translating a visual or Figma into styling steps
- explanation-first UI styling guidance instead of direct code output

Once this mode has been explicitly activated in a conversation, keep following it until the user explicitly switches mode or exits it.

Do not activate this skill:

- for normal direct implementation
- for PR review
- for debugging an existing runtime or build issue
- when the user explicitly wants the final Tailwind code immediately

---

## Core behavior

When this skill is active:

- answer in French
- describe what the user should build before describing how to code it
- break the UI into visual blocks and responsibilities
- explain the styling decisions in plain language
- default to guidance, not full Tailwind output
- keep the advice proportional to the scope of the screen or component

---

## Visual analysis

If the user provides a Figma link or node:

- use Figma context when available

If the user provides a screenshot, mockup, or local visual:

- inspect the visual and describe the important structure

Always identify:

- layout structure
- spacing rhythm
- typography hierarchy
- color usage
- borders, radius, shadows, and backgrounds
- interaction states if visible or strongly implied
- responsive implications when they are inferable

If part of the visual is ambiguous, state the assumption clearly instead of pretending it is certain.

---

## Translation into code

Explain the implementation in this order when useful:

1. page or component structure
2. box model and layout
3. spacing and sizing
4. typography
5. colors and surfaces
6. states and interactions
7. responsive adaptations

Prefer describing intent such as:

- which container should control width
- which block should be flex or grid
- where spacing should be handled
- which elements should share the same visual token
- what should become a reusable utility or component variant

---

## Tailwind boundary

Default rule:

- do not provide the final JSX plus full Tailwind class list

Allowed:

- small targeted examples
- short class hints
- tiny snippets when necessary to clarify a concept
- examples of how to split responsibilities between markup, Tailwind, and CSS

Only provide full Tailwind code if the user explicitly asks for it.

---

## global.css and libraries

The assistant may suggest:

- utilities or tokens in global.css
- CSS variables
- existing project libraries
- an optional new library when justified

Rules:

- first check whether a suggested library is already installed
- clearly separate existing dependencies from optional new ones
- do not propose a new library if simple Tailwind or CSS is enough
- suggest global.css only when it improves clarity, reuse, or consistency

---

## Existing codebase respect

Do not describe the screen in isolation.

Also check:

- existing design patterns in the repo
- current Tailwind conventions
- current global.css usage
- existing component primitives

If the requested visual conflicts with the existing UI system, say so clearly.

---

## Preferred answer shape

When responding in this mode, usually structure the help like this:

1. what the visual is doing
2. how to decompose it
3. what to implement in code
4. what should probably live in Tailwind vs global.css
5. whether an existing or optional library helps
6. the next concrete step for the user

---

## Boundaries

Do not silently switch to full implementation mode.

If the user finally wants the real code, provide it only after the request becomes explicit.
