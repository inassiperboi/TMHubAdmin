// Client utilities for detail_schedule table operations
import { supabaseUrl, supabaseAnonKey } from "./client"

export interface DetailSchedule {
  id_detail_schedule: number
  status: string
  created_at: string
  tanggal: string
  id_schedule: number
  nama_user: string
  id_user: number
  keterangan: string
}

/**
 * Ambil semua data detail_schedule
 */
export async function getDetailSchedules(): Promise<DetailSchedule[]> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/detail_schedule?select=*&order=tanggal.desc`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch detail schedules:", response.status)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching detail schedules:", error)
    return []
  }
}

/**
 * Update status untuk satu record detail_schedule
 */
export async function getPendingStatusCount(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Some records use an empty string or null for the status (the UI placeholder is "Pilih Status" with value "").
    // Counting by exact status text via REST can miss those. Fetch today's rows and count in JS for robustness.
    // Use a date range (today >= start && < tomorrow) to cover timestamp values and timezone differences
    const start = new Date(today + "T00:00:00")
    const tomorrow = new Date(start)
    tomorrow.setDate(start.getDate() + 1)
    const startStr = start.toISOString().split('T')[0]
    const endStr = tomorrow.toISOString().split('T')[0]

    const response = await fetch(
      `${supabaseUrl}/rest/v1/detail_schedule?select=status&tanggal=gte.${startStr}&tanggal=lt.${endStr}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("[v0] Failed to fetch today's detail_schedule rows for pending count:", response.status);
      return 0;
    }

    const rows: Array<{ status: string | null }> = await response.json();
    // Consider a row pending if status is null, empty string, or the literal placeholder 'Pilih Status'
    const pending = rows.filter((r) => !r.status || r.status === "" || r.status === "Pilih Status").length;

    // Debugging: print rows to browser console to inspect actual status values when unexpected
    try {
      // eslint-disable-next-line no-console
      console.debug('[v0] getPendingStatusCount rows sample:', rows.slice(0, 10))
      // eslint-disable-next-line no-console
      console.debug('[v0] computed pending count:', pending)
    } catch (e) {
      // ignore
    }

    // Fallback: if no rows returned (possible date-format/timezone mismatch), fetch recent rows and filter locally
    if (rows.length === 0) {
      try {
        const fallbackResp = await fetch(`${supabaseUrl}/rest/v1/detail_schedule?select=status,tanggal&order=tanggal.desc&limit=1000`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
        })

        if (fallbackResp.ok) {
          const allRows: Array<{ status: string | null; tanggal?: string }> = await fallbackResp.json()
          const localCount = allRows.filter((r) => {
            if (!r.tanggal) return false
            const rowDate = new Date(r.tanggal).toISOString().split('T')[0]
            return rowDate === today && (!r.status || r.status === '' || r.status === 'Pilih Status')
          }).length

          // eslint-disable-next-line no-console
          console.debug('[v0] getPendingStatusCount fallback localCount:', localCount)
          return localCount
        }
      } catch (e) {
        // ignore fallback errors
      }
    }

    return pending;
  } catch (error) {
    console.error("[v0] Error fetching pending status count:", error);
    return 0;
  }
}

export async function getApprovedAttendanceCount(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${supabaseUrl}/rest/v1/detail_schedule?select=count&tanggal=eq.${today}&status=eq.Hadir Telah Disetujui`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "count=exact"
        },
      }
    );

    if (!response.ok) {
      console.error("[v0] Failed to fetch approved attendance count:", response.status);
      return 0;
    }

    const count = response.headers.get("content-range")?.split("/")[1];
    return count ? parseInt(count) : 0;
  } catch (error) {
    console.error("[v0] Error fetching approved attendance count:", error);
    return 0;
  }
}

/**
 * Hitung jumlah 'Ijin Disetujui' untuk tanggal hari ini
 */
export async function getApprovedIjinCount(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const status = encodeURIComponent('Ijin Disetujui');
    const response = await fetch(
      `${supabaseUrl}/rest/v1/detail_schedule?select=count&tanggal=eq.${today}&status=eq.${status}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "count=exact"
        },
      }
    );

    if (!response.ok) {
      console.error("[v0] Failed to fetch approved ijin count:", response.status);
      return 0;
    }

    const count = response.headers.get("content-range")?.split("/")[1];
    return count ? parseInt(count) : 0;
  } catch (error) {
    console.error("[v0] Error fetching approved ijin count:", error);
    return 0;
  }
}

