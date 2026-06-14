"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database.type";

export function createClient() {
  return createBrowserClient<Database, "public", Database["public"]>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  );
}
