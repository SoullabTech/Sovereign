# Interruption Review

Part of the [Design Review Guides](./README.md) collection — not canon.

## Purpose

Not bugs. Interruptions.

A bug is something that doesn't work. An interruption is something that
works exactly as built, and still takes the member's attention away from
the relationship and puts it on the software. This guide is for finding the
second kind — which passes every functional test and ships anyway.

## Test

For every animation, indicator, transition, notification, auto-correction,
or unrequested movement the interface produces, ask:

- What interrupted?
- Who initiated it?
- Was it invited?
- Could it have remained silent?
- Did it protect the relationship or the software?

## What this catches

This is the review that would have caught, before they shipped:

- a fake typing indicator (performing presence the system doesn't have)
- aggressive auto-scroll (correcting a position the member may have chosen on purpose)
- premature draft clearing (discarding an unfinished thought the member didn't ask to discard)
- misleading loading states (implying progress or certainty that isn't there)

Those share one mistake underneath the four different symptoms: **the
software made itself the center of attention.**

## Rule

An interruption that protects the relationship is invited, brief, and
truthful about what it is. An interruption that protects the software is
none of those things, no matter how smooth the animation is.
