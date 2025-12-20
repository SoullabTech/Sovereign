# Cloud Integration Chokepoints

This directory contains **sovereignty boundary wrappers** for cloud service SDKs.

## Purpose

These files serve as **single points of entry** for cloud provider code:

1. **Auditing**: Easy to track cloud dependencies (only these files import cloud SDKs)
2. **Migration**: Centralized location for replacing cloud services with local alternatives
3. **Documentation**: Explicit contracts for when/why cloud services are used

## Current Chokepoints

### `openaiClient.ts`
- **Purpose**: Text-to-Speech (TTS) ONLY
- **Status**: ✅ Approved (voice synthesis)
- **Migration**: TODO - Replace with local TTS (Coqui/Bark)

### `s3Client.ts`
- **Purpose**: Audio file storage
- **Status**: ⚠️ Deprecated (violates sovereignty)
- **Migration**: TODO - Replace with local filesystem storage

## Sovereignty Rules

**✅ ALLOWED:**
- Importing cloud SDKs **only in this directory**
- Using wrappers from other files

**❌ FORBIDDEN:**
- Direct cloud SDK imports outside this directory
- Adding new cloud services without chokepoint wrapper
- Using cloud services for core AI/LLM processing

## Adding New Cloud Services

If you must add a cloud service:

1. Create `[service]Client.ts` in this directory
2. Document why it's necessary
3. Add deprecation notice if it violates sovereignty
4. Update `.sovereignty-audit.json` to allow only this file

## Migration Priorities

1. **High**: Replace S3 with local filesystem (violates sovereignty)
2. **Medium**: Replace OpenAI TTS with local TTS (reduces external dependencies)
3. **Low**: Audit and remove any other cloud dependencies

## Monitoring

Run sovereignty audit to verify cloud code stays contained:

```bash
npm run audit:sovereignty
```

Should only flag violations in this directory (by design).
