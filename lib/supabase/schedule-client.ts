// Schedule management client - handles CRUD operations for schedules
// Uses REST API to Supabase

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stsukntjvdvmjeimfunp.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c3VrbnRqdmR2bWplaW1mdW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzEyMDQsImV4cCI6MjA3NzQwNzIwNH0.t9llt1DCORI9KdU8yIx2gPn5J_NN8JOLonhdmWfcgbI"

export interface Schedule {
  id_schedule: number
  nama_hari: string
  tanggal: string
  created_at: string
  di_user: string | null
}

export async function fetchSchedules(
  page = 1,
  limit = 10,
  search = "",
  sortBy = "tanggal",
  sortOrder: "asc" | "desc" = "asc",
) {
  try {
    const offset = (page - 1) * limit

    let query = `select=*`
    if (search) {
      query += `&or=(nama_hari.ilike.%25${encodeURIComponent(search)}%25,tanggal.ilike.%25${encodeURIComponent(search)}%25)`
    }

    query += `&order=${sortBy}.${sortOrder}&limit=${limit}&offset=${offset}`

    const response = await fetch(`${supabaseUrl}/rest/v1/schedule?${query}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Fetch schedules failed:", response.status, response.statusText)
      return { data: [], total: 0 }
    }

    const data = await response.json()

    // Get total count
    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/schedule?select=count()${search ? `&or=(nama_hari.ilike.%25${encodeURIComponent(search)}%25,tanggal.ilike.%25${encodeURIComponent(search)}%25)` : ""}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          Prefer: "count=exact",
        },
      },
    )

    const total = countResponse.headers.get("content-range")?.split("/")[1] || "0"

    return { data, total: Number.parseInt(total) }
  } catch (error) {
    console.error("[v0] Error fetching schedules:", error)
    return { data: [], total: 0 }
  }
}

export async function createSchedule(schedule: Omit<Schedule, "id_schedule" | "created_at">) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/schedule`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(schedule),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Create schedule failed:", error)
      return { success: false, error: error.message }
    }

    const data = await response.json()
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("[v0] Error creating schedule:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateSchedule(
  id_schedule: number,
  schedule: Partial<Omit<Schedule, "id_schedule" | "created_at">>,
) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/schedule?id_schedule=eq.${id_schedule}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(schedule),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Update schedule failed:", error)
      return { success: false, error: error.message }
    }

    const data = await response.json()
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("[v0] Error updating schedule:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteSchedule(id_schedule: number) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/schedule?id_schedule=eq.${id_schedule}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Delete schedule failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting schedule:", error)
    return { success: false, error: String(error) }
  }
}