/**
 * Ambil statistik kehadiran bulanan (jumlah kehadiran yang 'Hadir Telah Disetujui')
 * Mengembalikan array dengan objek { label: 'MMM YYYY', count: number } untuk `months` bulan terakhir (termasuk bulan ini)
 */
export async function getMonthlyAttendanceCounts(months = 6): Promise<Array<{ label: string; count: number }>> {
  try {
    const results: Array<{ label: string; count: number }> = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]
      const status = encodeURIComponent('Hadir Telah Disetujui')

      const url = `${supabaseUrl}/rest/v1/detail_schedule?select=count&tanggal=gte.${startStr}&tanggal=lt.${endStr}&status=eq.${status}`

      const response = await fetch(url, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'count=exact',
        },
      })

      if (!response.ok) {
        console.error('[v0] Failed to fetch monthly attendance count for', startStr, response.status)
        results.push({ label: d.toLocaleString('default', { month: 'short', year: 'numeric' }), count: 0 })
        continue
      }

      const count = response.headers.get('content-range')?.split('/')[1]
      results.push({ label: d.toLocaleString('default', { month: 'short', year: 'numeric' }), count: count ? parseInt(count) : 0 })
    }

    return results
  } catch (error) {
    console.error('[v0] Error fetching monthly attendance counts:', error)
    return []
  }
}

/**
 * Ambil statistik kehadiran bulanan untuk beberapa status.
 * Mengembalikan array [{ label: 'MMM YYYY', counts: { [status]: number } }]
 */
export async function getMonthlyAttendanceCountsByStatuses(
  statuses: string[] = ['Hadir Telah Disetujui', 'Hadir Tidak Disetujui', 'Ijin Ditolak', 'Ijin Disetujui'],
  months = 6,
  endDate?: string
): Promise<Array<{ label: string; counts: Record<string, number> }>> {
  try {
    const results: Array<{ label: string; counts: Record<string, number> }> = []
    const now = endDate ? new Date(endDate) : new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]

      const counts: Record<string, number> = {}

      for (const statusRaw of statuses) {
        const status = encodeURIComponent(statusRaw)
        const url = `${supabaseUrl}/rest/v1/detail_schedule?select=count&tanggal=gte.${startStr}&tanggal=lt.${endStr}&status=eq.${status}`

        const response = await fetch(url, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'count=exact',
          },
        })

        if (!response.ok) {
          console.error('[v0] Failed to fetch monthly count for', statusRaw, startStr, response.status)
          counts[statusRaw] = 0
          continue
        }

        const count = response.headers.get('content-range')?.split('/')[1]
        counts[statusRaw] = count ? parseInt(count) : 0
      }

      results.push({ label: d.toLocaleString('default', { month: 'short', year: 'numeric' }), counts })
    }

    return results
  } catch (error) {
    console.error('[v0] Error fetching monthly attendance counts by statuses:', error)
    return []
  }
}

/**
 * Hitung berapa banyak pegawai yang sudah absen hari ini (unik per id_user)
 */
export async function getTodayAttendanceCount(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const start = new Date(today + "T00:00:00")
    const tomorrow = new Date(start)
    tomorrow.setDate(start.getDate() + 1)
    const startStr = start.toISOString().split('T')[0]
    const endStr = tomorrow.toISOString().split('T')[0]

    const response = await fetch(
      `${supabaseUrl}/rest/v1/detail_schedule?select=id_user&tanggal=gte.${startStr}&tanggal=lt.${endStr}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      console.error('[v0] Failed to fetch today attendance rows:', response.status)
      return 0
    }

    const rows: Array<{ id_user?: number | null }> = await response.json()
    const unique = new Set<number>()
    rows.forEach((r) => {
      if (r.id_user != null) unique.add(r.id_user)
    })
    return unique.size
  } catch (error) {
    console.error('[v0] Error fetching today attendance count:', error)
    return 0
  }
}

export async function updateDetailScheduleStatus(id: number, status: string): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/detail_schedule?id_detail_schedule=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[v0] Failed to update status:", response.status, errText)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error updating status:", error)
    return false
  }
}
