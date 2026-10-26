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

    def test_route_authority_proof_cannot_be_removed_from_ci_script(self):
        result = self.evaluate(
            "package.json",
            lambda s: s.replace(" && node scripts/ci/openai-tts-authority-proof.mjs", "", 1),
        )
        self.assertIn("CI_ROUTE_AUTHORITY_PROOF_REQUIRED", self.codes(result))

    def test_physical_spend_proof_cannot_be_removed_from_workflow(self):
        result = self.evaluate(
            ".github/workflows/ai-provider-boundary.yml",
            lambda s: s.replace("run: npm run ci:provider-spend-postgres", "run: echo removed", 1),
        )
        self.assertIn("CI_PHYSICAL_SPEND_PROOF_REQUIRED", self.codes(result))

    def test_explicit_cloud_authority_case_cannot_be_removed(self):
        result = self.evaluate(
            "scripts/ci/openai-tts-authority-proof.mjs",
            lambda s: s.replace("explicit-cloud-dispatches-once", "removed-explicit-cloud-case", 1),
        )
        self.assertIn("TTS_AUTHORITY_EXPLICIT_CLOUD_CASE_REQUIRED", self.codes(result))

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

    def test_cloud_explicit_member_choice_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("voicePreference.effective === 'cloud'", "true", 1),
        )
        self.assertIn("CLOUD_EXPLICIT_MEMBER_CHOICE_REQUIRED", self.codes(result))

    def test_cloud_local_only_override_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("!localOnlyHeader &&", "true &&", 1),
        )
        self.assertIn("CLOUD_LOCAL_ONLY_OVERRIDE_REQUIRED", self.codes(result))

    def test_cloud_recorded_denial_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("recordedCloudConsent.allowed &&", "true &&", 1),
        )
        self.assertIn("CLOUD_RECORDED_DENIAL_MUST_BIND", self.codes(result))

    def test_cloud_provider_preference_cannot_come_from_body(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "memberProviderPreference = prefs?.ttsProvider ?? null;",
                "memberProviderPreference = body?.ttsProvider ?? null;",
                1,
            ),
        )
        self.assertIn("CLOUD_PROVIDER_PREFERENCE_CLIENT_CONTROL_FORBIDDEN", self.codes(result))
        self.assertIn("CLOUD_MEMBER_PROVIDER_PREF_REQUIRED", self.codes(result))

    def test_default_local_provider_pin_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("providerOverride: 'kokoro',", "providerOverride: 'auto',", 1),
        )
        self.assertIn("LOCAL_PROVIDER_PIN_REQUIRED", self.codes(result))

    def test_default_local_preference_pin_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("ttsProviderPref: 'local',", "ttsProviderPref: 'auto',", 1),
        )
        self.assertIn("LOCAL_PREFERENCE_PIN_REQUIRED", self.codes(result))

    def test_default_local_return_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "return synthesizeLocal('sovereign_primary');",
                "void synthesizeLocal('sovereign_primary');",
                1,
            ),
        )
        self.assertIn("LOCAL_DEFAULT_RETURN_REQUIRED", self.codes(result))

    def test_second_cloud_dispatch_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s + "\nvoid getOpenAI().audio.speech.create({} as any);\n",
        )
        self.assertIn("CLOUD_SINGLE_PROVIDER_DISPATCH_REQUIRED", self.codes(result))

    def test_tts_format_allowlist_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "const allowedFormats = new Set(['mp3', 'wav', 'opus', 'aac', 'flac'])",
                "const allowedFormats = new Set([requestedFormat])",
                1,
            ),
        )
        self.assertIn("TTS_FORMAT_ALLOWLIST_REQUIRED", self.codes(result))

    def test_tts_speed_clamp_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "Math.max(0.25, Math.min(4.0, requestedSpeed))",
                "requestedSpeed",
                1,
            ),
        )
        self.assertIn("TTS_SPEED_CLAMP_REQUIRED", self.codes(result))

    def test_cloud_voice_cannot_come_from_body(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "const voice = archetypeResolution.voice;",
                "const voice = body?.voice ?? archetypeResolution.voice;",
                1,
            ),
        )
        self.assertIn("CLOUD_SERVER_VOICE_RESOLUTION_REQUIRED", self.codes(result))
        self.assertIn("CLOUD_VOICE_CLIENT_CONTROL_FORBIDDEN", self.codes(result))

    def test_cloud_model_allowlist_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace(
                "const allowedModels = new Set(['gpt-4o-mini-tts', 'tts-1', 'tts-1-hd'])",
                "const allowedModels = new Set([requestedModel])",
                1,
            ),
        )
        self.assertIn("CLOUD_MODEL_ALLOWLIST_REQUIRED", self.codes(result))

    def test_cloud_accounting_failure_local_fallback_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/openai-tts/route.ts",
            lambda s: s.replace("'provider_accounting_unavailable'", "'removed_accounting_fallback'", 1),
        )
        self.assertIn("CLOUD_ACCOUNTING_FAILURE_LOCAL_FALLBACK_REQUIRED", self.codes(result))

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
                "Local voice unavailable for anonymous session",
                "removed local voice refusal",
            ),
        )
        self.assertIn("ANON_CLOUD_FALLBACK_REFUSAL_REQUIRED", self.codes(result))

    def test_cloud_voice_forbidden_translation_removal_fails(self):
        result = self.evaluate(
            "app/api/voice/local-tts/route.ts",
            lambda s: s.replace("err instanceof CloudVoiceForbidden", "false", 1),
        )
        self.assertIn("LOCAL_CLOUD_REFUSAL_MUST_TRANSLATE_503", self.codes(result))

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
