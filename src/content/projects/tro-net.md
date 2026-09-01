---
title: tro-net.com
date: 2026-07-01
status: active
summary: Scam and phishing email checker for people 60 and up.
stack:
  - Next.js
  - TypeScript
  - Postgres (Neon)
  - Drizzle ORM
  - Inngest
  - Postmark
  - Stripe
  - Sentry
links:
  - label: site
    url: https://tro-net.com
---

My parents kept forwarding me suspicious emails asking whether they were real. The
answer shouldn't depend on whether their daughter picks up the phone.

A user forwards a suspicious email to a personal address and gets a reply within
minutes: a one-word verdict — safe, suspicious, or likely scam — plus two or three
plain-English reasons, so they build intuition over time instead of just being told
what to think. Verified contact details in the reply are looked up server-side from a
curated allowlist, never taken from the suspicious email.

Written for an audience of 60+. No jargon: the words "AI", "algorithm", and "model"
appear nowhere in any user-facing surface. Big type, high contrast, every phone number
a `tel:` link. The product will never call the user, ever — that's enforced in code,
not just policy.

## Safety engineering

The interesting constraint is that the classifier reads hostile input and its output
goes to someone predisposed to trust it. So the classifier is structurally incapable of
surfacing a phone number: it emits an organization slug, and a server-side resolver
looks that up in a curated allowlist. A runtime belt drops any phone- or URL-shaped
string that slips through; if that strips every reason, the reply degrades to a hedged
verdict telling the user to look the company up themselves.

Forwarded content is wrapped in untrusted-body tags with prompt-injection defenses,
invisible Unicode stripped, and length-capped against running up a token bill. A single
outbound gate enforces loop prevention (RFC 3834), suppression lookups, and per-thread
reply caps.

## Scope

I built and own all of it: the classifier pipeline and safety belts, the email
machinery (thread resolution, RFC 5322 threading, suppression, sender allowlist), the
marketing site, Stripe billing with gifting and referral credits, and the business
itself — LLC formation, USPTO trademark filing, policy drafting, and outreach to senior
centers and libraries.

Closed source.
