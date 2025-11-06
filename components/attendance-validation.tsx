"use client"

import { useState, useEffect } from "react"
import {
  type DetailSchedule,
  getDetailSchedules,
  updateDetailScheduleStatus,
} from "@/lib/supabase/detail-schedule-client"

const STATUS_OPTIONS = ["Hadir Telah Disetujui", "Hadir Tidak Disetujui", "Ijin Ditolak", "Ijin Disetujui"]

export default function AttendanceValidation() {
  const [attendances, setAttendances] = useState<DetailSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState("")
  const [filterName, setFilterName] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    loadAttendances()
  }, [])

  const loadAttendances = async () => {
    setLoading(true)
    setError(null)
    const data = await getDetailSchedules()
    setAttendances(data)
    setLoading(false)
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!newStatus) return
    setUpdating(id)
    setError(null)

    const success = await updateDetailScheduleStatus(id, newStatus)

    if (success) {
      setAttendances(attendances.map((a) => (a.id_detail_schedule === id ? { ...a, status: newStatus } : a)))
      // Dispatch a global event so dashboard (and other consumers) can refresh counts
      try {
        window.dispatchEvent(new CustomEvent('detailScheduleUpdated'))
      } catch (e) {
        // ignore if window not available
      }
      alert("✅ Status berhasil diperbarui.")
    } else {
      setError("Gagal mengubah status. Coba lagi.")
    }

    setUpdating(null)
  }

  const filteredAttendances = attendances.filter((att) => {
    const matchDate = !filterDate || att.tanggal.includes(filterDate)
    const matchName = !filterName || att.nama_user.toLowerCase().includes(filterName.toLowerCase())
    const matchStatus = !filterStatus || att.status === filterStatus
    return matchDate && matchName && matchStatus
  })

  const uniqueDates = [...new Set(attendances.map((a) => a.tanggal))].sort().reverse()
  const uniqueNames = [...new Set(attendances.map((a) => a.nama_user))].sort()
  const uniqueStatuses = [...new Set(attendances.map((a) => a.status))].sort()

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Validasi Absensi</h1>
        <div className="text-center py-12 text-muted">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Validasi Absensi</h1>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari Nama..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="">Semua Tanggal</option>
          {uniqueDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="">Semua Status</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {(filterDate || filterName || filterStatus) && (
        <div className="mb-4">
          <button
            onClick={() => {
              setFilterDate("")
              setFilterName("")
              setFilterStatus("")
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Bersihkan Filter
          </button>
        </div>
      )}

      {/* Tabel Absensi */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {filteredAttendances.length === 0 ? (
          <div className="p-8 text-center text-muted">Tidak ada data absensi yang sesuai dengan filter</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#2AB77A] border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Keterangan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.map((attendance) => (
                <tr
                  key={attendance.id_detail_schedule}
                  className="border-b border-border hover:bg-background/50 transition-colors"
                >
                  <td className="px-6 py-4 text-foreground font-medium">{attendance.nama_user}</td>
                  <td className="px-6 py-4 text-foreground">{attendance.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {attendance.status || "Belum Ditetapkan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground text-sm">{attendance.keterangan || "-"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={attendance.status || ""}
                      onChange={(e) => handleStatusChange(attendance.id_detail_schedule, e.target.value)}
                      disabled={updating === attendance.id_detail_schedule}
                      className={`px-3 py-1 border border-border rounded text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer ${
                        !attendance.status ? "text-gray-400 italic" : ""
                      }`}
                    >
                      <option value="">Pilih Status</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {updating === attendance.id_detail_schedule && (
                      <span className="ml-2 text-xs text-muted animate-pulse">⏳ Menyimpan...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-sm text-muted">
        Ditampilkan: {filteredAttendances.length} dari {attendances.length} data
      </div>
    </div>
  )
}
