# Soullab Privacy Policy

**Effective date:** February 23, 2026
**Last updated:** February 23, 2026
**Applies to:** Soullab websites, apps, and services, including the MAIA consciousness platform, AIN engine APIs, and applications hosted by Soullab for third parties (collectively, "Soullab," "we," "us").

---

## 1. Plain-English Summary

- We collect information you provide, information your device/browser shares, and information generated when you use Soullab (including AI outputs and logs).
- We use that data to run the service, keep it secure, improve reliability, and — where you choose — personalize experiences.
- Some features use AI processing. AI providers are contractually restricted from using your content for other customers or model training.
- Soullab is not a medical, psychological, or crisis service. It is not a substitute for professional care and should not be used for emergency or clinical decision-making.
- In limited circumstances, Soullab may host a specific third-party partner's app under Soullab infrastructure. Those apps are functionally separated from Soullab's internal systems and may have their own privacy terms.
- We do not sell your personal information.

---

## 2. Who We Are

**Soul Lab**
**Website:** https://soullab.life
**Privacy contact:** privacy@soullab.life

Soullab provides software, websites, and AI-driven experiences, including:

- **Member experiences** — accounts, sessions, and features you use directly on Soullab (including MAIA).
- **AIN / MAIA engine services** — API endpoints that power AI features, including the consciousness companion, oracle, and related processing.
- **Hosted client applications** — in limited, specific circumstances, a partner app may run on Soullab infrastructure (e.g., under a Soullab subdomain) while the partner establishes their own domain. This is not a general hosting service.

When this policy says "Soullab," it refers to our services in this section unless a feature or page says otherwise.

---

## 3. Information We Collect

### 3.1 Information You Provide

Depending on what you do in Soullab, you may provide:

- **Account information** — name, email address, username, login credentials, profile details, passkey
- **Content you submit** — messages, journal entries, prompts, feedback, ratings, emotional tags, repair requests, transcripts, uploaded files, form entries
- **Payments** — billing details handled by our payment processor; we receive confirmation and limited billing metadata, not full card numbers

### 3.2 Information Collected Automatically

When you use our sites and apps, we may collect:

- **Device and usage data** — IP address, browser type, device identifiers, pages visited, events, timestamps
- **Session cookies** — for authentication and preferences (see Section 8)
- **Diagnostics and security logs** — error logs, performance metrics, authentication events, audit trail

### 3.3 Information Generated Through Your Use (Including AI)

Using Soullab may produce:

- **AI inputs and outputs** — your prompts and the system's responses
- **Derived metadata** — routing decisions, feature usage, model selection, response timing, token counts, safety filtering events
- **Feature-specific state** — saved sessions, spiral state, consciousness profile data, summaries, or structured records created by the app

> **Note on sensitive content:** If you enter sensitive information (health details, trauma history, legal matters, etc.), you are choosing to provide it. MAIA is designed for reflection and inner work; share only what you are comfortable storing in a digital system.

### 3.4 Apple HealthKit Data (iOS only)

When you grant permission, MAIA may read:
- Mindful minutes, sleep data, heart rate variability (HRV)

HealthKit data is used only to adapt MAIA's responses to your physiological state. It is **stored only on your device** and never transmitted to Soullab servers or shared with third parties. You can revoke HealthKit access at any time in iOS Settings → Privacy → Health → MAIA.

---

## 4. How We Use Information

We use collected information to:

1. **Provide and operate Soullab** — authenticate users, deliver features, maintain sessions, provide support.
2. **Secure the service** — prevent fraud and abuse, enforce access controls, monitor threats, run security checks.
3. **Improve reliability and performance** — debugging, monitoring, capacity planning, quality assurance.
4. **Personalize experiences where enabled** — remembering settings, context, preferences, and (when you use features that require it) continuity across sessions.
5. **Comply with legal obligations** — respond to lawful requests, enforce agreements, maintain required records.

---

## 5. AI Processing and Model Providers

### 5.1 Primary AI Processing — Anthropic

Soullab uses **Anthropic (Claude)** as the primary AI provider for generating responses in MAIA, the oracle, and related features. When you interact with these features:

- Portions of your submitted content are sent to Anthropic's servers for processing.
- Anthropic's data handling is governed by their [Privacy Policy](https://www.anthropic.com/privacy).
- Per Anthropic's policy: API inputs and outputs are not used to train their models without consent; data is retained for trust-and-safety purposes then deleted.

