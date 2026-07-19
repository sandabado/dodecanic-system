"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_ENVIRONMENT_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

type PublicEnvironmentKey = (typeof PUBLIC_ENVIRONMENT_KEYS)[number];

export interface SupabaseConfigurationError {
  code: "MISSING_PUBLIC_SUPABASE_ENV" | "INVALID_PUBLIC_SUPABASE_URL";
  message: string;
  missing: PublicEnvironmentKey[];
}

export type SupabaseBrowserConnection =
  | { ok: true; client: SupabaseClient; error: null }
  | { ok: false; client: null; error: SupabaseConfigurationError };

let browserClient: SupabaseClient | undefined;

function publicConfiguration():
  | { ok: true; url: string; publishableKey: string }
  | { ok: false; error: SupabaseConfigurationError } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const missing = PUBLIC_ENVIRONMENT_KEYS.filter((key) => {
    if (key === "NEXT_PUBLIC_SUPABASE_URL") return !url;
    return !publishableKey;
  });

  if (missing.length > 0) {
    return {
      ok: false,
      error: {
        code: "MISSING_PUBLIC_SUPABASE_ENV",
        message: `Supabase is not configured. Add ${missing.join(" and ")} to the public environment.`,
        missing,
      },
    };
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error();
  } catch {
    return {
      ok: false,
      error: {
        code: "INVALID_PUBLIC_SUPABASE_URL",
        message: "NEXT_PUBLIC_SUPABASE_URL must be an absolute HTTP(S) URL.",
        missing: [],
      },
    };
  }

  return { ok: true, url, publishableKey };
}

/**
 * Returns a singleton public Supabase client when configured. Missing settings
 * are data, not an import-time exception, so local builds remain operational.
 */
export function getSupabaseBrowserClient(): SupabaseBrowserConnection {
  const configuration = publicConfiguration();
  if (!configuration.ok) {
    return { ok: false, client: null, error: configuration.error };
  }

  browserClient ??= createClient(configuration.url, configuration.publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return { ok: true, client: browserClient, error: null };
}
