import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AiAssistantService } from '../../application';
import type { ApiEnvironment } from '../../config/environment.validation';

interface GeminiErrorResponse {
  readonly error?: {
    readonly code?: number;
    readonly message?: string;
    readonly status?: string;
  };
}

interface GeminiResponse {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly {
        readonly text?: string;
      }[];
    };
  }[];
}

@Injectable()
export class GeminiAiAssistantService implements AiAssistantService {
  private readonly logger = new Logger(GeminiAiAssistantService.name);

  public constructor(
    @Inject(ConfigService) private readonly configuration: ConfigService<ApiEnvironment, true>,
  ) {}

  public async answer(prompt: string): Promise<string> {
    const apiKey = this.configuration.get('GEMINI_API_KEY');

    if (apiKey === undefined || apiKey.length === 0) {
      this.logger.warn('GEMINI_API_KEY is not configured. AI Assistant cannot process requests.');
      throw new ServiceUnavailableException('AI Assistant is not configured. Set GEMINI_API_KEY in your environment.');
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 15_000);

    try {
      const model = this.configuration.getOrThrow('GEMINI_MODEL');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      this.logger.log(`Sending prompt to Gemini (model: ${model}, length: ${prompt.length} chars)`);

      const response = await fetch(url, {
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }], role: 'user' }] }),
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        method: 'POST',
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as GeminiErrorResponse;
        const errorMessage = errorBody.error?.message ?? `HTTP ${response.status}`;
        const errorStatus = errorBody.error?.status ?? 'UNKNOWN';
        this.logger.error(`Gemini API error: [${errorStatus}] ${errorMessage} (HTTP ${response.status})`);
        throw new ServiceUnavailableException(`AI Assistant error: ${errorMessage}`);
      }

      const payload = (await response.json()) as GeminiResponse;
      const answer = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim();

      if (answer === undefined || answer.length === 0) {
        this.logger.warn('Gemini returned an empty response with no content candidates.');
        throw new ServiceUnavailableException('AI Assistant returned an empty response. Please try again.');
      }

      this.logger.log(`Gemini response received (${answer.length} chars)`);
      return answer;
    } catch (error: unknown) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error('Gemini API request timed out after 15 seconds.');
        throw new ServiceUnavailableException('AI Assistant request timed out. Please try again.');
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Unexpected Gemini error: ${message}`);
      throw new ServiceUnavailableException(`AI Assistant encountered an error: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