### 5.2 Voice Synthesis — OpenAI TTS

Soullab uses **OpenAI's text-to-speech (TTS) API** solely for converting MAIA's text responses to spoken audio. This is voice synthesis only.

- OpenAI does **not** process your conversation content, receive your prompts, or have access to your interactions.
- Only the generated text response (what MAIA has already said) is sent to OpenAI for audio rendering.
- OpenAI's data handling is governed by their [Privacy Policy](https://openai.com/policies/privacy-policy).

### 5.3 Self-Hosted Model Fallback

When the Anthropic API is unavailable, MAIA may fall back to locally-run models (Ollama / DeepSeek) hosted on Soullab's own hardware. In this case, no content leaves Soullab's infrastructure.

### 5.4 Minimization Principle

We aim to minimize what is sent to external providers and limit it to what is needed for the request. If a feature offers settings (e.g., "local-only mode"), those settings control processing within the limits described in the product UI.

### 5.5 Provider Restrictions and API Logging

Third-party AI providers are contractually restricted from using your content to provide services to other customers or for model training without your consent. This applies to both Anthropic (AI processing) and OpenAI (TTS).

When Soullab's AIN engine is accessed via API (including by hosted partner apps), those requests are authenticated and logged. Soullab retains request metadata — such as timestamps, source identifier, and usage volume — for security, abuse prevention, and system integrity. This metadata does not include the content of AI conversations.

---

## 6. Hosted Client Applications

In limited circumstances, Soullab may host a specific partner's application on Soullab infrastructure while the partner establishes their own domain. This is not a general or publicly offered hosting service.

**Key principles:**

- **Functional separation.** Hosted partner apps run in their own isolated environment, including separate databases. They do not have internal network access to Soullab's private systems.
- **API-based connection.** If a hosted partner app uses Soullab's AIN / MAIA features, it does so via authenticated HTTPS API calls — the same as any external customer — never via direct internal access.
- **Operator responsibility.** The operator of a hosted partner application is responsible for the personal data collected within that application and is required to maintain their own privacy terms for their users.
- **Separate policies.** If you use a hosted partner app, that operator's policy governs the data they collect in that context. Soullab's policy covers only Soullab's infrastructure and services.

If you are unsure whether you are using Soullab directly or a hosted partner app, check the page footer, onboarding screens, or product documentation.

---

## 7. How We Share Information

We share information only as needed to run the service.

### 7.1 Service Providers

We may share data with vendors that help us operate, including:

| Provider | Purpose |
|---|---|
| Anthropic | AI response generation (Claude) |
| OpenAI | Voice synthesis (TTS) only |
| Resend | Transactional email delivery |
| Apple HealthKit | iOS health data integration (device-only; see §3.4) |

These providers are permitted to process data only to provide services to us, subject to contractual obligations. They are prohibited from using your data for their own purposes, for other customers, or for model training without your consent. We do not share data with advertising networks.

### 7.2 Legal and Safety

We may disclose information if required to comply with law, regulation, or legal process; to protect users and prevent harm; or to enforce our agreements.

### 7.3 Business Transfers

If Soullab is involved in a merger, acquisition, or asset sale, data may be transferred as part of that transaction, subject to appropriate safeguards and advance notice.

**We do not sell your personal information.**

---

## 8. Cookies and Session Tokens

We use cookies and similar technologies to:

- Keep you signed in (session cookies)
- Remember preferences
- Protect against fraud and CSRF attacks
- Understand usage patterns and improve reliability

| Cookie | Purpose | HttpOnly |
|---|---|---|
| `maia_session` | Authentication session token | Yes |
| `maia_tier` | Active membership tier | Yes |
| `maia_roles` | Role-based access control | Yes |

All authentication cookies are set with `HttpOnly`, `Secure`, and `SameSite=Strict` flags. We do not use advertising or third-party tracking cookies.

You can control cookies through your browser settings. Some features (including sign-in) will not work without essential session cookies.

---

## 9. Data Storage and Security

### 9.1 Where We Store Data

Soullab runs on self-hosted, Soullab-controlled infrastructure located in the United States. There is no third-party managed database provider. Your data does not flow through cloud hosting platforms such as Vercel, Supabase, Heroku, or similar services.

