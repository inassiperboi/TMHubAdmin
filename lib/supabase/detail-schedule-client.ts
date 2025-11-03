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
