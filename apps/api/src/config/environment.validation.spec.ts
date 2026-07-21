import { validateEnvironment } from './environment.validation';

const validEnvironment = {
  API_PREFIX: 'api/v1',
  CORS_ORIGIN: 'http://localhost:5173',
  BCRYPT_SALT_ROUNDS: '12',
  JWT_ACCESS_EXPIRES_IN: '900',
  JWT_ACCESS_SECRET: 'a-very-long-local-access-secret-that-is-at-least-32-characters',
  JWT_REFRESH_EXPIRES_IN: '604800',
  JWT_REFRESH_SECRET: 'a-very-long-local-refresh-secret-that-is-at-least-32-characters',
  LOG_LEVEL: 'info',
  MONGODB_DATABASE: 'stadiumsphere',
  MONGODB_URI: 'mongodb://localhost:27017',
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: '5000',
  NODE_ENV: 'test',
  PORT: '3000',
  RATE_LIMIT_MAX: '100',
  RATE_LIMIT_TTL_MS: '60000',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  SWAGGER_ENABLED: 'false',
};

describe('validateEnvironment', () => {
  it('parses the required persistence environment variables', () => {
    expect(validateEnvironment(validEnvironment)).toMatchObject({
      MONGODB_DATABASE: 'stadiumsphere',
      MONGODB_URI: 'mongodb://localhost:27017',
      GEMINI_MODEL: 'gemini-2.5-flash',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
    });
  });

  it('parses a single CORS_ORIGIN into an array', () => {
    const result = validateEnvironment(validEnvironment);
    expect(result.CORS_ORIGIN).toEqual(['http://localhost:5173']);
  });

  it('parses comma-separated CORS_ORIGIN into an array of validated URLs', () => {
    const result = validateEnvironment({
      ...validEnvironment,
      CORS_ORIGIN: 'http://localhost:5173, http://localhost:5175',
    });
    expect(result.CORS_ORIGIN).toEqual(['http://localhost:5173', 'http://localhost:5175']);
  });

  it('rejects invalid URLs in CORS_ORIGIN', () => {
    expect(() => validateEnvironment({
      ...validEnvironment,
      CORS_ORIGIN: 'not-a-url',
    })).toThrow();
  });

  it('rejects missing MongoDB and Redis configuration', () => {
    const invalidEnvironment: Record<string, string> = { ...validEnvironment };
    delete invalidEnvironment.MONGODB_URI;
    delete invalidEnvironment.REDIS_HOST;

    expect(() => validateEnvironment(invalidEnvironment)).toThrow();
  });
});

