import { GeminiAiAssistantService } from './gemini-ai-assistant.service';

describe('GeminiAiAssistantService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the generated Gemini response without exposing configuration', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn(async () => ({
        candidates: [{ content: { parts: [{ text: 'Operational summary.' }] } }],
      })),
      ok: true,
    } as unknown as Response);
    const configuration = {
      get: jest.fn(() => 'test-key'),
      getOrThrow: jest.fn(() => 'gemini-2.5-flash'),
    };
    const service = new GeminiAiAssistantService(configuration as never);

    await expect(service.answer('Summarize operations.')).resolves.toBe('Operational summary.');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns a friendly availability error without a configured API key', async () => {
    const configuration = { get: jest.fn(() => undefined) };
    const service = new GeminiAiAssistantService(configuration as never);

    await expect(service.answer('Summarize operations.')).rejects.toThrow(
      'AI Assistant is not configured. Set GEMINI_API_KEY in your environment.',
    );
  });
});
