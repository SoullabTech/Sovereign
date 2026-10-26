#!/usr/bin/env python3
"""Adversarial mutation tests for the AI-provider boundary guard."""
from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "ai_provider_boundary_guard", Path(__file__).with_name("ai-provider-boundary-check.py")
)
GUARD = ModuleType(SPEC.name)
sys.modules[SPEC.name] = GUARD
assert SPEC.loader is not None
SPEC.loader.exec_module(GUARD)


class BoundaryMutations(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.clean = GUARD.read_tree(ROOT)

    def evaluate(self, path=None, mutation=None):
        source = dict(self.clean)
        if path is not None:
            source[path] = mutation(source[path])
        return GUARD.evaluate(source)

    @staticmethod
    def codes(result):
        return {row["code"] for row in result["violations"]}

    def test_current_tree_passes(self):
        self.assertEqual(self.evaluate()["status"], "PASS")

    def test_openai_route_mapping_removal_fails(self):
        result = self.evaluate(
            "config/accessMatrix.ts",
            lambda s: s.replace(
                "  { exact: '/api/voice/openai-tts', minTier: 'free', notes: 'Authenticated paid TTS gateway; server-side key and atomic spend reservation' },\n",
                "",
                1,
            ),
        )
        self.assertIn("OPENAI_TTS_AUTH_EXACT_RULE_REQUIRED", self.codes(result))

    def test_stream_route_accidentally_public_fails(self):
        result = self.evaluate(
            "config/accessMatrix.ts",
            lambda s: s.replace(
                "{ exact: '/api/voice/stream-conversation', minTier: 'free'",
                "{ exact: '/api/voice/stream-conversation', public: true, minTier: 'free'",
                1,
            ),
        )
        self.assertIn("PAID_OR_PRIVATE_VOICE_ROUTE_MUST_NOT_BE_PUBLIC", self.codes(result))

    def test_local_tts_public_mapping_removal_fails(self):
        result = self.evaluate(
            "config/accessMatrix.ts",
            lambda s: s.replace(
                "{ exact: '/api/voice/local-tts', public: true",
                "{ exact: '/api/voice/local-tts', minTier: 'free'",
                1,
            ),
        )
        self.assertIn("LOCAL_TTS_PUBLIC_EXACT_RULE_REQUIRED", self.codes(result))

    def test_direct_client_fetch_fails(self):
        result = self.evaluate(
            "lib/voice/serverTtsClient.ts", lambda s: s.replace("apiFetch(", "fetch(", 1)
        )
        self.assertIn("RAW_FETCH_TO_VOICE_ROUTE", self.codes(result))

    def test_client_public_key_fails(self):
        result = self.evaluate(
            "lib/voice/maia-voice.ts",
            lambda s: s + "\nconst x=process.env.NEXT_PUBLIC_OPENAI_API_KEY;\n",
        )
        self.assertIn("PUBLIC_SECRET_REFERENCE", self.codes(result))

    def test_synthetic_key_literal_fails_without_echo(self):
        fake = "sk-proj-" + ("X" * 32)
        result = self.evaluate(
            "lib/voice/maia-voice.ts", lambda s: s + f'\nconst x="{fake}";\n'
        )
        self.assertIn("CREDENTIAL_LITERAL_SHAPE", self.codes(result))
        self.assertNotIn(fake, str(result))

    def test_server_only_removal_fails(self):
        result = self.evaluate(
            "lib/services/ClaudeService.ts",
            lambda s: s.replace("import 'server-only';", "", 1),
        )
        self.assertIn("SERVER_ONLY_FIRST_IMPORT_REQUIRED", self.codes(result))

    def test_cloud_auth_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "return jsonError('Authentication required for cloud voice', 401, { requestId });",
                "return jsonError('continue', 200);",
                1,
            ),
        )
        self.assertIn("CLOUD_AUTH_REQUIRED", self.codes(result))

    def test_cloud_anon_id_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s + "\nconst x=req.headers.get('x-maia-anon-id');\n",
        )
        self.assertIn("CLOUD_ANONYMOUS_ID_FORBIDDEN", self.codes(result))

    def test_key_length_log_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s + "\nconsole.log('OPENAI_API_KEY length');\n",
        )
        self.assertIn("PROVIDER_DIAGNOSTIC_LEAK", self.codes(result))

    def test_random_anon_fails(self):
        result = self.evaluate(
            "app/api/voice/local-tts/route.ts",
            lambda s: s.replace(
                "const anonId = isAnon ? headerAnonId : undefined",
                "const anonId = isAnon ? (headerAnonId || `anon_${crypto.randomUUID()}`) : undefined",
                1,
            ),
        )
        self.assertIn("RANDOM_ANON_ID_FORBIDDEN", self.codes(result))

    def test_anon_cloud_refusal_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/local-tts/route.ts",
            lambda s: s.replace(
                "return jsonError('Local voice unavailable for anonymous session', 503, { requestId });",
                "return jsonError('continue', 200);",
                1,
            ),
        )
        self.assertIn("ANON_CLOUD_FALLBACK_REFUSAL_REQUIRED", self.codes(result))

    def test_stream_body_identity_fails(self):
        result = self.evaluate(
            "app/api/voice/stream-conversation/route.ts",
            lambda s: s.replace(
                "const userId = verifiedUserId;",
                "const userId = bodyUserId || verifiedUserId;",
                1,
            ),
        )
        self.assertIn("STREAM_BODY_IDENTITY_FALLBACK_FORBIDDEN", self.codes(result))

    def test_stream_content_log_fails(self):
        result = self.evaluate(
            "app/api/voice/stream-conversation/route.ts",
            lambda s: s
            + "\nconsole.log(`[StreamConversation] Message: ${message.substring(0, 80)}`);\n",
        )
        self.assertIn("MEMBER_MESSAGE_LOGGING_FORBIDDEN", self.codes(result))

    def test_realtime_gate_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/webrtc-session/route.ts",
            lambda s: s.replace(
                "process.env.OPENAI_REALTIME_BROKER_RELEASED !== 'true'", "false", 1
            ),
        )
        self.assertIn("REALTIME_DEFAULT_OFF_RELEASE_GATE_REQUIRED", self.codes(result))

    def test_realtime_client_identity_fails(self):
        result = self.evaluate(
            "app/api/voice/webrtc-session/route.ts",
            lambda s: s + "\nconst x=searchParams.get('userId');\n",
        )
        self.assertIn("REALTIME_CLIENT_IDENTITY_QUERY_FORBIDDEN", self.codes(result))

    def test_preview_quota_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/preview/route.ts",
            lambda s: s.replace("LimitsEnforcer.checkUsage", "removedCheck", 1),
        )
        self.assertIn("PREVIEW_QUOTA_CHECK_REQUIRED", self.codes(result))

    def test_member_prefix_log_fails(self):
        result = self.evaluate(
            "app/api/voice/preview/route.ts",
            lambda s: s + "\nconsole.log(memberId.slice(0, 8));\n",
        )
        self.assertIn("MEMBER_ID_PREFIX_LOGGING_FORBIDDEN", self.codes(result))

    def test_spend_transaction_boundary_removal_fails(self):
        result = self.evaluate(
            "lib/limits/ProviderSpendGate.ts",
            lambda s: s.replace("dependencies.transaction(async (client) =>", "Promise.resolve(async (client) =>", 1),
        )
        self.assertIn("SPEND_TRANSACTION_BOUNDARY_REQUIRED", self.codes(result))

    def test_free_text_atomic_limit_removal_fails(self):
        result = self.evaluate(
            "lib/limits/ProviderSpendGate.ts",
            lambda s: s.replace("COALESCE(text_turns, 0) < $3", "TRUE", 1),
        )
        self.assertIn("SPEND_FREE_TEXT_ATOMIC_LIMIT_REQUIRED", self.codes(result))

    def test_openai_spend_reservation_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("await reserveVoiceProviderSpend({", "await Promise.resolve({", 1),
        )
        self.assertIn("CLOUD_SPEND_RESERVATION_BEFORE_PROVIDER_REQUIRED", self.codes(result))

    def test_stream_text_reservation_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/stream-conversation/route.ts",
            lambda s: s.replace("await reserveTextProviderSpend({", "await Promise.resolve({", 1),
        )
        self.assertIn("STREAM_TEXT_SPEND_RESERVATION_REQUIRED", self.codes(result))

    def test_realtime_accounting_gate_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/webrtc-session/route.ts",
            lambda s: s.replace("OPENAI_REALTIME_USAGE_ACCOUNTING_RELEASED", "REMOVED_ACCOUNTING_GATE", 1),
        )
        self.assertIn("REALTIME_ACCOUNTING_RELEASE_GATE_REQUIRED", self.codes(result))

    def test_canonical_personal_tier_mapping_removal_fails(self):
        result = self.evaluate(
            "lib/limits/ProviderSpendGate.ts",
            lambda s: s.replace(" || value === 'personal'", "", 1),
        )
        self.assertIn("CANONICAL_SPEND_TIER_MAPPING_REQUIRED", self.codes(result))

    def test_limits_pro_tier_mapping_removal_fails(self):
        result = self.evaluate(
            "lib/limits/LimitsEnforcer.ts",
            lambda s: s.replace(" || tier === 'pro'", "", 1),
        )
        self.assertIn("CANONICAL_MEMBER_TIER_MAPPING_REQUIRED", self.codes(result))

    def test_stream_early_text_reservation_fails(self):
        def move_early(text: str) -> str:
            start = text.index("        try {\n          await reserveTextProviderSpend({")
            end = text.index("        const claudeService = getClaudeService();", start)
            block = text[start:end]
            text = text[:start] + text[end:]
            insertion = text.index("  const encoder = new TextEncoder();")
            return text[:insertion] + block.lstrip() + text[insertion:]
        result = self.evaluate("app/api/voice/stream-conversation/route.ts", move_early)
        self.assertTrue(
            {"STREAM_TEXT_RESERVATION_MUST_FOLLOW_SILENCE_GATE", "STREAM_TEXT_RESERVATION_MUST_FOLLOW_THRESHOLD_GATE"}
            & self.codes(result)
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
