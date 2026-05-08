/**
 * Environment validation utility
 * Ensures all required environment variables are set at startup
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const requiredEnvVars: EnvVar[] = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key'
  },
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    required: true,
    description: 'Base URL for the application'
  },
  {
    key: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (optional, enables AI features)'
  }
];

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.key];

    if (envVar.required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${envVar.key} (${envVar.description})`);
    }
  }

  // Additional validation for URLs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl && !baseUrl.startsWith('http')) {
    errors.push('NEXT_PUBLIC_BASE_URL must be a valid HTTP/HTTPS URL');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate on module load in development
if (process.env.NODE_ENV === 'development') {
  const result = validateEnvironment();
  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    console.error('Please check your .env.local file');
  } else {
    console.log('✅ Environment validation passed');
  }
}