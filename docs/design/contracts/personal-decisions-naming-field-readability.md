---
room: Personal Decisions — Naming Field
human_activity: Writing the decision and the immediate context in a readable, material field that feels like inscription rather than filling out a software form.
surfaces:
  - app/decisions/new/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-03 — the member's words are the primary material
  - SOULLAB READABILITY — quiet is not the same as small
  - INHABITABLE_ARCHITECTURE_STANDARD — inscription should feel like a room activity, not an administrative form
reference_surfaces:
  - docs/design/contracts/personal-decisions-naming.md
  - docs/design/contracts/journal-room.md
shared_with_house: literary meaning register, interface/orientation register, material paper surface, generous line-height, readable action sizes, and no dark form boxes on a paper field.
distinct_to_room: the Decision naming field holds a concise choice statement and a longer contextual reflection on one continuous warm writing surface.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-10-naming-field-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-10-naming-field-mobile.png
experience_verification: 2026-09-27 authenticated local witness on localhost:3699. The redesigned paper field rendered the choice input at 24px desktop, context writing at 18px, meaningful labels at 14px, the paper note at 17px, Back to Decisions at 16px, and all primary field backgrounds as transparent over the warm paper surface. The placeholder computed at readable dark-on-paper contrast rather than the former muted grey. Mobile retained 22px choice text and 18px contextual writing instead of shrinking below the House reading floor. The phenomenon-first behavior remained unchanged: secondary context stayed hidden until both member-authored fields contained words; saving returned HTTP 200 and caused zero Council consultation POSTs. Temporary member/Decision data was removed with residue zero.
---

# DECISIONS-UX-10 — Naming Field Material + Readability Conformance

## Problem

The first Personal Decision naming candidate had the correct experiential sequence but the primary writing field still read visually like a conventional form:

- a large pale card;
- dark rectangular input/textarea fills;
- small field labels;
- low-contrast placeholder text;
- small supporting copy.

That undermined the room's governing claim that the member's own words are the primary material.

## Ruling

The naming surface is a **writing field**, not a software form panel.

The choice and its context now sit directly on one warm material surface.

Dark form fills are removed.

Focus is indicated by a restrained baseline rather than filling the entire field with interface chrome.

## Field structure

The paper field is now composed of two writing passages:

### The choice

Meaning-bearing title-size writing:

> Do I stay, leave, begin, decline, ask, wait…?

A secondary orientation line may sit beside the label:

> Say the choice as plainly as you can.

### What makes this a real choice now?

A larger reflective writing area asks for what is actually happening.

The orientation text explicitly permits uncertainty rather than asking the member to resolve it before writing.

## Readability law

This surface follows the current House-wide semantic floor:

- choice text: **24px desktop / 22px mobile**;
- contextual writing: **18px**;
- meaningful field labels: **14px**;
- ordinary instructions/supporting copy: **16px minimum**;
- reflective paper note: **17px**;
- navigation/actions: **16px minimum**;
- decorative markers only: **12px**.

The browser's global 16px form rule is deliberately overridden for the two member-writing fields because those fields are the writing surface itself, not generic form controls.

## Contrast

On the paper field:

- member writing is dark, high-contrast ink;
- placeholder text is dark enough to remain readable without becoming primary;
- guidance copy remains readable through contrast and spacing rather than shrinking.

## Behavior unchanged

UX-10 changes no Decision behavior.

It does not change:

- phenomenon-first gating;
- title/context persistence;
- stakes/time/state reveal;
- carried-source provenance;
- Decision creation API;
- Council invocation;
- resolution behavior;
- Decision ownership.

## Exact stop

> **DECISIONS-UX-10 — PASS · NAMING FIELD REDESIGNED AS READABLE MATERIAL WRITING SURFACE · NO BEHAVIOR CHANGE**

The next act remains founder visual witness on the integrated Personal Decisions candidate at localhost:3699 before any promotion toward 3597.