#!/usr/bin/env python3
"""Fail-closed static contract for Soullab AI-provider gateways.

This gate outputs only file paths and rule codes. It never prints source lines,
environment values, credentials, request bodies, member content or member IDs.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

SERVER_MODULES = (
    "lib/oracle/FieldIntelligenceMaiaOrchestrator.ts",
    "lib/services/ClaudeService.ts",
    "lib/services/VoiceServiceWithFallback.ts",
    "lib/utils/modelService.ts",
    "lib/limits/LimitsEnforcer.ts",
    "lib/limits/ProviderSpendGate.ts",
)
ROUTES = (
    "app/api/voice/local-tts/route.ts",
    "app/api/voice/openai-tts/route.ts",
    "app/api/voice/preview/route.ts",
    "app/api/voice/stream-conversation/route.ts",
    "app/api/voice/webrtc-session/route.ts",
)
AUTH_MATRIX = ("config/accessMatrix.ts",)
CLIENTS = (
    "lib/voice/AnthonyElementalVoice.ts",
    "lib/voice/MaiaRealtimeWebRTC.ts",
    "lib/voice/MaiaVoiceSynthesis.ts",
    "lib/voice/PersonalizedVoiceService.ts",
    "lib/voice/StreamingAudioQueue.ts",
    "lib/voice/elevenlabs-voice.ts",
    "lib/voice/maia-voice.ts",
    "lib/voice/maia-voice-mobile.ts",
    "lib/voice/serverTtsClient.ts",
)
ALL = SERVER_MODULES + ROUTES + CLIENTS + AUTH_MATRIX
API_FETCH_CLIENTS = (
    "lib/voice/MaiaRealtimeWebRTC.ts",
    "lib/voice/MaiaVoiceSynthesis.ts",
    "lib/voice/StreamingAudioQueue.ts",
    "lib/voice/maia-voice.ts",
    "lib/voice/maia-voice-mobile.ts",
    "lib/voice/serverTtsClient.ts",
)
HELPER_CLIENTS = (
    "lib/voice/AnthonyElementalVoice.ts",
    "lib/voice/PersonalizedVoiceService.ts",
    "lib/voice/elevenlabs-voice.ts",
)
PUBLIC_SECRET = re.compile(
    r"\b(?:NEXT_PUBLIC|VITE|EXPO_PUBLIC)_[A-Z0-9_]*"
    r"(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|SERVICE_ROLE_KEY|SPEECH_KEY)\b"
)
KEY_SHAPE = re.compile(
    r"(?:sk-(?:proj-|ant-|or-v1-)[A-Za-z0-9_-]{24,}|"
    r"sb_secret_[A-Za-z0-9_-]{24,}|ghp_[A-Za-z0-9]{30,})"
)
DIRECT_PROVIDER = (
    "api.openai.com",
    "api.anthropic.com",
    "api.elevenlabs.io",
    ".tts.speech.microsoft.com",
)
DIRECT_VOICE_FETCH = re.compile(r"\bfetch\s*\(\s*['\"`]\/api\/voice\/")


def read_tree(root: Path) -> dict[str, str]:
    return {
        rel: (root / rel).read_text(encoding="utf8", errors="replace")
        if (root / rel).is_file()
        else ""
        for rel in ALL
    }


def first_import_server_only(text: str) -> bool:
    imports = list(re.finditer(r"(?m)^[ \t]*import\b[^\n]*", text))
    return bool(imports) and "server-only" in imports[0].group(0)


def before(text: str, first: str, second: str) -> bool:
    left, right = text.find(first), text.find(second)
    return left >= 0 and right >= 0 and left < right


def positions(text: str, needle: str) -> list[int]:
    found: list[int] = []
    start = 0
    while True:
        index = text.find(needle, start)
        if index < 0:
            return found
        found.append(index)
        start = index + len(needle)


def paired_before(text: str, first: str, second: str, count: int) -> bool:
    left = positions(text, first)
    right = positions(text, second)
    return len(left) == count and len(right) == count and all(a < b for a, b in zip(left, right))


def evaluate(source: dict[str, str]) -> dict[str, object]:
    violations: list[tuple[str, str]] = []

    def add(path: str, code: str) -> None:
        violations.append((path, code))

    for path in ALL:
        text = source.get(path, "")
        if not text:
            add(path, "MISSING_FILE")
            continue
        if PUBLIC_SECRET.search(text):
            add(path, "PUBLIC_SECRET_REFERENCE")
        if KEY_SHAPE.search(text):
            add(path, "CREDENTIAL_LITERAL_SHAPE")

    for path in SERVER_MODULES + ROUTES:
        if source.get(path) and not first_import_server_only(source[path]):
            add(path, "SERVER_ONLY_FIRST_IMPORT_REQUIRED")

    for path in CLIENTS:
        text = source.get(path, "")
        if any(endpoint in text for endpoint in DIRECT_PROVIDER):
            add(path, "DIRECT_PROVIDER_ENDPOINT_IN_CLIENT")
        if DIRECT_VOICE_FETCH.search(text):
            add(path, "RAW_FETCH_TO_VOICE_ROUTE")

    for path in API_FETCH_CLIENTS:
        text = source.get(path, "")
        if "apiFetch" not in text or "http/apiBase" not in text:
            add(path, "API_FETCH_IDENTITY_TRANSPORT_REQUIRED")

    for path in HELPER_CLIENTS:
        text = source.get(path, "")
        if "from './serverTtsClient'" not in text or "requestSoullabTts(" not in text:
            add(path, "SERVER_TTS_HELPER_REQUIRED")

    helper = source.get("lib/voice/serverTtsClient.ts", "")
    if "apiFetch('/api/voice/openai-tts'" not in helper:
        add("lib/voice/serverTtsClient.ts", "SERVER_TTS_API_FETCH_REQUIRED")
    if not re.search(r"cache\s*:\s*['\"]no-store['\"]", helper):
        add("lib/voice/serverTtsClient.ts", "CLIENT_NO_STORE_REQUIRED")

    realtime_client = source.get("lib/voice/MaiaRealtimeWebRTC.ts", "")
    if any(
        value in realtime_client
        for value in (
            "userId: this.config.userId",
            "userName: this.config.userName",
            "element: this.config.element",
            "conversationStyle: this.config.conversationStyle",
        )
    ):
        add("lib/voice/MaiaRealtimeWebRTC.ts", "CLIENT_IDENTITY_CONTEXT_IN_REALTIME_QUERY")

    path = "config/accessMatrix.ts"
    text = source.get(path, "")
    route_contracts = (
        (r"\{\s*exact:\s*'/api/voice/local-tts',\s*public:\s*true", "LOCAL_TTS_PUBLIC_EXACT_RULE_REQUIRED"),
        (r"\{\s*exact:\s*'/api/voice/openai-tts',\s*minTier:\s*'free'", "OPENAI_TTS_AUTH_EXACT_RULE_REQUIRED"),
        (r"\{\s*exact:\s*'/api/voice/preview',\s*minTier:\s*'free'", "VOICE_PREVIEW_AUTH_EXACT_RULE_REQUIRED"),
        (r"\{\s*prefix:\s*'/api/voice/preview/',\s*minTier:\s*'free'", "VOICE_PREVIEW_FILE_AUTH_PREFIX_REQUIRED"),
        (r"\{\s*exact:\s*'/api/voice/stream-conversation',\s*minTier:\s*'free'", "VOICE_STREAM_AUTH_EXACT_RULE_REQUIRED"),
        (r"\{\s*exact:\s*'/api/voice/webrtc-session',\s*minTier:\s*'free'", "VOICE_REALTIME_AUTH_EXACT_RULE_REQUIRED"),
    )
    for pattern, code in route_contracts:
        if not re.search(pattern, text):
            add(path, code)
    for route in (
        '/api/voice/openai-tts',
        '/api/voice/preview',
        '/api/voice/stream-conversation',
        '/api/voice/webrtc-session',
    ):
        if re.search(r"\{\s*exact:\s*'" + re.escape(route) + r"'\s*,\s*public:\s*true", text):
            add(path, "PAID_OR_PRIVATE_VOICE_ROUTE_MUST_NOT_BE_PUBLIC")

    path = "lib/limits/LimitsEnforcer.ts"
    text = source.get(path, "")
    if "tier === 'pro'" not in text or "tier === 'personal'" not in text:
        add(path, "CANONICAL_MEMBER_TIER_MAPPING_REQUIRED")

    path = "lib/limits/ProviderSpendGate.ts"
    text = source.get(path, "")
    if "value === 'pro'" not in text or "value === 'personal'" not in text:
        add(path, "CANONICAL_SPEND_TIER_MAPPING_REQUIRED")
    for needle, code in (
        ("PROVIDER_SPEND_ACCOUNTING_UNAVAILABLE", "SPEND_FAIL_CLOSED_ERROR_REQUIRED"),
        ("dependencies.transaction", "SPEND_TRANSACTION_BOUNDARY_REQUIRED"),
        ("provider-spend:text-free-reserve", "SPEND_FREE_TEXT_RESERVATION_REQUIRED"),
        ("provider-spend:text-metered-reserve", "SPEND_METERED_TEXT_RESERVATION_REQUIRED"),
        ("provider-spend:free-reserve", "SPEND_FREE_VOICE_RESERVATION_REQUIRED"),
        ("provider-spend:member-plus-reserve", "SPEND_MEMBER_PLUS_VOICE_RESERVATION_REQUIRED"),
        ("provider-spend:daily-reserve", "SPEND_DAILY_VOICE_RESERVATION_REQUIRED"),
        ("COALESCE(text_turns, 0) < $3", "SPEND_FREE_TEXT_ATOMIC_LIMIT_REQUIRED"),
        ("RETURNING text_turns", "SPEND_TEXT_RETURNING_REQUIRED"),
        ("RETURNING voice_seconds_used", "SPEND_VOICE_RETURNING_REQUIRED"),
    ):
        if needle not in text:
            add(path, code)

    path = "app/api/voice/openai-tts/route.ts"
    text = source.get(path, "")
    for needle, code in (
        ("Authentication required for cloud voice", "CLOUD_AUTH_REQUIRED"),
        ("LimitsEnforcer.checkUsage", "CLOUD_QUOTA_CHECK_REQUIRED"),
        ("LimitsEnforcer.recordUsage", "CLOUD_QUOTA_RECORD_REQUIRED"),
    ):
        if needle not in text:
            add(path, code)
    if not before(text, "getMemberIdFromRequest(req)", "getOpenAI().audio.speech.create"):
        add(path, "CLOUD_AUTH_MUST_PRECEDE_PROVIDER")
    if not paired_before(text, "reserveVoiceProviderSpend({", "getOpenAI().audio.speech.create", 2):
        add(path, "CLOUD_SPEND_RESERVATION_BEFORE_PROVIDER_REQUIRED")
    if "isProviderSpendGateError(err)" not in text:
        add(path, "CLOUD_SPEND_REFUSAL_RESPONSE_REQUIRED")
    if "x-maia-anon-id" in text or "anon_${" in text:
        add(path, "CLOUD_ANONYMOUS_ID_FORBIDDEN")
    if any(
        value in text
        for value in (
            "OPENAI_API_KEY length",
            "OPENAI_API_KEY present?",
            "err?.error)",
            "err?.response)",
            "details: errorText",
        )
    ):
        add(path, "PROVIDER_DIAGNOSTIC_LEAK")

    path = "app/api/voice/local-tts/route.ts"
    text = source.get(path, "")
    if "Stable anonymous voice session required" not in text:
        add(path, "STABLE_ANON_ID_REQUIRED")
    if "const anonId = isAnon ? headerAnonId : undefined" not in text:
        add(path, "RANDOM_ANON_ID_FORBIDDEN")
    if "Local voice unavailable for anonymous session" not in text:
        add(path, "ANON_CLOUD_FALLBACK_REFUSAL_REQUIRED")
    if not before(text, "if (isAnon) {", "const speech = await synthesizeSpeech"):
        add(path, "ANON_REFUSAL_MUST_PRECEDE_CLOUD")
    if not before(text, "reserveVoiceProviderSpend({", "const speech = await synthesizeSpeech"):
        add(path, "LOCAL_FALLBACK_SPEND_RESERVATION_REQUIRED")
    if "err instanceof CloudVoiceForbidden" not in text or "Local voice unavailable for anonymous session" not in text:
        add(path, "LOCAL_CLOUD_REFUSAL_MUST_TRANSLATE_503")
    if not before(text, "err instanceof CloudVoiceForbidden", "err instanceof TTSFallbackToOpenAI"):
        add(path, "LOCAL_CLOUD_REFUSAL_MUST_PRECEDE_FALLBACK_SENTINEL")

    path = "app/api/voice/stream-conversation/route.ts"
    text = source.get(path, "")
    if not before(text, "getMemberIdFromRequest(req)", "await req.json()"):
        add(path, "STREAM_AUTH_BEFORE_BODY_REQUIRED")
    if "bodyUserId ||" in text:
        add(path, "STREAM_BODY_IDENTITY_FALLBACK_FORBIDDEN")
    if "bodyUserId && bodyUserId !== verifiedUserId" not in text:
        add(path, "STREAM_IDENTITY_MISMATCH_REQUIRED")
    if "reserveTextProviderSpend({" not in text:
        add(path, "STREAM_TEXT_SPEND_RESERVATION_REQUIRED")
    if not before(text, "reserveTextProviderSpend({", "const claudeService = getClaudeService()"):
        add(path, "STREAM_TEXT_RESERVATION_BEFORE_PROVIDER_DISPATCH")
    if before(text, "reserveTextProviderSpend({", "if (!turnDecision.shouldSpeak)"):
        add(path, "STREAM_TEXT_RESERVATION_MUST_FOLLOW_SILENCE_GATE")
    if before(text, "reserveTextProviderSpend({", "if (thresholdResult.skipLLM"):
        add(path, "STREAM_TEXT_RESERVATION_MUST_FOLLOW_THRESHOLD_GATE")
    if "reserveVoiceProviderSpend({" not in text or "synthesizeAccountedOpenAiSpeech" not in text:
        add(path, "STREAM_VOICE_SPEND_RESERVATION_REQUIRED")
    if not before(text, "reserveVoiceProviderSpend({", "return synthesizeSpeech({ text, ...options }"):
        add(path, "STREAM_VOICE_RESERVATION_BEFORE_PROVIDER_REQUIRED")
    if ".substring(0, 80)" in text or "[StreamConversation] Message:" in text:
        add(path, "MEMBER_MESSAGE_LOGGING_FORBIDDEN")
    if "userId.substring(" in text or "userId.slice(" in text:
        add(path, "MEMBER_ID_PREFIX_LOGGING_FORBIDDEN")

    path = "app/api/voice/webrtc-session/route.ts"
    text = source.get(path, "")
    if not before(text, "getMemberIdFromRequest(req)", "await req.text()"):
        add(path, "REALTIME_AUTH_BEFORE_SDP_REQUIRED")
    if "OPENAI_REALTIME_BROKER_RELEASED" not in text:
        add(path, "REALTIME_DEFAULT_OFF_RELEASE_GATE_REQUIRED")
    if "OPENAI_REALTIME_USAGE_ACCOUNTING_RELEASED" not in text:
        add(path, "REALTIME_ACCOUNTING_RELEASE_GATE_REQUIRED")
    if not before(text, "OPENAI_REALTIME_BROKER_RELEASED", "fetch('https://api.openai.com"):
        add(path, "REALTIME_RELEASE_GATE_BEFORE_PROVIDER")
    if "searchParams.get('userId')" in text or "searchParams.get('userName')" in text:
        add(path, "REALTIME_CLIENT_IDENTITY_QUERY_FORBIDDEN")
    if "allowedModes" not in text or "allowedVoices" not in text:
        add(path, "REALTIME_OPTION_ALLOWLIST_REQUIRED")
    if "const errorText = await response.text()" in text or "details: String(error)" in text:
        add(path, "REALTIME_UPSTREAM_DETAILS_FORBIDDEN")

    path = "app/api/voice/preview/route.ts"
    text = source.get(path, "")
    for needle, code in (
        ("requireMemberId()", "PREVIEW_AUTH_REQUIRED"),
        ("LimitsEnforcer.checkUsage", "PREVIEW_QUOTA_CHECK_REQUIRED"),
        ("LimitsEnforcer.recordUsage", "PREVIEW_QUOTA_RECORD_REQUIRED"),
    ):
        if needle not in text:
            add(path, code)
    if ".slice(0, 8)" in text:
        add(path, "MEMBER_ID_PREFIX_LOGGING_FORBIDDEN")
    if not before(text, "reserveVoiceProviderSpend({", "const speech = await synthesizeSpeech"):
        add(path, "PREVIEW_SPEND_RESERVATION_REQUIRED")

    rows = sorted(set(violations))
    return {
        "status": "PASS" if not rows else "FAIL",
        "violations": [{"path": path, "code": code} for path, code in rows],
        "files": len(ALL),
        "secrets_included": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    try:
        result = evaluate(read_tree(args.root.resolve()))
    except Exception as error:
        result = {
            "status": "ERROR",
            "error_category": type(error).__name__,
            "secrets_included": False,
        }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
