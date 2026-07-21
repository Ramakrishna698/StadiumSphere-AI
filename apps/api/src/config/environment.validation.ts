import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'qa', 'staging', 'production', 'test']),
  PORT: z.coerce.number().int().min(1).max(65_535),
  API_PREFIX: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  CORS_ORIGIN: z.string().min(1).transform((value) =>
    value.split(',').map((origin) => origin.trim()),
  ).pipe(z.array(z.string().url()).min(1)),
  MONGODB_URI: z.string().url(),
  MONGODB_DATABASE: z.string().min(1),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive(),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().min(1).max(65_535),
  REDIS_PASSWORD: z.string().min(1).optional(),
  RATE_LIMIT_TTL_MS: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.coerce.number().int().positive(),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.coerce.number().int().positive(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14),
  SWAGGER_ENABLED: z.enum(['true', 'false']).transform((value) => value === 'true'),
});

export type ApiEnvironment = z.infer<typeof environmentSchema>;

export function validateEnvironment(environment: Record<string, unknown>): ApiEnvironment {
  return environmentSchema.parse(environment);
}
