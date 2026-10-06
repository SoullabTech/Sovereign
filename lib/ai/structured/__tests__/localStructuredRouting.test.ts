import type { StructuredProvider, StructuredRequest, StructuredResult } from '../types';

const localExecute = jest.fn<Promise<StructuredResult>, [StructuredRequest]>();
const externalExecute = jest.fn<Promise<StructuredResult>, [StructuredRequest]>();

jest.mock('../ollamaStructuredAdapter', () => ({
  ollamaStructuredProvider: (): StructuredProvider => ({
    name: 'ollama',
    execute: (req: StructuredRequest) => localExecute(req),
  }),
}));

jest.mock('../anthropicStructuredAdapter', () => ({
  anthropicStructuredProvider: (): StructuredProvider => ({
    name: 'anthropic',
    execute: (req: StructuredRequest) => externalExecute(req),
  }),
}));

const result = (provider: 'ollama' | 'anthropic', model: string): StructuredResult => ({
  content: [{ type: 'text', text: provider }],
  stopReason: 'end_turn',
  usage: { inputTokens: 1, outputTokens: 1 },
  provenance: {
    provider,
    model,
    reportedModel: model,
    modelAgreement: 'agreed',
    latencyMs: 1,
  },
});

describe('configured local structured routing', () => {
  const previousModel = process.env.MAIA_LOCAL_STRUCTURED_MODEL;
  const previousMode = process.env.MAIA_INFERENCE_MODE;

  afterEach(() => {
    jest.resetModules();
    localExecute.mockReset();
    externalExecute.mockReset();
    if (previousModel === undefined) delete process.env.MAIA_LOCAL_STRUCTURED_MODEL;
    else process.env.MAIA_LOCAL_STRUCTURED_MODEL = previousModel;
    if (previousMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
    else process.env.MAIA_INFERENCE_MODE = previousMode;
  });

  it('executes the explicitly pinned local model locally in primary mode', async () => {
    process.env.MAIA_LOCAL_STRUCTURED_MODEL = 'qwen3-coder:30b';
    delete process.env.MAIA_INFERENCE_MODE;
    localExecute.mockResolvedValue(result('ollama', 'qwen3-coder:30b'));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { runStructured } = require('../router') as typeof import('../router');
    const out = await runStructured({
      model: 'qwen3-coder:30b',
      system: 's',
      messages: [{ role: 'user', content: 'q' }],
      maxTokens: 20,
    });

    expect(out.ok).toBe(true);
    expect(localExecute).toHaveBeenCalledTimes(1);
    expect(externalExecute).not.toHaveBeenCalled();
  });

  it('keeps an external pinned model on the external path in primary mode', async () => {
    process.env.MAIA_LOCAL_STRUCTURED_MODEL = 'qwen3-coder:30b';
    delete process.env.MAIA_INFERENCE_MODE;
    externalExecute.mockResolvedValue(result('anthropic', 'claude-opus-5'));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { runStructured } = require('../router') as typeof import('../router');
    const out = await runStructured({
      model: 'claude-opus-5',
      system: 's',
      messages: [{ role: 'user', content: 'q' }],
      maxTokens: 20,
    });

    expect(out.ok).toBe(true);
    expect(externalExecute).toHaveBeenCalledTimes(1);
    expect(localExecute).not.toHaveBeenCalled();
  });

  it('serves sovereign mode locally when the deployment configured a local provider', async () => {
    process.env.MAIA_LOCAL_STRUCTURED_MODEL = 'qwen3-coder:30b';
    process.env.MAIA_INFERENCE_MODE = 'sovereign';
    localExecute.mockResolvedValue(result('ollama', 'qwen3-coder:30b'));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { runStructured } = require('../router') as typeof import('../router');
    const out = await runStructured({
      model: 'qwen3-coder:30b',
      system: 's',
      messages: [{ role: 'user', content: 'q' }],
      maxTokens: 20,
    });

    expect(out.ok).toBe(true);
    expect(localExecute).toHaveBeenCalledTimes(1);
    expect(externalExecute).not.toHaveBeenCalled();
  });
});
