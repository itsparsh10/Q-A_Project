// Supabase browser client removed. Frontend should call server API routes
// for authenticated actions. This stub throws to make usage explicit.
export function getSupabaseBrowser(): never {
  throw new Error(
    'Supabase has been removed. Call your backend API routes which use MongoDB instead.'
  );
}
