// Using REST API to fetch attendance data from Supabase
// Consistent with other client files in the project

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stsukntjvdvmjeimfunp.supabase.co"

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c3VrbnRqdmR2bWplaW1mdW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzEyMDQsImV4cCI6MjA3NzQwNzIwNH0.t9llt1DCORI9KdU8yIx2gPn5J_NN8JOLonhdmWfcgbI"

export interface DetailSchedule {
  id_detail_schedule: number
  status: string // Status dari database: "Hadir", "Terlambat", atau "Absen"
  tanggal: string
  id_user: number
  nama_user: string
  id_schedule: number
  keterangan: string
  created_at: string
}

export async function fetchAttendanceData(): Promise<DetailSchedule[]> {
  try {
    const query = "select=*&order=tanggal.desc"

    const response = await fetch(`${supabaseUrl}/rest/v1/detail_schedule?${query}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Error fetching attendance data:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    console.log("[v0] Attendance data fetched:", data?.length || 0, "records")
    return data || []
  } catch (err) {
    console.error("[v0] Error in fetchAttendanceData:", err)
    return []
  }
}

export function getStatusColor(status: string): string {
  const statusLower = status?.toLowerCase() || ""

  if (statusLower.includes("hadir")) {
    return "bg-green-100 text-green-700"
  } else if (statusLower.includes("terlambat") || statusLower.includes("late")) {
    return "bg-yellow-100 text-yellow-700"
  } else if (statusLower.includes("absen")) {
    return "bg-red-100 text-red-700"
  }

  return "bg-gray-100 text-gray-700"
}

export function getStatusLabel(status: string): string {
  const statusLower = status?.toLowerCase() || ""

  if (statusLower.includes("hadir")) {
    return "Hadir"
  } else if (statusLower.includes("terlambat") || statusLower.includes("late")) {
    return "Terlambat"
  } else if (statusLower.includes("absen")) {
    return "Absen"
  }

  return status // Return original status jika tidak cocok dengan mapping
}
