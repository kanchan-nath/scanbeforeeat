import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default('scanbeforeeat'),
  DB_USER: z.string().default('scanbeforeeat_app'),
  DB_PASSWORD: z.string().default('scanbeforeeat_dev_2026'),
  DB_SOCKET_PATH: z.string().optional().default('/tmp/mysql_brew.sock'),
  DB_SSL: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),

  // Session
  SESSION_SECRET: z.string().min(16).default('scanbeforeeat_default_dev_session_secret_change_me_in_prod'),

  // NVIDIA NIM LLM API
  NVIDIA_API_KEY: z.string().optional().default(''),
  NVIDIA_API_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
  NVIDIA_MODEL: z.string().default('meta/llama-3.3-70b-instruct'),

  // Product Provider
  PRODUCT_DATA_PROVIDER: z.string().default('open_food_facts'),

  // AI Mock Mode (deterministic development and testing fallback)
  AI_MOCK_MODE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
}).refine((data) => {
  // In production, ensure SESSION_SECRET is strong and not default, and if not mock mode, NVIDIA_API_KEY is present
  if (data.NODE_ENV === 'production') {
    if (data.SESSION_SECRET.includes('change_me')) {
      return false;
    }
    if (!data.AI_MOCK_MODE && (!data.NVIDIA_API_KEY || data.NVIDIA_API_KEY.includes('replace_me'))) {
      return false;
    }
  }
  return true;
}, {
  message: 'Production configuration validation failed: ensure SESSION_SECRET and NVIDIA_API_KEY are configured with non-placeholder values.'
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment configuration validation failed:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export default env;
