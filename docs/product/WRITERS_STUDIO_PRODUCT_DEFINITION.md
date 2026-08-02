# Writer's Studio — Product Definition

> **Status:** Draft v1. **Authored by Kelly, 2026-08-02.** Recorded verbatim in substance;
> not ratified. This is a **north star, not a specification** — the document every future
> Writer's Studio PR is judged against.
>
> **How to use it:** every slice answers one question — *does this move us toward the
> Canvas-centred Writer's Studio, or merely improve the old manuscript page?*

---

## Purpose

The Writer's Studio is not a manuscript editor.

It is a place where people do the work of writing.

A manuscript is one possible expression of that work. It is not the work itself.

The Studio exists to support the entire creative process — from the first vague intuition to
a finished published book — without requiring the member to leave the same environment.

## The primary object is the Project

The Studio is organized around projects. A project might be: a book · an article · a speech ·
a course · a workshop · a newsletter · a journal · research · a collection of ideas ·
something whose form is not yet known.

The member may have many projects simultaneously. **Projects are first-class citizens.**

## Arrival

Entering the Writer's Studio should never feel like opening a document. It should feel like
entering a creative workspace.

The first question is not *Which manuscript?* The first question is **What are you working on
today?**

- If no project exists: begin something new.
- If several projects exist: continue one of them.

## The Canvas

**The Canvas is the Writer's Studio.** It is not a separate feature. It is the environment
within which all creative work happens. Everything else lives inside it.

The Canvas is calm. It is spacious. It feels like a room rather than software.

## The Canvas contains modes

Modes are different kinds of work. **A mode exists only when the primary human activity
changes** — not because buttons change.

Each mode acts on the same project. Switching modes changes **posture, not destination**.

**Write** — where words are born. The WriterField sits at the centre. Around it are only those
tools that directly support writing: word count · revision status · autosave · Keeps ·
Bring In · focus mode · chapter navigation. *Nothing exists simply because another editor has
it. Everything earns its place by supporting writing.*

**Structure** — changes organization, not wording. Chapters · scenes · sections · arguments ·
flow. The work remains the same work.

**Revise** — compares, remembers, questions, helps the writer decide. **Nothing changes until
the writer chooses.**

**Design** — typography · layout · pages · export · book production. Today's Founder Canvas is
the **embryo** of this mode. Eventually it becomes one mode inside the Writer's Studio rather
than a separate application.

**Publish** — gathers everything needed to produce the finished work. Print · digital ·
metadata · ISBN · exports · distribution.

## One project. One continuity.

Changing modes never changes projects. The project persists. The writing persists. The history
persists. **The member never wonders where the work went.**

## Multiple projects

A writer rarely has only one thing alive. The Studio assumes plurality — books, articles,
talks, essays, research, notes may all coexist.

Returning to the Studio means **returning to one's creative life — not simply reopening a
file.**

## Technical principles

The current persistence substrate survives: autosave · optimistic concurrency · revision
history · Explicit Insertion · Returning State · idempotency · conflict detection.

**These are implementation contracts. They are not the experience.**

## Non-negotiable acceptance criteria

The Writer's Studio must not regress into the previous manuscript page. The previous Working
Draft experience may continue temporarily as an **implementation substrate**. It is not the
finished member experience.

The completed Writer's Studio must present:

- Project selection **before** documents
- Canvas as the primary environment
- WriterField **inside** the Canvas
- Multiple simultaneous projects
- Structure and navigation as first-class parts of the environment
- Import as **one way to begin** — not the defining purpose of the Studio

> No walkthrough or screenshot of the completed Writer's Studio should truthfully be
> describable as: *"It's the same brown page with a better editor."*
> That would mean the implementation succeeded while the product failed.

## Design principle

**Do not confuse preserving the substrate with preserving the experience.**

The persistence architecture, revision system, concurrency model, and continuity mechanisms
should be preserved wherever possible. The sparse manuscript page should not.

The Writer's Studio should feel like entering a place where serious creative work happens —
not like opening a text editor.

---

## Decision rule (operative)

> Never optimize the existing manuscript page into permanence. If a decision makes the old page
> a little better but delays or weakens the Canvas becoming the primary Writer's Studio
> experience, **prefer the Canvas.** Preserve implementation contracts; do not preserve an
> obsolete interaction model.