- **Account and session data** — stored in self-hosted PostgreSQL, encrypted at rest
- **Conversation and AI session data** — stored in the same PostgreSQL instance, accessible only to you and MAIA
- **HealthKit data** — stored only on your iOS device, never on Soullab servers
- **Uploaded files** — stored on Soullab's local file system

### 9.2 Security Measures

- Encrypted transport (HTTPS / TLS via Caddy)
- Network segmentation (internal services not reachable from public networks)
- Role-based access controls and least-privilege principles
- httpOnly, Secure, SameSite cookies
- bcrypt password hashing (SHA-256 passwords are transparently upgraded on next login)
- Audit logs for authentication events
- Regular vulnerability assessments and dependency scanning

Security measures are designed to follow industry-standard practices, but no method of transmission or storage is completely secure. You are responsible for maintaining the confidentiality of your credentials.

### 9.3 Data Retention

| Data type | Retention |
|---|---|
| Account and profile data | Until account deletion |
| Conversation and session data | Until you delete it or close your account |
| Security and audit logs | 90 days, then aggregated |
| Authentication sessions | 30 days from last use |
| Inactive accounts | 24 months of inactivity (with prior notice) |
| Legal/compliance records | As required by applicable law |

After account deletion, data is permanently removed within 30 days.

---

## 10. Your Rights and Choices

Depending on where you live, you may have rights to:

- **Access** — request a copy of personal information we hold about you
- **Correct** — update or correct inaccurate information
- **Delete** — request deletion of your account and associated data
- **Export** — download your conversation history and profile data
- **Restrict or object** — limit how we process your data
- **Opt out of analytics** — disable usage analytics in app settings
- **Revoke HealthKit access** — disable HealthKit integration at any time in iOS Settings

You can manage most settings inside the product. For formal requests, contact us at privacy@soullab.life. We may need to verify your identity and will respond within 30 days.

### California (CCPA)

California residents have the right to know what personal information is collected, whether it is sold or disclosed, to opt out of sale (we don't sell data), to request deletion, and to non-discrimination for exercising these rights.

### EU / UK (GDPR)

If you are in the European Union or United Kingdom, you have rights to access, rectification, erasure, restriction, portability, and to object to processing. Our legal bases for processing are contract performance (to provide the service), legitimate interests (security and reliability), and consent (HealthKit, optional features).

For EU/UK users: where required, we use Standard Contractual Clauses or other approved mechanisms for international data transfers.

---

## 11. Children's Privacy

Soullab is not intended for children under 13 (or the age required by local law). We do not knowingly collect personal information from children. If you believe a child has provided us with data, contact us at privacy@soullab.life and we will delete it promptly.

---

## 12. International Data Transfers

Soullab is operated from Connecticut, United States. If you access Soullab from outside the United States, your information may be processed in the United States or in countries where our service providers operate. We use appropriate safeguards where required by law.

---

## 13. Changes to This Policy

We may update this policy from time to time. If changes are material, we will take reasonable steps to notify you — for example, by posting an update notice or prompting you in-app. The "Last updated" date at the top of this document reflects the most recent revision.

---

## 14. Contact

For privacy questions, data requests, or to exercise your rights:

**Soul Lab**
**Email:** privacy@soullab.life
**Website:** https://soullab.life
**Mailing address:** Soul Lab, Connecticut, United States (street address on request)

---

## 15. App Store Data Disclosures

### Apple App Store

| Category | Data | Linked to you |
|---|---|---|
| Contact info | Email address | Yes |
| User content | Conversation messages, prompts | Yes |
| Health & fitness | Mindful minutes, sleep, HRV (optional, HealthKit) | No (device-only) |
| Identifiers | User ID, session token | Yes |
| Usage data | Interaction analytics | Yes |

### Google Play Store

**Data collected:** Email, user ID, conversation content, interaction logs, optional meditation/sleep data
**Data sharing:** Anthropic (AI processing), OpenAI (voice synthesis only)
**Data security:** Encrypted in transit and at rest
**Data deletion:** User can request deletion via privacy@soullab.life or in-app

---

## 16. Footer Notice (Short Form)

> Soullab collects data to run and secure the service. Some features use AI processing. We do not sell personal information. Your HealthKit data stays on your device. [Read the full Privacy Policy](https://soullab.life/privacy).

---

*© 2026 Soul Lab. All rights reserved.*
