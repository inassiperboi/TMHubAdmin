// Using direct REST API calls to Supabase without external dependencies
// This ensures we don't have module resolution errors

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stsukntjvdvmjeimfunp.supabase.co"
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c3VrbnRqdmR2bWplaW1mdW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzEyMDQsImV4cCI6MjA3NzQwNzIwNH0.t9llt1DCORI9KdU8yIx2gPn5J_NN8JOLonhdmWfcgbI"

export async function queryUsers(username: string) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=*`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Query failed:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("[v0] Error querying users:", error)
    return null
  }
}
