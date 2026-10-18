/**
 * Environment validation utility
 * Ensures required Neon Postgres & application environment variables are set
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const requiredEnvVars: EnvVar[] = [
  {
    key: "DATABASE_URL",
    required: true,
    description: "Neon Postgres connection URL",
  },
  {
    key: "NEXT_PUBLIC_BASE_URL",
    required: true,
    description: "Base URL for the application",
  },
  {
    key: "OPENAI_API_KEY",
    required: false,
    description: "OpenAI API key (optional, enables AI features)",
  },
];

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value =
      envVar.key === "DATABASE_URL"
        ? process.env.DATABASE_URL || process.env.POSTGRES_URL
        : process.env[envVar.key];

    if (envVar.required && (!value || value.trim() === "")) {
      errors.push(`Missing required environment variable: ${envVar.key} (${envVar.description})`);
    }
  }

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (dbUrl && !dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl && !baseUrl.startsWith("http")) {
    errors.push("NEXT_PUBLIC_BASE_URL must be a valid HTTP/HTTPS URL");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

if (process.env.NODE_ENV === "development") {
  const result = validateEnvironment();
  if (!result.valid) {
    console.error("❌ Environment validation failed:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    console.error("Please check your .env.local file");
  } else {
    console.log("✅ Neon DB environment validation passed");
  }
}