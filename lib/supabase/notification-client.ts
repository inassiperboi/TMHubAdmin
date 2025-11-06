import { supabaseUrl, supabaseAnonKey } from "./client"

export interface Notification {
  id_notifikasi?: number
  judul: string
  keterangan: string
  created_at?: string
}

export async function addNotification(payload: { judul: string; keterangan: string }): Promise<{ success: boolean; data?: Notification; error?: string }> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/notifikasi`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[v0] Failed to insert notification:", response.status, errText)
      return { success: false, error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("[v0] Error inserting notification:", error)
    return { success: false, error: String(error) }
  }
}
